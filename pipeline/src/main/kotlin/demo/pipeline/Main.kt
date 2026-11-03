package demo.pipeline

import androidx.compose.remote.core.CoreDocument
import androidx.compose.remote.core.Operation
import androidx.compose.remote.core.RemoteComposeBuffer
import androidx.compose.remote.core.operations.Header
import androidx.compose.remote.creation.json.RemoteComposeJsonParser
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.nio.file.Files
import java.nio.file.Path
import java.security.MessageDigest
import kotlin.system.exitProcess

/** Small CLI proof; publishing and the visual editor intentionally come later. */
fun main(args: Array<String>) {
    if(args.firstOrNull() == "serve") {
        val project = Path.of(System.getenv("RC_PROJECT_ROOT") ?: ".").toAbsolutePath().normalize()
        val backend = Backend(args.getOrNull(1)?.toInt() ?: 8080,
            Path.of(args.getOrNull(2) ?: "data/documents"), project, System.getenv("RC_BIND_HOST") ?: "127.0.0.1")
        Runtime.getRuntime().addShutdownHook(Thread { backend.close() })
        backend.start()
        println("Remote Compose backend: http://127.0.0.1:${backend.port}")
        return
    }
    if (args.size != 2) {
        System.err.println("Usage: remote-compose-prototype INPUT.json OUTPUT.rc")
        exitProcess(2)
    }
    try {
        val source = Files.readString(Path.of(args[0]))
        val bytes = compile(source)
        val metadata = inspect(bytes)
        val output = Path.of(args[1]).toAbsolutePath()
        Files.createDirectories(output.parent)
        Files.write(output, bytes)
        Files.writeString(Path.of("$output.metadata.json"), metadata.toString(2) + "\n")
        println(metadata.toString(2))
    } catch (error: Exception) {
        System.err.println(JSONObject().put("error", error.message ?: error.javaClass.name))
        exitProcess(1)
    }
}

fun compile(source: String): ByteArray {
    val root = JSONObject(source)
    require(root.has("root")) { "Document must contain root" }
    val encoded = RemoteComposeJsonParser.parseToByteBuffer(source)
    return ByteArray(encoded.remaining()).also { encoded.get(it) }
}

fun inspect(bytes: ByteArray): JSONObject {
    val header = Header.readDirect(ByteArrayInputStream(bytes))
    val document = CoreDocument()
    document.initFromBuffer(RemoteComposeBuffer.fromInputStream(ByteArrayInputStream(bytes)))
    val operations = arrayListOf<Operation>()
    RemoteComposeBuffer.fromInputStream(ByteArrayInputStream(bytes)).inflateFromBuffer(operations)
    return JSONObject()
        .put("width", header.getInt(Header.DOC_WIDTH.toInt(), 256))
        .put("height", header.getInt(Header.DOC_HEIGHT.toInt(), 256))
        .put("profiles", header.profiles)
        .put("header", header.toString())
        .put("bytes", bytes.size)
        .put("sha256", MessageDigest.getInstance("SHA-256").digest(bytes)
            .joinToString("") { "%02x".format(it) })
        .put("operations", operations.map { it.javaClass.simpleName })
}
