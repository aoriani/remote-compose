# Actual Remote Compose JSON format

The prototype uses `androidx.compose.remote.creation.json.RemoteComposeJsonParser`
from AndroidX **8932b2c2b5043cc40c46a44cfd04a1671ec50fb7**. It calls the actual
upstream parser; there is no business-widget JSON or format adapter.
[Source](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/RemoteComposeJsonParser.java).

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
No animation fixture is verified yet.

At this pin, onClick/touch actions include local value changes **and HostAction**.
Named actions may carry a typed value reference; ID actions may carry metadata.
The browser CoreDocument exposes named and ID callback registration. Android's View
player exposes ID action listeners. These are source findings; no host event has yet
been emitted/exercised in the prototype. Preserve the distinction from local state.

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
is a compiler proof, not a complete strict validator. Implement a validation layer
before exposing it as the authoring service.

The default JVM platform supports RemotePathBase but returns empty bitmap bytes and
zero image dimensions. Image encoding needs real platform services/resource handling;
never claim default image compilation is working. The parser's library-group restriction
also means this source integration is coupled to the pin.

Upstream ships `Documentation/parts/remote_compose_schema.json`, but runtime parsing/tests
remain authoritative. A separate remote-core test file contains an entirely commented-out
alternative dialect; no functioning second parser was found at this revision. This corrects
the initial indexed-source inference.
