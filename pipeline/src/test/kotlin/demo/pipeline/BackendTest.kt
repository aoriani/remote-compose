package demo.pipeline

import org.junit.Assert.*
import org.junit.Test
import org.json.JSONObject
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.nio.file.Path
import java.util.concurrent.CompletableFuture

class BackendTest {
    private val sample = Files.readString(Path.of("../samples/minimal-canvas.json"))
    private fun invalid(source: String, code: String, path: String) {
        val e = assertThrows(InvalidDocument::class.java) { compileValidated(source) }
        assertEquals(code,e.diagnostics.first().code)
        assertEquals(path,e.diagnostics.first().path)
    }
    @Test fun distinguishesSyntaxFromUnsupportedOperations() {
        invalid("{'root':{}}", "MALFORMED_JSON", "")
        invalid("""{"root":{},"root":{}}""", "MALFORMED_JSON", "")
        invalid(sample + " {}", "MALFORMED_JSON", "")
        invalid("""{"root":{"type":"productCarousel"}}""", "UNSUPPORTED_OPERATION", "/root/type")
    }
    @Test fun rejectsSilentlyIgnoredPropertiesAndCommands() {
        invalid(sample.replace("\"radius\": 64", "\"raduis\": 64"), "INVALID_PROPERTY", "/root/commands/1/raduis")
        invalid(sample.replace("\"width\": 390 }", "\"unknown\": 390 }"), "UNSUPPORTED_OPERATION", "/root/modifiers/0/unknown")
        invalid(sample.replace("drawCircle", "drawUnicorn"), "UNSUPPORTED_OPERATION", "/root/commands/1/type")
    }
    @Test fun nestedCustomPrimitiveCompositionIsUnchanged() {
        val original = JSONObject(sample).getJSONObject("root")
        val source = JSONObject().put("root", JSONObject().put("type","box").put("children", listOf(original))).toString()
        val before = JSONObject(source).toString()
        val bytes = compileValidated(source)
        assertTrue(inspect(bytes).getJSONArray("operations").toList().contains("DrawCircle"))
        assertEquals(before,JSONObject(source).toString())
    }
    @Test fun checksNestedTypesAndShorthandLocations() {
        invalid("""{"root":{"column":{"children":[{"type":"text","value":"x","fontSize":false}]}}}""", "INVALID_PROPERTY", "/root/column/children/0/fontSize")
        invalid("""{"root":{"type":"canvas","commands":[{"type":"paint","ops":[{"mystery":1}]}]}}""", "INVALID_PROPERTY", "/root/commands/0/ops/0/mystery")
        invalid("""{"root":{"type":"box","children":{}}}""", "INVALID_PROPERTY", "/root/children")
    }
    @Test fun rejectsUnsupportedProfilesAndLimits() {
        invalid(sample.replace("\"width\": 390,", "\"width\": 5000,"), "INVALID_PROPERTY", "/header/width")
        invalid(sample.replace("\"height\": 844\n", "\"height\": 844, \"compress\": true\n"), "INVALID_PROPERTY", "/header/compress")
    }
    @Test fun bitmapAdapterEmitsActualEmbeddedResourceOperations() {
        val source = """{"header":{"profiles":512},"root":{"type":"canvas","commands":[{"type":"addBitmap","image":"club-bag","varName":"photo"},{"type":"drawBitmap","image":"@photo","left":0,"top":0,"right":120,"bottom":120}]}}"""
        val operations = inspect(compileValidated(source)).getJSONArray("operations").toList()
        assertTrue(operations.any { it.toString().contains("BitmapData") })
        invalid(source.replace("club-bag","missing-asset"), "UNSUPPORTED_OPERATION", "/root/commands/0/image")
    }
    @Test fun rejectsUnverifiedSvgPathEncodingAndPermitsShaderReset() {
        invalid("""{"root":{"type":"canvas","commands":[{"type":"drawPath","path":"M 0 0 L 20 20 Z"}]}}""", "UNSUPPORTED_OPERATION", "/root/commands/0/type")
        compileValidated("""{"root":{"type":"canvas","commands":[{"type":"paint","ops":[{"shader":0},{"color":"#FFFFFF"}]}]}}""")
    }
    @Test fun validShorthandAndInvalidFloatBounds() {
        compileValidated("""{"header":{"profiles":512},"root":{"column":{"children":[{"text":"Uncatalogued shorthand"}]}}}""")
        invalid(sample.replace("\"radius\": 64", "\"radius\": 1e300"), "INVALID_PROPERTY", "/root/commands/1/radius")
        invalid(sample.replace("\"radius\": 64", "\"radius\": \"NaN\""), "INVALID_PROPERTY", "/root/commands/1/radius")
    }
    @Test fun previewPublishAndFailurePreservationThroughHttp() {
        val data = Files.createTempDirectory("rc-http-test")
        val project = Path.of("..").toAbsolutePath().normalize()
        val client = HttpClient.newHttpClient()
        Backend(0,data,project).use { backend ->
            backend.start()
            fun request(path: String, body: String? = null, etag: String? = null): HttpResponse<ByteArray> {
                val builder = HttpRequest.newBuilder(URI("http://127.0.0.1:${backend.port}$path"))
                if(body != null) builder.POST(HttpRequest.BodyPublishers.ofString(body))
                if(etag != null) builder.header("If-None-Match",etag)
                return client.send(builder.build(),HttpResponse.BodyHandlers.ofByteArray())
            }
            assertEquals(404,request("/api/documents/latest").statusCode())
            assertEquals(200,request("/api/compile",sample).statusCode())
            assertEquals(404,request("/api/documents/latest").statusCode())
            assertEquals(201,request("/api/publish",sample).statusCode())
            val first = request("/api/documents/latest")
            assertArrayEquals(compile(sample),first.body())
            assertEquals("1",first.headers().firstValue("X-Document-Version").get())
            val etag = first.headers().firstValue("ETag").get()
            assertEquals(304,request("/api/documents/latest",etag=etag).statusCode())
            assertEquals(400,request("/api/publish","{").statusCode())
            val error = request("/api/publish",sample.replace("drawCircle","unknown"))
            assertEquals(422,error.statusCode())
            assertTrue(error.body().toString(Charsets.UTF_8).contains("/root/commands/1/type"))
            assertArrayEquals(first.body(),request("/api/documents/latest").body())
            assertEquals(201,request("/api/publish",sample.replace("\"radius\": 64","\"radius\": 32")).statusCode())
            assertEquals(2,JSONObject(request("/api/documents/latest/metadata").body().toString(Charsets.UTF_8)).getInt("version"))
            assertArrayEquals(first.body(),request("/api/documents/1").body())
            assertEquals(sample,request("/api/documents/1/source").body().toString(Charsets.UTF_8))
            assertEquals(2,DocumentStore(data).read()!!.metadata.getInt("version"))
        }
    }
    @Test fun concurrentPublicationProducesImmutableUniqueVersions() {
        val store = DocumentStore(Files.createTempDirectory("rc-store-test"))
        val bytes = compileValidated(sample)
        val work = (1..8).map { CompletableFuture.supplyAsync { store.publish(sample,bytes).metadata.getLong("version") } }
        assertEquals((1L..8L).toSet(), work.map { it.join() }.toSet())
        for(v in 1L..8L) assertArrayEquals(bytes,store.read(v)!!.bytes)
    }
}
