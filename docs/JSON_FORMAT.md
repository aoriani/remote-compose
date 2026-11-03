# Remote Compose JSON investigation

No format or compatible compiler version is selected yet. The intended developer
format is `androidx.compose.remote.creation.json.RemoteComposeJsonParser` input, not
an application widget schema. See [research evidence R3–R8](RESEARCH.md).

## Observed structure

The creation parser accepts a document object with `header`, optional `resources`,
and `root` as an object or array. Layout nodes contain `type`, `modifiers`, and
`children`; canvas nodes carry `commands`. First-pass definitions are processed before
layout emission. Contextual parser failures include a path. These details were read
in indexed source at fa07a37; they have not been executed locally.

The source also normalizes component shorthand, but the prototype should initially use
explicit `type` objects for predictable editing. Do not mix this with the separate
remote-core JSON representation, whose indexed tests use capitalized operation-like
types and `{ "type": "Width", "v": 200 }` modifiers. Confirm one dialect at one pin.

## Candidate minimal document

See [minimal-canvas.json](../samples/minimal-canvas.json). It combines observed creation
format shapes and documented paint/drawing commands. **JSON syntax checked only;
not yet proven compilable.** No verified compilable example is available yet.

## Capability investigation

| Area | Observed creation representation | Still to verify |
| --- | --- | --- |
| Layout | `column`, `row`, `box`, `spacer`, `canvas`; nested `children` | Measurement, empty containers, section scrolling on each player |
| Text | `text` component | Profile-dependent opcode, font metrics, line limits |
| Images | Bitmap resources and drawing operations | Default JVM resource loader and encoding; do not invent URL-image component |
| Modifiers | Array of modifier objects; dimensions, padding, background, clip, scroll documented | Exact accepted forms, order, defaults, unknown-key rejection |
| Drawing | `commands` containing paint and drawCircle/Rect/Line/Path operations | Field casing and binary parity at chosen pin |
| Colors/gradients | Paint commands and color resource references | Alpha conventions, gradient fields and player coverage |
| Variables | Named definitions, expressions and `$`/`@` references observed | ID allocation, scope, initialization and invalidation |
| Animation | Time expressions are plausible drawing inputs | Clock variables, expression syntax and continuous repaint |
| Interaction | `onClick` local value-change actions in modifier registry | Host event emission is a separate research gate |
| Reuse | `definepattern`, `patternargument`, `patterninflation` present | Cross-player expansion and ID remapping |
| Resources | Resource preprocessing and deferred variables observed | Fonts, bitmap transport, unsupported resources, cross-document lifetime |
| Serialization | Static parser-to-buffer API visible at 62d36f9 | Runtime dependency resolution and actual binary decoding |

R8 documents width/height/size, weight, scrolling and clipping; consult implementation
before accepting an editor property. Paint state, matrix state and layout modifiers
are different mechanisms. Preserve operation order.

## Validation policy (planned)

Syntax parsing alone is insufficient. Compile with the real upstream parser, inspect
the resulting document, and constrain it to the verified cross-player subset. Unknown
operations must produce useful errors rather than disappearing. Editor metadata will
live in a sidecar, never as invented business-node types in this JSON.

No animation or host-action JSON examples are marked working until rendered/event-tested.
