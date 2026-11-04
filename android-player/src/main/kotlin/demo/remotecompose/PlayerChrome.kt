package demo.remotecompose

import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

/** Native developer chrome only. The AndroidView is the upstream protocol player. */
object PlayerChrome {
    class State {
        var status by mutableStateOf("Loading…")
        var debugVisible by mutableStateOf(false)
        var debugInfo by mutableStateOf(DebugInfo())
    }

    @JvmStatic
    @OptIn(ExperimentalMaterial3Api::class)
    fun install(activity: ComponentActivity, state: State, stage: ProtocolViewport,
                refresh: Runnable, debug: Runnable, debugActions: DebugActions) {
        activity.enableEdgeToEdge()
        activity.setContent {
            MaterialTheme(colorScheme = lightColorScheme(primary = Color(0xFF305BEF))) {
                if (state.debugVisible) DebugSheet(state, debugActions)
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        TopAppBar(
                            title = { Text("Remote Compose", maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis) },
                            actions = {
                                IconButton(onClick = { refresh.run() }) {
                                    Icon(Icons.Outlined.Refresh, contentDescription = "Refresh")
                                }
                                IconButton(onClick = { debug.run() }) {
                                    Icon(Icons.Outlined.Settings, contentDescription = "Debug and logs")
                                }
                            }
                        )
                    },
                    contentWindowInsets = WindowInsets.safeDrawing.only(
                        WindowInsetsSides.Horizontal + WindowInsetsSides.Bottom)
                ) { padding ->
                    Column(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding)) {
                        Text(state.status, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis, style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp))
                        AndroidView(factory = { stage }, modifier = Modifier.fillMaxWidth().weight(1f))
                    }
                }
            }
        }
    }
}
