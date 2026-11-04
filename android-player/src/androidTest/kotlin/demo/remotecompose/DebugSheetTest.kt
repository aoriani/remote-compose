package demo.remotecompose

import android.os.SystemClock
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.os.Bundle
import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.platform.app.InstrumentationRegistry.getInstrumentation
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import java.net.ServerSocket
import kotlin.concurrent.thread

/** Exercises the real activity, upstream player, modal sheet, settings and event log. */
class DebugSheetTest {
    @get:Rule val rule = ActivityScenarioRule(MainActivity::class.java)
    private val instrumentation get() = getInstrumentation()
    private fun waitFor(check: () -> Boolean) {
        val end = SystemClock.uptimeMillis() + 20_000
        while (!check() && SystemClock.uptimeMillis() < end) SystemClock.sleep(100)
        assertTrue("Condition must become true", check())
    }
    private fun find(node: AccessibilityNodeInfo?, text: String): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.text?.toString() == text || node.contentDescription?.toString() == text) return node
        for (i in 0 until node.childCount) find(node.getChild(i), text)?.let { return it }
        return null
    }
    private fun node(text: String): AccessibilityNodeInfo {
        var result: AccessibilityNodeInfo? = null
        waitFor { result = find(instrumentation.uiAutomation.rootInActiveWindow, text); result != null }
        return result!!
    }
    private fun click(text: String) {
        var target = node(text)
        while (!target.isClickable) target = target.parent
        val bounds = Rect(); target.getBoundsInScreen(bounds)
        val t = SystemClock.uptimeMillis()
        instrumentation.uiAutomation.injectInputEvent(MotionEvent.obtain(t,t,0,bounds.exactCenterX(),bounds.exactCenterY(),0),true)
        instrumentation.uiAutomation.injectInputEvent(MotionEvent.obtain(t,t+80,1,bounds.exactCenterX(),bounds.exactCenterY(),0),true)
        SystemClock.sleep(500)
    }
    private fun field(label: String): AccessibilityNodeInfo {
        var target = node(label)
        while (!target.isEditable) target = target.parent
        return target
    }
    private fun enter(label: String, value: String) {
        val target = field(label)
        target.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SHOW_ON_SCREEN.id)
        assertTrue(target.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, value)
        }))
        SystemClock.sleep(200)
    }

    @Test fun settingsValidationTabsEventsAndDismissal() {
        val instrumentation = getInstrumentation()
        val prefs = instrumentation.targetContext.getSharedPreferences("MainActivity", 0)
        val original = prefs.all
        val bytes = instrumentation.context.assets.open("button.rc").use { it.readBytes() }
        val sha = Hashes.sha256(bytes)
        val server = ServerSocket(0)
        val responder = thread {
            try {
                while (!server.isClosed) server.accept().use { socket ->
                    val reader = socket.getInputStream().bufferedReader()
                    while (!reader.readLine().isNullOrEmpty()) { }
                    socket.getOutputStream().apply {
                        write(("HTTP/1.1 200 OK\r\nContent-Length: ${bytes.size}\r\nX-Document-Version: 42\r\n" +
                            "X-Document-SHA256: $sha\r\nConnection: close\r\n\r\n").toByteArray())
                        write(bytes); flush()
                    }
                }
            } catch (_: Exception) { }
        }
        val backend = "http://127.0.0.1:${server.localPort}"
        try {
            lateinit var activity: MainActivity
            rule.scenario.onActivity { activity = it; it.testBackend(backend) }
            waitFor { activity.renderedSha() == sha }
            instrumentation.runOnMainSync {
                val player = activity.findViewById<View>(R.id.protocol_player)
                val t = SystemClock.uptimeMillis()
                player.dispatchTouchEvent(MotionEvent.obtain(t, t, MotionEvent.ACTION_DOWN, 100f, 25f, 0))
                player.dispatchTouchEvent(MotionEvent.obtain(t, t + 50, MotionEvent.ACTION_UP, 100f, 25f, 0))
            }
            waitFor { activity.eventCount() > 0 }
            val event = activity.lastEvent()
            click("Debug and logs")
            assertTrue(node("Player debug").isVisibleToUser)
            enter("Backend URL", "ftp://example.org")
            enter("Refresh interval", "1")
            click("Apply and refresh now")
            node("Use a whole number from 2 to 300 seconds.")
            node("Enter an http:// or https:// server URL without credentials, query or fragment.")
            assertEquals("Invalid settings must retain the loaded document", sha, activity.renderedSha())
            click("Document")
            node(sha); node("42")
            click("Connection")
            assertEquals("ftp://example.org", field("Backend URL").text.toString())
            enter("Backend URL", backend)
            enter("Refresh interval", "2")
            click("Auto-refresh")
            click("Apply and refresh now")
            waitFor { prefs.getString("backend", "") == backend }
            assertEquals(2, prefs.getInt("interval", 0))
            assertTrue(prefs.getBoolean("auto", false))
            click("Events")
            assertTrue(node(event).isVisibleToUser)
            click("Clear events")
            assertTrue(node("No events yet").isVisibleToUser)
            assertEquals(0, activity.eventCount())
            click("Close debug")
            waitFor { find(instrumentation.uiAutomation.rootInActiveWindow, "Player debug") == null }
            // Dismissal discards an uncommitted draft. System back dismisses the modal too.
            click("Debug and logs")
            enter("Backend URL", "http://draft.invalid")
            click("Close debug")
            click("Debug and logs")
            assertEquals(backend, field("Backend URL").text.toString())
            instrumentation.sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
            waitFor { find(instrumentation.uiAutomation.rootInActiveWindow, "Player debug") == null }
            assertEquals(sha, activity.renderedSha())
        } finally {
            server.close(); responder.join(1000)
            prefs.edit().apply {
                for (key in listOf("backend", "auto", "interval")) {
                    when (val value = original[key]) {
                        is String -> putString(key, value)
                        is Boolean -> putBoolean(key, value)
                        is Int -> putInt(key, value)
                        else -> remove(key)
                    }
                }
            }.commit()
        }
    }
}
