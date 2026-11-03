package demo.pipeline

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.core.StreamReadConstraints
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.json.JSONArray
import org.json.JSONObject

data class Diagnostic(val code: String, val path: String, val message: String)
class InvalidDocument(val diagnostics: List<Diagnostic>) : IllegalArgumentException(diagnostics.first().message) {
    fun json() = JSONObject().put("errors", JSONArray(diagnostics.map {
        JSONObject().put("code", it.code).put("path", it.path).put("message", it.message)
    }))
}

/** Strict capability subset of upstream creation JSON, independent of editor templates. */
object Validation {
    private val mapper = ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
        .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).also {
            it.factory.setStreamReadConstraints(StreamReadConstraints.builder().maxNestingDepth(64).build())
        }
    private fun fail(path: String, message: String, code: String = "INVALID_PROPERTY"): Nothing =
        throw InvalidDocument(listOf(Diagnostic(code, path, message)))
    private fun keys(n: JsonNode, allowed: Set<String>, path: String) {
        if (!n.isObject) fail(path, "Expected an object")
        n.fieldNames().forEachRemaining { if (it !in allowed) fail("$path/$it", "Unknown property '$it'") }
    }
    private fun required(n: JsonNode, names: String, path: String) {
        names.split(' ').filter { it.isNotEmpty() }.forEach {
            if (!n.has(it)) fail("$path/$it", "Missing required property '$it'")
        }
    }
    private fun scalar(n: JsonNode, path: String) {
        if (!(n.isNumber && n.asDouble().isFinite()) && !(n.isTextual && n.asText().isNotBlank() && n.asText().length <= 1024))
            fail(path, "Expected finite number or nonempty Remote Compose expression/reference")
    }
    private fun text(n: JsonNode, path: String) { if (!n.isTextual) fail(path, "Expected string") }
    private fun number(n: JsonNode, path: String) { if (!n.isNumber || !n.asDouble().isFinite()) fail(path, "Expected finite number") }
    private fun enum(n: JsonNode, values: String, path: String) {
        if (!n.isTextual || n.asText() !in values.split(' ')) fail(path, "Expected one of: $values")
    }
    private fun array(n: JsonNode, path: String, item: (JsonNode, String) -> Unit) {
        if (!n.isArray) fail(path, "Expected array")
        n.forEachIndexed { i, value -> item(value, "$path/$i") }
    }
    private fun color(n: JsonNode, path: String) {
        if (!n.isTextual || !n.asText().matches(Regex("#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?|[@$][A-Za-z_][A-Za-z0-9_.]*")))
            fail(path, "Expected #RRGGBB, #AARRGGBB or color reference")
    }
    fun parse(source: String): JsonNode {
        if (source.toByteArray().size > 1_048_576) fail("", "Document exceeds 1 MiB", "LIMIT_EXCEEDED")
        val n = try { mapper.readTree(source) ?: fail("", "Empty document", "MALFORMED_JSON") }
        catch (e: InvalidDocument) { throw e }
        catch (e: Exception) { fail("", e.message ?: "Invalid JSON", "MALFORMED_JSON") }
        keys(n, setOf("header", "root", "resources"), "")
        required(n, "root", "")
        n.get("header")?.let { header ->
            keys(header, setOf("width", "height", "apiLevel", "profiles", "fps", "contentDescription", "orderedResources"), "/header")
            header.fields().forEachRemaining { (k, v) -> when(k) {
                "contentDescription" -> text(v, "/header/$k")
                "orderedResources" -> if (!v.isBoolean) fail("/header/$k", "Expected boolean")
                else -> { number(v, "/header/$k"); if (!v.isIntegralNumber) fail("/header/$k", "Expected integer") }
            } }
            for (k in listOf("width", "height")) header.get(k)?.let { if (it.asInt() !in 1..4096) fail("/header/$k", "Expected 1..4096") }
            header.get("apiLevel")?.let { if (it.asInt() != 7) fail("/header/apiLevel", "Only uncompressed API 7 is enabled", "UNSUPPORTED_OPERATION") }
            header.get("profiles")?.let { if (it.asInt() !in setOf(0, 512, 513)) fail("/header/profiles", "Unsupported profile", "UNSUPPORTED_OPERATION") }
            header.get("fps")?.let { if (it.asInt() !in 1..120) fail("/header/fps", "Expected 1..120") }
        }
        n.get("resources")?.let { resources(it, "/resources") }
        val root = n.get("root")
        if (root.isArray) array(root, "/root", ::component) else component(root, "/root")
        return n
    }
    private fun resources(n: JsonNode, p: String) {
        keys(n, setOf("variables", "colors", "paths"), p)
        n.fields().forEachRemaining { (section, entries) ->
            fun value(v: JsonNode, q: String) { when(section) {
                "colors" -> color(v, q)
                "paths" -> text(v, q)
                "variables" -> if (v.isObject) {
                    keys(v, setOf("value", "export"), q); required(v, "value", q); scalar(v.get("value"), "$q/value")
                    v.get("export")?.let { if (!it.isBoolean) fail("$q/export", "Expected boolean") }
                } else scalar(v, q)
            } }
            if (!entries.isObject) fail("$p/$section", "This supported subset uses named resource objects")
            entries.fields().forEachRemaining { (name, v) ->
                if (!name.matches(Regex("[A-Za-z_][A-Za-z0-9_]*"))) fail("$p/$section/$name", "Invalid resource name")
                value(v, "$p/$section/$name")
            }
        }
    }
    // Normalize only for validation; the input source is never rewritten.
    private fun normalized(n: JsonNode, path: String): Pair<String, JsonNode> {
        if (!n.isObject) fail(path, "Expected primitive object")
        if (n.has("type")) { text(n.get("type"), "$path/type"); return n.get("type").asText().lowercase() to n }
        if (n.size() != 1) fail(path, "Use type or a single primitive shorthand key")
        val entry = n.fields().next()
        if (!entry.value.isObject) fail(path, "Primitive shorthand must contain an object")
        return entry.key.lowercase() to entry.value
    }
    private fun component(n: JsonNode, path: String) {
        val (type, v) = normalized(n, path)
        val p = if (n.has("type")) path else "$path/${n.fieldNames().next()}"
        val specific = when(type) {
            "box", "row", "column" -> setOf("children", "horizontalAlignment", "verticalAlignment")
            "spacer" -> emptySet()
            "canvas" -> setOf("commands")
            "text" -> setOf("value", "text", "fontSize", "fontWeight", "color", "textAlign", "maxLines", "overflow", "fontFamily")
            "variable" -> setOf("name", "value", "export", "vtype")
            else -> fail("$p/type", "Unsupported Remote Compose primitive '$type'", "UNSUPPORTED_OPERATION")
        }
        keys(v, specific + setOf("type", "modifiers"), p)
        v.get("children")?.let { array(it, "$p/children", ::component) }
        v.get("commands")?.let { array(it, "$p/commands", ::command) }
        v.get("modifiers")?.let { array(it, "$p/modifiers", ::modifier) }
        when(type) {
            "text" -> {
                if (!v.has("value") && !v.has("text")) fail("$p/value", "Text requires value or text")
                v.get("value")?.let { text(it, "$p/value") }; v.get("text")?.let { text(it, "$p/text") }
                for(k in listOf("fontSize", "fontWeight")) v.get(k)?.let { scalar(it, "$p/$k") }
                v.get("fontFamily")?.let { text(it, "$p/fontFamily") }
                v.get("color")?.let { color(it, "$p/color") }
                v.get("textAlign")?.let { enum(it, "left right center start end justify", "$p/textAlign") }
                v.get("overflow")?.let { enum(it, "clip ellipsis visible start_ellipsis middle_ellipsis", "$p/overflow") }
                v.get("maxLines")?.let { if (!it.isIntegralNumber || it.asInt() < 1) fail("$p/maxLines", "Expected positive integer") }
            }
            "variable" -> {
                required(v, "name value", p); text(v.get("name"), "$p/name"); scalar(v.get("value"), "$p/value")
                v.get("vtype")?.let { enum(it, "float int string", "$p/vtype") }
                v.get("export")?.let { if (!it.isBoolean) fail("$p/export", "Expected boolean") }
            }
        }
        v.get("horizontalAlignment")?.let { enum(it, "start center end", "$p/horizontalAlignment") }
        v.get("verticalAlignment")?.let { enum(it, "top center bottom", "$p/verticalAlignment") }
    }
    private fun modifier(n: JsonNode, p: String) {
        if (!n.isObject || n.size() != 1) fail(p, "A modifier must have exactly one key")
        val (key, value) = n.fields().next()
        when(key.lowercase()) {
            "width", "height", "size", "fillmaxwidth", "fillmaxheight", "fillmaxsize", "weight", "horizontalweight", "verticalweight", "verticalscroll", "horizontalscroll", "zindex" -> scalar(value, "$p/$key")
            "padding" -> if (value.isArray) {
                if (value.size() !in setOf(1, 2, 4)) fail("$p/$key", "Padding needs 1, 2 or 4 entries")
                array(value, "$p/$key", ::number)
            } else number(value, "$p/$key")
            "background" -> color(value, "$p/$key")
            "id" -> if (!value.isIntegralNumber || value.asInt() < 0) fail("$p/$key", "Expected nonnegative integer")
            "onclick", "ontouchdown", "ontouchup" -> if(value.isArray) array(value, "$p/$key", ::action) else action(value, "$p/$key")
            "clip" -> {
                keys(value, setOf("type", "radius"), "$p/$key"); required(value, "type", "$p/$key")
                enum(value.get("type"), "circle rect roundRect", "$p/$key/type")
                value.get("radius")?.let { number(it, "$p/$key/radius") }
            }
            else -> fail("$p/$key", "Unsupported Remote Compose modifier '$key'", "UNSUPPORTED_OPERATION")
        }
    }
    private fun action(n: JsonNode, p: String) {
        required(n, "type", p)
        when(n.get("type").asText().lowercase()) {
            "hostaction", "hostnamedaction" -> {
                keys(n, setOf("type", "name", "actionId", "value", "actionType"), p)
                if (!n.has("name") && !n.has("actionId")) fail(p, "HostAction requires name or actionId")
                n.get("name")?.let { text(it, "$p/name") }; n.get("value")?.let { text(it, "$p/value") }
                for(k in listOf("actionId", "actionType")) n.get(k)?.let { if (!it.isIntegralNumber) fail("$p/$k", "Expected integer") }
            }
            "valuefloatchange", "valuefloatexpressionchange", "valueintegerchange", "valuestringchange" -> {
                keys(n, setOf("type", "targetId", "value"), p); required(n, "targetId value", p)
                scalar(n.get("targetId"), "$p/targetId"); scalar(n.get("value"), "$p/value")
            }
            else -> fail("$p/type", "Unsupported action", "UNSUPPORTED_OPERATION")
        }
    }
    private val paintKeys = setOf("color", "style", "width", "strokeWidth", "alpha", "strokeCap", "textSize", "linearGradient")
    private fun paint(n: JsonNode, p: String) {
        keys(n, paintKeys, p)
        n.fields().forEachRemaining { (k,v) -> when(k) {
            "color" -> color(v, "$p/$k")
            "style" -> enum(v, "fill stroke fillAndStroke", "$p/$k")
            "strokeCap" -> enum(v, "butt round square", "$p/$k")
            "linearGradient" -> {
                keys(v, setOf("x1", "y1", "x2", "y2", "colors", "stops", "tileMode"), "$p/$k")
                required(v, "colors", "$p/$k"); array(v.get("colors"), "$p/$k/colors", ::color)
                if (v.get("colors").size() < 2) fail("$p/$k/colors", "Gradient needs at least two colors")
                v.get("stops")?.let { array(it, "$p/$k/stops", ::number); if(it.size() != v.get("colors").size()) fail("$p/$k/stops", "Stops and colors must match") }
                for (a in listOf("x1", "y1", "x2", "y2")) v.get(a)?.let { scalar(it, "$p/$k/$a") }
                v.get("tileMode")?.let { if (!it.isIntegralNumber || it.asInt() !in 0..2) fail("$p/$k/tileMode", "Expected 0..2") }
            }
            else -> scalar(v, "$p/$k")
        } }
    }
    private fun command(n: JsonNode, path: String) {
        val (type,v) = normalized(n,path)
        val p = if (n.has("type")) path else "$path/${n.fieldNames().next()}"
        val fields = when(type) {
            "drawcircle" -> "cx cy radius"
            "drawrect", "drawoval", "cliprect" -> "left top right bottom"
            "drawroundrect" -> "left top right bottom rx ry"
            "drawline" -> "x1 y1 x2 y2"
            "drawarc", "drawsector" -> "left top right bottom startAngle sweepAngle"
            "scale" -> "sx sy"
            "translate" -> "dx dy"
            "rotate" -> "angle pivotX pivotY"
            "drawpath" -> "path"
            "addbitmap" -> {
                keys(v,setOf("type","image","varName"),p); required(v,"image",p)
                if(v.get("image").asText() != "club-bag") fail("$p/image","Unknown catalog bitmap", "UNSUPPORTED_OPERATION")
                v.get("varName")?.let { text(it,"$p/varName") }; return
            }
            "drawbitmap" -> "image left top right bottom"
            "drawtextanchored" -> "text x y panX panY"
            "save", "restore" -> ""
            "paint" -> {
                keys(v, paintKeys + setOf("type", "ops"), p)
                if (v.has("ops")) {
                    if(v.size() != (if(v.has("type")) 2 else 1)) fail(p, "Use either paint.ops or inline paint properties")
                    array(v.get("ops"), "$p/ops", ::paint)
                } else paint(v.deepCopy<com.fasterxml.jackson.databind.node.ObjectNode>().also { it.remove("type") },p)
                return
            }
            else -> fail("$p/type", "Unsupported drawing operation '$type'", "UNSUPPORTED_OPERATION")
        }
        val optional = if(type == "drawtextanchored") setOf("flags") else if(type == "save") setOf("commands") else emptySet()
        keys(v, fields.split(' ').filter { it.isNotEmpty() }.toSet() + optional + "type",p)
        required(v,fields,p)
        for(k in fields.split(' ').filter { it.isNotEmpty() }) {
            if(k in setOf("path","text","image")) text(v.get(k),"$p/$k") else scalar(v.get(k),"$p/$k")
        }
        v.get("commands")?.let { array(it,"$p/commands",::command) }
        v.get("flags")?.let { if (!it.isIntegralNumber) fail("$p/flags", "Expected integer") }
    }
}
