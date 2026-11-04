# Interactive primitive demo

Implemented and exercised on pinned AndroidX8932b2c / experimentsa7a76f1. No upstream
revision change. Load **Library → Load interactive demo** in the editor, then Preview
or Publish. The older designed-page sample remains available separately; its decorative
controls are not the interaction acceptance fixture.

## Document and timing

[samples/interactive-retail.json](../samples/interactive-retail.json) is ordinary upstream
primitive JSON. `web-editor/interactive.mjs` is an authoring factory, not a runtime widget.
The compiler and native players have no carousel, product, favorite or category classes.
The three illustrated offers use existing original FIELD/OAT, SOL and MORN PNG resources,
real text, rounded paths, canvas clipping and translations. Artwork stays proportional.

The document stores `promo_base`, `promo_from` and `promo_epoch` as float variables.
`promo_clock = animationTime() + time * 0`: elapsed document time supplies the phase;
continuous time also requests repaints in this experimental player. No JS/Android/Swift
carousel timer, scheduled host action, or network state synchronization is used.

For elapsed `e=max(0,clock-epoch)`, interval `I` and duration `D`, automatic motion is
`floor(e/I) + smooth(clamp((e%I-I+D)/D))`, where `smooth(t)=t*t*(3-2*t)`.
The first slide arrives at its successor at5s; the final0.45s is the slide transition.
A manual action captures the current fractional position, selects a new target and
captures the current clock. Interpolation starts from that captured position, so a
second click retargets one phase rather than starting a competing animation/queue.
The reset timestamp also restarts automatic rotation. Modulo translation wraps slides
inside one clipped viewport. The active dot and banner event use the nearest slide index.

Native/app backgrounding does not freeze the document's elapsed-time model: on resume
it catches up to the current phase. No missed host events are replayed. Protocol local
state survives a304 refresh/background session; loading a newly decoded publication
starts a new local-state session. State is not durable cart/favorite persistence.
Decoding can consume part of the first interval before the first visible frame. Tests
select a known slide/reset its interval rather than assuming decode completed instantly.

## Inspector and source preservation

The carousel inspector exposes banner text, catalog artwork, paint colors, interval1–60s,
transition0.1–0.9s,2–5 slides, order buttons, indicator/arrow visibility0/1 and named action
identifiers. Count/order operations patch only a structurally recognized carousel; existing
banner content and configured event names are retained. Arbitrary structural changes
fall back to custom JSON. Other sections/resources are not regenerated.

Only one default `promo_` namespace is inserted through the palette. Duplication of sections
that declare variables remains explicitly rejected, rather than creating ID collisions.
Another independent carousel is possible in raw JSON with a consistently renamed namespace.
All layout dimensions and expressions remain inspectable/editable in the primitive source.
Undo/redo is not implemented in this editor. The source textarea retains normal browser
editing behavior; no application-level undo guarantee is made.

## Local state and host contract

`ValueFloatExpressionChange` (opcode227) changes variables locally. Favorite=`1-favorite`;
category is a selected index; quantity=`min(99,q+1)` / `max(0,q-1)`. Paint alpha changes the
heart and pill fills. Upstream `textFromFloat` formats the visible quantity using protocol
operations; its strict supported JSON shape is documented in JSON_FORMAT.md. All visible
feedback runs without a backend request. Arithmetic/clamps implement the required local
logic; general functions/conditional operation blocks are not needed or newly enabled.

| Event | Type / payload | Behavior |
| --- | --- | --- |
| `carousel.previous`, `.next`, `.select` | float: logical target position | Retarget slide and restart interval |
| `promotion.open` | float: active zero-based slide index | Open the offer corresponding to current authored order |
| `favorite.change` | float0/1 | Immediate selected heart |
| `category.select` | string `All`, `Breakfast`, `Pantry` | Immediate selected pill |
| `cart.add`, `cart.quantity` | float0..99 | Immediate visible quantity |
| `product.open` | string `field-oat` | Navigation placeholder |
| `scan.open` | string `scan-and-go` | Navigation placeholder |
| `membership.open` | string `common-market` | Navigation placeholder |

A carousel navigation target may exceed the slide count or be negative across wrapping;
`target modulo slideCount` is the selected slide. The banner event itself supplies the
normalized active index. Event names can be changed through the inspector/raw source.
Clicking the entire active banner, including its CTA, produces one event. Arrow/dot
controls have separate hit targets and do not bubble into the banner callback.

Android logs generic name/value or ID/metadata and replaces the current Toast (no backlog).
iOS shows a dismissible native generic notice and keeps the debug log. Browser exposes
its event panel. No host knows which event should open a product-specific screen.
Native auto-fetch timers predate this feature and remain independent of carousel timing.

## Pinned-player defect and minimal reproduction

The browser's ClickModifier skips nested DATA_TEXT during initialization. The JVM writer
interns a repeated action name inside the first control's action list. Clicking another
control first emitted `{name:null,value:...}`. The existing C++ bridge already repaired
the analogous traversal problem. `web-editor/player-adapter.mjs` now recursively initializes
**only immutable TextData opcode102**, before registering actions. It neither executes
local actions nor renders substitute content. This is a source-coupled compatibility shim.

[samples/repros/shared-action-name.json](../samples/repros/shared-action-name.json) reproduces
it without a business template. `player-smoke/action-resource-repro.mjs` compiles once,
clicks the second control on the unadapted real player (null), applies the generic shim,
then clicks it again (`repro.echo`, `second`). See evidence/interactive/resource-repro.json.

Validation now rejects literal values in ValueFloatExpressionChange: the pinned writer
expects an expression ID and would otherwise encode an invalid reference. Use
ValueFloatChange for a literal, or an actual expression/reference for opcode227.

## Reproduction

With the documented JDK/SDK/Xcode available:

```sh
sh scripts/gradle.sh :pipeline:installDist
PORT=8092 RC_DATA_DIR=data/interactive sh scripts/start-backend.sh
```

Open http://127.0.0.1:8092. Load interactive demo, edit source/inspector, Preview and Publish.
Set both native debug backend URLs to `http://127.0.0.1:8092`; use
`adb reverse tcp:8092 tcp:8092` for Android. Do not share the emulator with another suite.

In another shell, with JAVA_HOME/ANDROID_HOME/DEVELOPER_DIR set as in GETTING_STARTED:

```sh
IOS_SIMULATOR=<booted-arm64-simulator-udid> sh scripts/verify-interactive.sh
```

The runner requires the backend on8092, publishes immutable test versions, tests real
browser editing, runs native CLI checks and writes artifacts/interactive. It does not
push Git. `interactive-run.json` is ignored local test metadata, separate from primitives.
For just the focused reproduction:

```sh
sh scripts/node.sh node player-smoke/action-resource-repro.mjs
```

See FULL_FEATURE_TEST_REPORT.md and evidence/interactive for executed scope and limitations.
