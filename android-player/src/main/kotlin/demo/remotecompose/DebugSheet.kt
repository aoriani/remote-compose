package demo.remotecompose

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import java.net.URI

/** A snapshot of generic player diagnostics, never document-specific UI. */
data class DebugInfo(
    val backend: String = "", val interval: Int = 5, val autoRefresh: Boolean = true,
    val version: String = "none", val bytes: Int = 0, val sha: String = "",
    val header: String = "", val viewport: String = "", val status: String = "Loading…",
    val fetching: Boolean = false, val events: List<String> = emptyList()
)

interface DebugActions {
    fun apply(backend: String, interval: Int, autoRefresh: Boolean)
    fun clearEvents()
}

/** Pure validation shared by the form and unit tests. Draft errors never change player state. */
object DebugSettings {
    fun backendError(value: String): String? = try {
        val uri = URI(value.trim())
        if (uri.scheme !in listOf("http", "https") || uri.host.isNullOrBlank() ||
            uri.rawUserInfo != null || uri.rawQuery != null || uri.rawFragment != null ||
            uri.port !in -1..65535 || uri.port == 0)
            "Enter an http:// or https:// server URL without credentials, query or fragment."
        else null
    } catch (_: Exception) { "Enter a valid server URL, for example http://127.0.0.1:8080." }

    fun intervalError(value: String): String? =
        if (value.toIntOrNull() in 2..300) null else "Use a whole number from 2 to 300 seconds."
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun DebugSheet(state: PlayerChrome.State, actions: DebugActions) {
    val sheet = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val dismiss: () -> Unit = { scope.launch { sheet.hide(); state.debugVisible = false }; Unit }
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val tabState = rememberSaveableStateHolder()
    ModalBottomSheet(
        onDismissRequest = { state.debugVisible = false }, sheetState = sheet,
        containerColor = MaterialTheme.colorScheme.surface,
        modifier = Modifier.testTag("debugSheet")
    ) {
        Column(Modifier.fillMaxWidth().fillMaxHeight(.86f)) {
            Row(Modifier.fillMaxWidth().padding(start = 24.dp, end = 12.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Player debug", style = MaterialTheme.typography.headlineSmall)
                    Text("Connection, document & host events", style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                IconButton(onClick = dismiss) { Icon(Icons.Outlined.Close, "Close debug") }
            }
            Spacer(Modifier.height(20.dp))
            ScrollableTabRow(selectedTabIndex = tab, edgePadding = 16.dp) {
                listOf("Connection", "Document", "Events").forEachIndexed { index, title ->
                    Tab(selected = tab == index, onClick = { tab = index }, text = { Text(title, maxLines = 1, softWrap = false) },
                        unselectedContentColor = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            tabState.SaveableStateProvider(tab) {
                when (tab) {
                    0 -> ConnectionPanel(state.debugInfo, actions)
                    1 -> DocumentPanel(state.debugInfo)
                    2 -> EventsPanel(state.debugInfo.events, actions)
                }
            }
        }
    }
}

@Composable
private fun ColumnScope.ConnectionPanel(info: DebugInfo, actions: DebugActions) {
    // Drafts belong to this sheet, not to live fetch snapshots. Tab switches preserve them.
    var backend by rememberSaveable { mutableStateOf(info.backend) }
    var interval by rememberSaveable { mutableStateOf(info.interval.toString()) }
    var auto by rememberSaveable { mutableStateOf(info.autoRefresh) }
    var submitted by rememberSaveable { mutableStateOf(false) }
    val urlError = if (submitted) DebugSettings.backendError(backend) else null
    val secondsError = if (submitted) DebugSettings.intervalError(interval) else null
    val focus = LocalFocusManager.current
    Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)) {
        StatusCard(info)
        OutlinedTextField(value = backend, onValueChange = { backend = it },
            label = { Text("Backend URL") }, singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
            isError = urlError != null,
            supportingText = { Text(urlError ?: "The player fetches the published document from this server.") },
            modifier = Modifier.fillMaxWidth().testTag("backendUrl"))
        Row(Modifier.fillMaxWidth().toggleable(value = auto, role = Role.Switch,
            onValueChange = { auto = it }).padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f).padding(end = 16.dp)) {
                Text("Auto-refresh", style = MaterialTheme.typography.titleMedium)
                Text("Check for new publications while the app is open.",
                    style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Switch(checked = auto, onCheckedChange = null)
        }
        OutlinedTextField(value = interval, onValueChange = { interval = it },
            label = { Text("Refresh interval") }, suffix = { Text("seconds") }, singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            isError = secondsError != null,
            supportingText = { Text(secondsError ?: "Between 2 and 300 seconds.") },
            modifier = Modifier.fillMaxWidth().testTag("refreshInterval"))
    }
    HorizontalDivider()
    Button(onClick = {
        submitted = true
        if (DebugSettings.backendError(backend) == null && DebugSettings.intervalError(interval) == null) {
            focus.clearFocus()
            actions.apply(backend.trim().trimEnd('/'), interval.toInt(), auto)
        }
    }, enabled = !info.fetching,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp).heightIn(min = 48.dp)) {
        Icon(Icons.Outlined.Refresh, contentDescription = null, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(8.dp))
        Text(if (info.fetching) "Refreshing…" else "Apply and refresh now")
    }
}

@Composable
private fun StatusCard(info: DebugInfo) {
    val failed = info.status.contains("failed", ignoreCase = true)
    Surface(shape = MaterialTheme.shapes.medium,
        color = if (failed) MaterialTheme.colorScheme.errorContainer else MaterialTheme.colorScheme.surfaceContainer) {
        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(if (failed) "Refresh failed" else if (info.fetching) "Connecting" else "Player status",
                style = MaterialTheme.typography.labelLarge)
            Text(info.status, style = MaterialTheme.typography.bodyMedium)
            if (info.version != "none") Text("Published version ${info.version} · ${"%,d".format(info.bytes)} bytes",
                style = MaterialTheme.typography.bodySmall)
            if (info.fetching) LinearProgressIndicator(Modifier.fillMaxWidth().padding(top = 4.dp))
        }
    }
}

@Composable
private fun DocumentPanel(info: DebugInfo) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)) {
        StatusCard(info)
        Detail("Document version", info.version)
        Detail("Binary size", "${"%,d".format(info.bytes)} bytes")
        Detail("SHA-256", info.sha.ifEmpty { "No document loaded" }, monospace = true)
        HorizontalDivider()
        Detail("Protocol header", info.header.ifEmpty { "Not available" }, monospace = true)
        Detail("Player viewport", info.viewport, monospace = true)
    }
}

