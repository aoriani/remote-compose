# Actual Remote Compose JSON format

The prototype uses `androidx.compose.remote.creation.json.RemoteComposeJsonParser`
from AndroidX **8932b2c2b5043cc40c46a44cfd04a1671ec50fb7**. It calls the actual
upstream parser; there is no business-widget JSON or format adapter.
[Source](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/RemoteComposeJsonParser.java).

## Current service capability subset

Validation.kt is authoritative for enabled fields. The upstream registry described below
is broader and does not imply that every entry is enabled or cross-platform verified.
The service supports box/row/column/spacer/canvas/text/variable, ordered single-key
modifiers, expressions, named resources, verified paint/draw/transform operations and
host/local actions. Unsupported operations return 422 with a path; malformed/duplicate
or trailing-token JSON returns 400. Limits: 1MiB, nesting64, dimensions1..4096, API7,
profiles0/512/513. Float32 non-finite values are rejected. Custom structures assembled
from enabled primitives are accepted regardless of template recognition.

See samples/landing.json, animations.json, interaction.json and custom-composition.json.
Real PNG resources use upstream addBitmap/drawBitmap and a separate classpath catalog.
Both continuous animations use `time` expressions; they were observed in all three
players. HostAction42 is observable in all three engines (iOS smoke uses engine input).
Gradient paint persists: `{"paint":{"shader":0}}` resets it. Inline finite absolute M/L/C/Z SVG paths are now enabled after repairing populated path
length serialization; see VISUAL_REDESIGN.md. General SVG import/named path resources
remain unsupported. The permissive research CLI still uses the upstream default platform;
use the service for corrected bitmap/path compilation.

## Verified compilable example

[samples/minimal-canvas.json](../samples/minimal-canvas.json) compiles and renders:

```json
{
  "header": { "width": 390, "height": 844 },
  "root": {
    "type": "canvas",
    "modifiers": [{ "width": 390 }, { "height": 844 }],
    "commands": [
      { "type": "paint", "ops": [{ "color": "#0067A0" }, { "style": "fill" }] },
      { "type": "drawCircle", "cx": 195, "cy": 160, "radius": 64 }
    ]
  }
}
```

Run the commands in [getting started](GETTING_STARTED.md). Expected: 109 bytes,
header v1.1.0, API level 7 by default, profile 0, dimensions 390×844. This is a real
primitive canvas, not a catalog widget. Header/API/profile values are separate concepts.

## Document and layout structures

The document object has optional `header` and `resources`, and `root` as a component
object or array. Our CLI additionally requires `root`; upstream alone accepts `{}`.
Component shorthand (`{"column":{...}}`) and explicit `type` syntax are supported.
Components carry ordered `children`; canvas nodes carry ordered `commands`.
Resource/variable/global/pattern definitions receive a preliminary traversal before
layout emission. Keep definitions/resources when modifying page sections.

The default component registry contains column, row, box, spacer, canvas, text, flow,
stateLayout, collapsible layouts, fitBox, bitmap, global and pattern/referenced-operation
forms. Spacer becomes a box (horizontal weight when no modifiers are specified).
There is no general upstream `hero`, `productCarousel`, or URL `image` business node.
[Registry](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultComponentParsers.java).

## Modifiers, paint and drawing

The actual modifier representation is an ordered array of single-key objects, e.g.
`[{"width":200},{"padding":16},{"background":"#0067A0"}]`. The parser also supports
certain plain-string sizing shorthands. Do not use the old operation-like
`{"type":"Width","v":200}` representation from the commented remote-core test.

The default registry includes width/height/size, fill sizing, min/max constraints,
padding, weight, background, border, clipping, graphicsLayer, offset, vertical/horizontal
scroll, visibility, animationSpec and touch/click forms. Modifier order matters.
Canvas commands include paint, lines, rectangles, circles, paths, text/bitmap drawing,
save/restore, transformations, clipping, conditionals and loops. `paint.ops` can set
colors, gradients and other paint state. Player support must be tested separately.
[Modifiers](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultModifierParsers.java).

## Variables, expressions, animation and actions

ResourceParser and ExpressionParser resolve named colors, paths, matrices, variables,
arrays and infix mathematical expressions. References accept `$name`/`@name` and namespace
forms. Canvas fields can consume time expressions such as the upstream test's
`50 + sin(time) * 10`. A compiled expression is not proof of browser repaint/animation.
Both sample time-expression animations are now verified in browser and native players.

At this pin, onClick/touch actions include local value changes **and HostAction**.
Named actions may carry a typed value reference; ID actions may carry metadata.
The browser CoreDocument exposes named and ID callback registration. Android's View
player exposes ID action listeners. HostAction42 is now exercised in browser, Android and iOS engines. Preserve the distinction from local state.

`definepattern`, `patternargument`, `patterninflation`, slots/foreach and referenced
operations are present. See [future architecture](FUTURE_ARCHITECTURE.md); cross-document
binary caching is not implied by in-document templates.

