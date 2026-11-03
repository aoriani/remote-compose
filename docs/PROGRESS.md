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
- Seven Node editor-model tests.
- Browser end-to-end: eleven templates compile, real PNG draws, both protocol animations
  change, arbitrary custom copies survive, publish works, event 42 reaches host, invalid
  publication preserves previous document and preview. No unknown-opcode warnings.
- Android assembleDebug, one unit test, lintDebug (zero errors; upstream warnings), one
  connected instrumentation test on Android 17/API-37 emulator. Instrumentation verifies
  real network fetch/digest, actual player input/event 42 and failed refresh preservation.
- iOS arm64 Simulator app built with CMake/Swift/Metal, installed and exercised on iPhone
  18 Pro. Original engine-input smoke checks failed refresh preservation. New real XCTest
  UI test verifies pointer events 42/99, native log clearing and captures both scroll axes.
- Both native players rendered animation fixture; consecutive screenshots show different
  badge and progress pixel areas. Both then auto-fetched the corrected custom composition.
- Corrected custom document: 932 bytes, SHA-256
  `3ea80866c330a6f27b827ec964b4d86909fa1b77cafc3926e241b9e047a7d871`.
  Screenshots and compact records are in [evidence](evidence/cross-platform.json).
- Expanded clean-checkout reproduction at 86e9595 passed all 79 JVM tests, six model
  tests, browser workflow, Android assembly/unit/lint and the iOS Simulator build. The
  exact custom document digest reproduced with clean source trees. Installed host JDK,
  Chrome, Android SDK, Xcode and CMake were external prerequisites. See
  [reproduction evidence](evidence/expanded-clean-checkout.json).

## Important limitations and next work

- SVG drawPath generated an Android error and missing C++ geometry in a real trial.
  Strict service now rejects paths; the corrected fixture uses verified circle primitives.
  Shader paint state persists: reset with paint shader=0 before solid drawing.
- Experimental browser typecheck still fails upstream; bundle/runtime tests pass.
- Physical devices, signed iOS device packaging, Intel iOS Simulator and broad protocol
  conformance remain unverified. Native gesture/UI automation coverage is partial.
- Only selected API-7 primitives are enabled; source support does not imply player parity.
  Images are verified in browser and visually checked in both native landing pages.
- Next: broaden native UI automation and automated landing-page image/scroll fidelity
  checks; investigate path encoding separately. Repeat on another machine when available.
- Reusable binary fragments/cache are research only; no optimization was implemented.

## Git milestones

`91f43a9`: strict validation and atomic backend. `cf1d42e`: JSON-preserving editor,
images/animations/host actions. `86e9595`: native viewers, cross-platform render proof and setup documentation.
The final source-guard/reproducibility handoff follows; use `git log -5` for its hash. No user files were discarded or history rewritten.
See [setup](GETTING_STARTED.md) for working commands and [context](CONTEXT.md) to resume.

## Demonstration-readiness review completed

Editor fixes and regression checks are validated: all eleven templates exercised through
add/property/move/duplicate/delete controls, custom resource-backed trees preserved,
malformed/offline/stale compilation preservation, exact JVM/player digest equality and
390/768/1100/1500px layout checks. Seven Node model tests pass. Native gestures, images, both animations and matching 4,163-byte publication 7 were
verified. iOS raw metadata is collapsible; one actual XCTest UI test passes. See
[review](DEMONSTRATION_REVIEW.md) and [results](evidence/readiness/results.json).
Editor fixes commit `78fb077`; native test/evidence commit follows (git log identifies it).
All requested review areas are covered on the documented emulator/Simulator setup.
No physical-device or general protocol conformance claim is made.