@Composable
private fun Detail(label: String, value: String, monospace: Boolean = false) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        SelectionContainer {
            Text(value, style = MaterialTheme.typography.bodyMedium,
                fontFamily = if (monospace) FontFamily.Monospace else FontFamily.Default)
        }
    }
}

@Composable
private fun EventsPanel(events: List<String>, actions: DebugActions) {
    Column(Modifier.fillMaxSize().padding(horizontal = 24.dp)) {
        Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("Host events (${events.size})", style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
            TextButton(onClick = { actions.clearEvents() }, enabled = events.isNotEmpty()) { Text("Clear events") }
        }
        if (events.isEmpty()) {
            Surface(shape = MaterialTheme.shapes.medium, color = MaterialTheme.colorScheme.surfaceContainer) {
                Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("No events yet", style = MaterialTheme.typography.titleMedium)
                    Text("Interact with the remote document to see action identifiers and payloads here.",
                        style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            Text("Newest first · last 50 events", style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
            Column(Modifier.verticalScroll(rememberScrollState()).padding(vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)) {
                events.asReversed().forEachIndexed { index, event ->
                    Surface(shape = MaterialTheme.shapes.medium, color = MaterialTheme.colorScheme.surfaceContainer) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("EVENT ${events.size - index}", style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary)
                            SelectionContainer { Text(event, style = MaterialTheme.typography.bodyMedium, fontFamily = FontFamily.Monospace) }
                        }
                    }
                }
            }
        }
    }
}
