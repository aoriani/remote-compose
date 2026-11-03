package demo.pipeline

import androidx.compose.remote.creation.json.RemoteComposeJsonParser
import org.json.JSONException
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import java.nio.file.Files
import java.nio.file.Path

class CompilationTest {
    private val sample = Files.readString(Path.of("../samples/minimal-canvas.json"))

    @Test fun compilesAndDecodesRealOperations() {
        val bytes = compile(sample)
        val metadata = inspect(bytes)
        assertTrue(bytes.size > 0)
        assertEquals(390, metadata.getInt("width"))
        assertEquals(844, metadata.getInt("height"))
        assertTrue(metadata.getJSONArray("operations").toList().contains("DrawCircle"))
        assertArrayEquals(bytes, compile(sample))
        assertArrayEquals(bytes, RemoteComposeJsonParser.parseToByteBuffer(sample).array())
    }

    @Test fun primitiveChangesChangeBinary() {
        val changed = JSONObject(sample)
        changed.getJSONObject("root").getJSONArray("commands")
            .getJSONObject(1).put("radius", 24)
        assertFalse(compile(sample).contentEquals(compile(changed.toString())))
    }

    @Test fun malformedJsonAndUnknownComponentsFail() {
        assertThrows(JSONException::class.java) { compile("{") }
        assertThrows(IllegalArgumentException::class.java) { compile("{}") }
        val failure = assertThrows(JSONException::class.java) {
            compile("""{"root":{"type":"businessWidgetThatDoesNotExist"}}""")
        }
        assertTrue(failure.message!!.contains("Unknown component type"))
        assertTrue(failure.message!!.contains("ContextPath"))
    }

    @Test fun missingDrawingFieldsFail() {
        assertThrows(JSONException::class.java) {
            compile("""{"root":{"type":"canvas","commands":[{"type":"drawCircle"}]}}""")
        }
    }

    // These are characterization tests, not behavior a future validation layer should allow.
    @Test fun upstreamSilentlyIgnoresUnknownModifiersAndCommands() {
        val original = compile(sample)
        val changed = JSONObject(sample)
        val canvas = changed.getJSONObject("root")
        canvas.getJSONArray("modifiers").put(JSONObject("""{"unknownModifier":123}"""))
        canvas.getJSONArray("commands").put(JSONObject("""{"type":"unknownCommand"}"""))
        assertArrayEquals(original, compile(changed.toString()))
    }

    @Test fun declaredProfilesSurviveEncoding() {
        val changed = JSONObject(sample)
        changed.getJSONObject("header").put("profiles", 512)
        assertEquals(512, inspect(compile(changed.toString())).getInt("profiles"))
    }
}
