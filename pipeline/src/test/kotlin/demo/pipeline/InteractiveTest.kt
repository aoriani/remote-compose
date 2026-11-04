package demo.pipeline

import org.junit.Assert.*
import org.junit.Test
import java.nio.file.Files
import java.nio.file.Path

class InteractiveTest {
    @Test fun interactivePrimitiveDocumentCompilesDeterministically() {
        val source=Files.readString(Path.of("../samples/interactive-retail.json"))
        val a=compileValidated(source)
        assertArrayEquals(a,compileValidated(source))
        val ops=inspect(a).getJSONArray("operations").toList().joinToString()
        assertTrue(ops.contains("ValueFloatExpressionChange"))
        assertTrue(ops.contains("HostNamedAction"))
        assertTrue(ops.contains("TextFromFloat"))
    }
    @Test fun formattedFloatHasStrictPropertyDiagnostics() {
        val source="""{"root":{"type":"variable","name":"count","value":{"type":"textFromFloat","value":3,"decimal":-1}}}"""
        val error=assertThrows(InvalidDocument::class.java){compileValidated(source)}
        assertEquals("/root/value/decimal",error.diagnostics.first().path)
        val unsupported=source.replace("textFromFloat","callBusinessFunction")
        assertThrows(InvalidDocument::class.java){compileValidated(unsupported)}
    }
    @Test fun expressionActionsRejectLiteralThatWouldEncodeInvalidExpressionId() {
        val source="""{"root":{"type":"canvas","modifiers":[{"onClick":{"type":"ValueFloatExpressionChange","targetId":"@counter","value":3}}]}}"""
        val error=assertThrows(InvalidDocument::class.java){compileValidated(source)}
        assertEquals("/root/modifiers/0/onClick/value",error.diagnostics.first().path)
    }

}
