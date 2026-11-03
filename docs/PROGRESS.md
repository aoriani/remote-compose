# Progress and handoff

Updated 2026-11-03. Branch main. Current phase: usable cross-platform demonstration,
with measured compatibility limited to the fixtures below. No remote push performed.

## Implemented

- Preserved foundation, exact upstream pins and the 109-byte original proof.
- Strict primitive validation with malformed/unsupported/property/location diagnostics.
- Kotlin HTTP preview, immutable atomic publication, history, metadata, ETags and restart
  persistence; failed compilation cannot replace a publication.
- Three-panel editor: eleven templates, outline operations, conservative properties,
  editable highlighted raw JSON, real binary preview, publish and load published source.
  Custom primitive subtrees survive editing; unsafe ID duplication is rejected.
- Real PNG adapter/resource catalog, two continuous-time expression animations and
  protocol HostAction callbacks, with no business widgets in any runtime.
- Android official player with native debug bottom dialog, conditional refresh,
  auto-refresh, metadata/errors/events and last-good preservation.
- iOS C++/Skia Metal player with Swift debug sheet and equivalent fetch/debug behavior.
- A new uncatalogued composition was published and rendered by browser, Android and iOS
  at identical SHA-256 while both installed application hashes stayed unchanged.

## Verified tests and evidence

- 79 JVM tests: 63 upstream parser tests plus 16 local compiler/backend tests.
- Six Node editor-model tests.
- Browser end-to-end: eleven templates compile, real PNG draws, both protocol animations
  change, arbitrary custom copies survive, publish works, event 42 reaches host, invalid
  publication preserves previous document and preview. No unknown-opcode warnings.
- Android assembleDebug, one unit test, lintDebug (zero errors; upstream warnings), one
  connected instrumentation test on Android 17/API-37 emulator. Instrumentation verifies
  real network fetch/digest, actual player input/event42 and failed refresh preservation.
- iOS arm64 Simulator app built with CMake/Swift/Metal, installed and exercised on iPhone
  18 Pro. Engine-input smoke verifies event42 and actual failing-fetch preservation.
- Both native players rendered animation fixture; consecutive screenshots show different
  badge and progress pixel areas. Both then auto-fetched the corrected custom composition.
- Corrected custom document: 932 bytes, SHA-256
  `3ea80866c330a6f27b827ec964b4d86909fa1b77cafc3926e241b9e047a7d871`.
  Screenshots and compact records are in [evidence](evidence/cross-platform.json).
- Expanded clean-checkout reproduction has not yet been run. The original 69-test minimal
  pipeline clean-checkout verification remains recorded separately.

## Important limitations and next work

- SVG drawPath generated an Android error and missing C++ geometry in a real trial.
  Strict service now rejects paths; the corrected fixture uses verified circle primitives.
  Shader paint state persists: reset with paint shader=0 before solid drawing.
- Experimental browser typecheck still fails upstream; bundle/runtime tests pass.
- Physical devices, signed iOS device packaging, Intel iOS Simulator and broad protocol
  conformance remain unverified. Native gesture/UI automation coverage is partial.
- Only selected API-7 primitives are enabled; source support does not imply player parity.
  Images are verified in browser, not yet visually asserted in both native players.
- Next: repeat the expanded workflow from a clean clone, add durable native UI automation
  and full landing-page image/scroll fidelity checks; investigate path encoding separately.
- Reusable binary fragments/cache are research only; no optimization was implemented.

## Git milestones

`91f43a9`: strict validation and atomic backend. `cf1d42e`: JSON-preserving editor,
images/animations/host actions. Native implementation and evidence are the next commits;
use `git log -5` for exact final hashes. No user files were discarded or history rewritten.
See [setup](GETTING_STARTED.md) for working commands and [context](CONTEXT.md) to resume.
