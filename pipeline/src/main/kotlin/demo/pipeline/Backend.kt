package demo.pipeline

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import org.json.JSONObject
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.FileChannel
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption.ATOMIC_MOVE
import java.nio.file.StandardOpenOption.*
import java.time.Instant
import java.util.Base64
import java.util.concurrent.Executors

fun compileValidated(source: String): ByteArray {
    Validation.parse(source)
    return try { compile(source).also { inspect(it) } }
    catch (e: Exception) {
        throw InvalidDocument(listOf(Diagnostic("COMPILATION_ERROR", "/root", e.message ?: "Upstream compilation failed")))
    }
}

data class Published(val source: String, val bytes: ByteArray, val metadata: JSONObject)

/** One atomically committed file per version contains matching source, bytes and metadata. */
class DocumentStore(private val directory: Path) {
    init { Files.createDirectories(directory) }
    @Synchronized fun publish(source: String, bytes: ByteArray): Published {
        FileChannel.open(directory.resolve("publish.lock"), CREATE, WRITE).use { channel ->
            channel.lock().use {
                val version = (latestVersion() ?: 0L) + 1
                val metadata = inspect(bytes).put("version", version)
                    .put("publishedAt", Instant.now().toString())
                    .put("compilerRevision", "8932b2c2b5043cc40c46a44cfd04a1671ec50fb7")
                val value = JSONObject().put("source", source).put("metadata", metadata)
                    .put("binary", Base64.getEncoder().encodeToString(bytes)).toString()
                val temp = Files.createTempFile(directory, "publish-", ".tmp")
                try {
                    FileChannel.open(temp, WRITE).use { file ->
                        val data = ByteBuffer.wrap(value.toByteArray(Charsets.UTF_8))
                        while (data.hasRemaining()) file.write(data)
                        file.force(true)
                    }
                    Files.move(temp, directory.resolve("$version.json"), ATOMIC_MOVE)
                } finally { Files.deleteIfExists(temp) }
                return Published(source, bytes, metadata)
            }
        }
    }
    private fun latestVersion(): Long? = Files.list(directory).use { paths ->
        paths.map { it.fileName.toString().removeSuffix(".json").toLongOrNull() ?: 0L }
            .max(Long::compareTo).orElse(0L).takeIf { it > 0 }
    }
    @Synchronized fun read(version: Long? = null): Published? {
        val selected = version ?: latestVersion() ?: return null
        val path = directory.resolve("$selected.json")
        if (!Files.exists(path)) return null
        val data = JSONObject(Files.readString(path))
        return Published(data.getString("source"), Base64.getDecoder().decode(data.getString("binary")), data.getJSONObject("metadata"))
    }
}

class Backend(port: Int, data: Path, private val project: Path, host: String = "127.0.0.1") : AutoCloseable {
    val store = DocumentStore(data)
    private val executor = Executors.newFixedThreadPool(4)
    private val server = HttpServer.create(InetSocketAddress(host, port), 0)
    val port: Int get() = server.address.port
    init {
        server.executor = executor
        server.createContext("/") { exchange ->
            try { route(exchange) }
            catch (e: InvalidDocument) { json(exchange, if (e.diagnostics.first().code == "MALFORMED_JSON") 400 else 422, e.json()) }
            catch (e: Exception) {
                System.err.println("${exchange.requestMethod} ${exchange.requestURI}: ${e.message}")
                json(exchange, 500, JSONObject().put("errors", listOf(mapOf("code" to "SERVER_ERROR", "path" to "", "message" to "Request failed; published document was not replaced"))))
            } finally { exchange.close() }
        }
    }
    fun start() { server.start() }
    override fun close() { server.stop(0); executor.shutdownNow() }
    private fun body(x: HttpExchange): String {
        val bytes = x.requestBody.readNBytes(1_048_577)
        if (bytes.size > 1_048_576) throw InvalidDocument(listOf(Diagnostic("LIMIT_EXCEEDED", "", "Document exceeds 1 MiB")))
        return bytes.toString(Charsets.UTF_8)
    }
    private fun send(x: HttpExchange, status: Int, bytes: ByteArray, type: String) {
        x.responseHeaders.set("Content-Type", type)
        x.responseHeaders.set("Cache-Control", "no-cache")
        x.responseHeaders.set("X-Content-Type-Options", "nosniff")
        x.sendResponseHeaders(status, if(status == 304 || status == 204) -1 else bytes.size.toLong())
        if(status != 304 && status != 204) x.responseBody.write(bytes)
    }
    private fun json(x: HttpExchange, status: Int, value: JSONObject) = send(x, status, value.toString().toByteArray(), "application/json; charset=utf-8")
    private fun route(x: HttpExchange) {
        val path = x.requestURI.path
        val method = x.requestMethod
        if(path == "/api/compile" || path == "/api/publish") {
            if(method != "POST") { x.responseHeaders.set("Allow", "POST"); json(x,405,JSONObject().put("error","Use POST")); return }
            val source = body(x)
            val bytes = compileValidated(source)
            if(path.endsWith("compile")) {
                val metadata = inspect(bytes)
                x.responseHeaders.set("X-Document-SHA256", metadata.getString("sha256"))
                send(x,200,bytes,"application/octet-stream")
            } else json(x,201,store.publish(source,bytes).metadata)
            return
        }
        if (method != "GET") { json(x,405,JSONObject().put("error","Use GET")); return }
        if(path.startsWith("/api/documents/")) {
            val match = Regex("/api/documents/(latest|[1-9][0-9]*)(/metadata|/source)?").matchEntire(path)
            if(match == null) { json(x,404,JSONObject().put("error","Unknown document route")); return }
            val published = store.read(match.groupValues[1].toLongOrNull())
            if(published == null) { json(x,404,JSONObject().put("error","No published document")); return }
            val etag = "\"${published.metadata.getString("sha256")}\""
            x.responseHeaders.set("ETag",etag)
            x.responseHeaders.set("X-Document-Version",published.metadata.getLong("version").toString())
            x.responseHeaders.set("X-Document-SHA256",published.metadata.getString("sha256"))
            when(match.groupValues[2]) {
                "/metadata" -> json(x,200,published.metadata)
                "/source" -> send(x,200,published.source.toByteArray(),"application/json; charset=utf-8")
                else -> if(x.requestHeaders.getFirst("If-None-Match") == etag) send(x,304,byteArrayOf(),"application/octet-stream")
                    else send(x,200,published.bytes,"application/octet-stream")
            }
            return
        }
        val file = when {
            path == "/" -> project.resolve("web-editor/index.html")
            path == "/player.js" -> project.resolve("upstream/experiments/players/typescript/web-player/bundle.js")
            path.startsWith("/editor/") -> project.resolve("web-editor").resolve(path.removePrefix("/editor/")).normalize()
                .takeIf { it.startsWith(project.resolve("web-editor")) }
            path.startsWith("/samples/") && path.endsWith(".json") -> project.resolve(path.removePrefix("/")).normalize()
                .takeIf { it.startsWith(project.resolve("samples")) }
            else -> null
        }
        if(file == null || !file.startsWith(project) || !Files.isRegularFile(file)) {
            json(x,404,JSONObject().put("error","Not found")); return
        }
        val mime = when(file.toString().substringAfterLast('.')) {
            "html" -> "text/html; charset=utf-8"; "js", "mjs" -> "text/javascript"; "css" -> "text/css"; "json" -> "application/json"; else -> "application/octet-stream"
        }
        send(x,200,Files.readAllBytes(file),mime)
    }
}
