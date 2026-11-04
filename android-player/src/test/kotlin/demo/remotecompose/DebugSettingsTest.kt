package demo.remotecompose

import org.junit.Assert.*
import org.junit.Test

class DebugSettingsTest {
    @Test fun acceptsNetworkServers() {
        listOf("http://127.0.0.1:8080", "https://example.org/demo/", " http://localhost:8092 ", "http://[::1]:8080")
            .forEach { assertNull(it, DebugSettings.backendError(it)) }
    }
    @Test fun rejectsUnsupportedOrAmbiguousEndpoints() {
        listOf("", "localhost:8080", "ftp://example.org", "http://", "https://user:secret@example.org",
            "https://example.org?draft=true", "https://example.org#fragment", "http://example.org:0",
            "http://example.org:65536", "http://bad host", "http://example.org:-2")
            .forEach { assertNotNull(it, DebugSettings.backendError(it)) }
    }
    @Test fun intervalIsBoundedAndIntegral() {
        listOf("2", "5", "300").forEach { assertNull(DebugSettings.intervalError(it)) }
        listOf("", "1", "301", "-1", "2.5", "abc", "99999999999").forEach { assertNotNull(DebugSettings.intervalError(it)) }
    }
}