## Compilation, errors and unsupported features

`parseToByteBuffer(json)` creates a writer, applies header tags, parses, and calls
`encodeToByteArray()`. `inspect` decodes with real remote-core and reports header,
dimensions, flat operation names, size and SHA-256. The wire integer encoding is
**big-endian**, confirmed in WireBuffer; do not follow old contradictory descriptions.

Malformed JSON, unknown components and missing drawing fields raise errors. The parser
adds ContextPath information for component errors. **Unknown modifiers and drawing
commands can silently disappear**; a local characterization test proves this. The CLI
remains a permissive research tool; Validation.kt now protects both service endpoints.

The default JVM platform supports RemotePathBase but returns empty bitmap bytes and
zero image dimensions. JvmAssets supplies the required real platform services and classpath PNG catalog;
the unadapted default remains nonfunctional for bitmaps. The parser's library-group restriction
also means this source integration is coupled to the pin.

Upstream ships `Documentation/parts/remote_compose_schema.json`, but runtime parsing/tests
remain authoritative. A separate remote-core test file contains an entirely commented-out
alternative dialect; no functioning second parser was found at this revision. This corrects
the initial indexed-source inference.

## Designed retail fixture and resource catalog

samples/retail-home.json is a full primitive composition with bitmap products, inline
cubic vector hearts, text/layout, scrolling and time expressions. assets/catalog.json
is an external JVM resource lookup; assets/library.json is editor-only presentation
metadata. Neither introduces a runtime business-widget dialect. New image names are
validated against the loaded catalog, then actual alpha-preserving640px PNGs are embedded.
Four-value padding arrays mean start/top/end/bottom. drawBitmap maps the supplied rectangle
exactly; the default new templates preserve source aspect ratio with square destinations.

### Validated clipping limitation

The pinned parser accepts `{ "clip": { "type": "circle" } }`, but upstream creation
`modifiers/ClipModifier.write` only emits RectShape/RoundedRectShape. The backend now
rejects CircleShape with UNSUPPORTED_OPERATION instead of silently losing clipping.
For a 100×100 frame, `{ "clip": { "type": "roundRect", "radius": 50 } }` emits a
supported circular rounded clip. Canvas clipRect and ordinary rounded clips remain supported.

### Native viewport coordinates

For this API7 prototype, one drawing/layout unit maps to one native logical dp/point;
the host performs the device pixel-ratio conversion. Header390×844 is a design-time size,
not a native aspect-ratio constraint. Use root fillMaxSize/fillMaxWidth and supported
expressions such as `windowWidth() - 20` for full-width trailing edges. Move both bitmap
bounds together, or derive equal width/height, to preserve aspect ratio. `windowWidth()`
is global viewport width; a fixed-width nested card still needs its own local constraints.

Retail hero artwork uses `min(157, windowWidth() - 232)` for its square size and keeps its
right/bottom inset. This avoids headline overlap on a360dp viewport without scaling text
or the whole document. Explicit fixed widths remain explicit: clients do not rewrite raw
custom trees to force responsiveness. Existing published documents remain immutable.

### Interactive state and numeric text

The interactive fixture uses real `ValueFloatExpressionChange` actions with
`targetId:"@shop_quantity"`, `value:"min(99, @shop_quantity + 1)"`. These are evaluated
at click time; they are distinct from HostAction notifications. Numeric literals are
rejected for expression actions because the pinned writer requires an expression ID.
Use ValueFloatChange for fixed values.

A variable may use the following narrowly validated upstream value object:

```json
{"type":"variable","name":"quantity_text","value":{"type":"textFromFloat","value":"@shop_quantity","decimal":0,"whole":1,"flags":0}}
```

A `drawTextAnchored` command referencing `"@quantity_text"` displays the actual mutable
number. Only textFromFloat objects with scalar value and integer decimal/whole/flags0..6
are enabled by this extension to service validation. General variable value objects,
function definitions and arbitrary conditional blocks remain outside the enabled subset.
See INTERACTIVE_DEMO.md for time expressions, action payloads and source examples.

### Full-page product state and horizontal scroll (2026-11-04)

The bundled retail page uses exported float variables, ValueFloatExpressionChange actions,
TouchDown/TouchUp ValueFloatChange, alpha paint, vector hearts and TextFromFloat. Each product
has distinct names; no product widget type is serialized. `min(1, quantity)` selects Add versus
quantity glyph alpha without new conditional operations. The same fixed control areas update
local values immediately. See the complete compilable samples/retail-home.json.

Declare a named exported scroll variable before a horizontal row, then reference it with
`{"horizontalScroll":"@products_scroll"}`. The pinned browser's implicit literal0 path
places a FloatConstant inside paint traversal and resets the context position on redraw.
The named reference avoids this problem and is verified in the full page on all three players.
