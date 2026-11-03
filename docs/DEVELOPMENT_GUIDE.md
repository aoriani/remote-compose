# Development guide

Status: the minimal JVM/browser pipeline is implemented. Product service/editor/mobile
modules remain planned. See [getting started](GETTING_STARTED.md) for runnable commands.

## First gate

The baseline gate passes for `samples/minimal-canvas.json`: upstream JVM compilation,
binary decoding, 63 upstream parser tests, six local tests and real browser pixel checks.
Run `sh scripts/verify-pipeline.sh` to preserve it. The compiler directly calls the
upstream Java parser from Kotlin; it does not use the TypeScript creation engine.
Next implement strict validation and the preview/publish backend before the full editor.

## Implementation stages and behavioral tests

| Stage | Build | Required validation |
| --- | --- | --- |
| Compiler | Small Kotlin adapter over pinned upstream creation parser | Valid/invalid JSON, nonempty decodable bytes, header/ops, resource and unknown-operation errors |
| Service | Compile, preview, atomic publish, immutable versions, ETags | Preview never changes latest; failed compile/publish preserves previous version; restart/concurrency consistency; binary and metadata digest agree |
| Browser | Load real compiled bytes in experimental player | Fixed primitive renders; decode errors surfaced; animation repaint and real host callback captured |
| Editor | Three panels, palette, outline, properties and highlighted JSON | Add/select/configure/reorder/duplicate/delete; property changes only patch selected fields; custom trees/resources survive operations |
| Custom example | Uncatalogued nested layout/canvas composition | Compile/publish/render without changing player bundles |
| Animations/events | Two verified protocol-native examples and host event | Timed state/pixel changes with deterministic clock; callback ID/payload from actual player API |
| Android | Official player, native debug sheet, fetch/refresh | CLI build/unit/lint/device tests; last-good preservation; no overlapping refresh swaps; toolbar works on render failure |
| iOS | C++/Skia renderer plus Swift debug shell | CLI simulator build/run; lifetime/touch bridge; same binary digest; refresh failure handling |
| Integration | Publish/refresh and clean checkout setup | Unchanged mobile binaries render custom composition; record exact commands and environment |

## Extension conventions

Templates return primitive subtrees; keep a separately versioned editor sidecar with
optional recognition hints. Properties forms must verify the current subtree shape
before patching known paths. A JSON transformation can make a template custom at any
time. Section operations must preserve unrecognized subtrees verbatim in meaning.
Duplicate IDs/variable definitions need verified remapping rather than blind copying.

Use fresh compiler state per request. Surface parser context paths and distinguish
input errors from internal failures. Never advance latest before all validation and
persistence succeeds. Future native shells should share fetch lifecycle semantics, not
business-widget implementations. Host-event logs should display only documented exposed
events with bounded retention.

Run `python3 scripts/check-project.py` for documentation/metadata integrity. Later add
meaningful backend/editor/refresh behavior tests alongside implementation, and record
real player smoke-test evidence separately. Consult [AndroidX testing conventions](https://github.com/androidx/androidx/blob/androidx-main/compose/remote/TESTING.md)
when writing upstream/player integration tests.

At each milestone update [progress](PROGRESS.md), [context](CONTEXT.md), compatibility
and setup docs, run checks, and commit source plus relevant evidence. Do not commit
dependencies, local SDK paths, artifacts, secrets or signing files.
