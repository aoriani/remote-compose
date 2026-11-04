# Progress and handoff

Updated 2026-11-03. Branch main. Current phase: usable cross-platform demonstration,
with measured compatibility limited to the fixtures below. No remote push performed.

Latest native follow-up: see NATIVE_LAYOUT_FIX.md for corrected full-width dp/point
layout, Android Material3 chrome and passing four-configuration native checks. Earlier
cropped native evidence did not catch container margins; its390×844 baselines are historical.

Previous handoff:31 shared binary documents validated;81 JVM/9 model tests, native GUI
and lifecycle checks pass within recorded scope.15 strict pixel comparison flags and
font/accessibility gaps remain. Read FULL_FEATURE_TEST_REPORT and the final sections
below before historical milestones.6c66fb6 contains the first fixes; the following
validation/evidence commit is identified by git log. The working tree was clean at start.

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

- 80 JVM tests: 63 upstream parser tests plus 17 local compiler/backend tests.
- Eight Node editor-model tests.
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

- The earlier SVG failure is fixed: the adapter now emits only populated path elements.
  Inline finite absolute M/L/C/Z paths are verified in all three players; general SVG
  import/named path resources remain unsupported. Shader paint state persists: reset0.
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

## Visual redesign — validated asset/compiler foundation

Four distinct original assets, dynamic catalog validation, actual alpha-preserving PNG
embedding and populated-length vector serialization are implemented. 80 JVM tests pass.
The curved SVG heart is visually verified on all three players. Original109-byte browser
pixel proof still passes. Editor and retail design/evidence follow in the next milestone.

## Visual redesign — current handoff

The default editor and page are redesigned as Common Market. Searchable original asset
gallery, insert/replace (including multiple targets and custom subtrees), distinct palette
glyphs, structured inspector, polished responsive canvas and source diagnostics work.
The retail composition uses real product illustrations, revised typographic hierarchy,
coherent spacing and authentic vectors. No business components or new mobile builds.

Actual browser/Android/iOS screenshots informed hero positioning, bitmap aspect ratio,
icon consistency and a padding-order fix that removed price clipping. JSON highlighting
now mounts only visible lines, preventing large-source editing timeouts. 80 JVM tests,
eight model tests, expanded browser regression, original 109-byte pixel baseline, Android
CLI/unit/lint/instrumentation and real iOS UI test pass. Native animation captures show
separate dot/bar changes. The shared final binary is 1,970,167bytes, SHA
`d6009a1f2e7d5a53d08cc9c6c42665d94e8d05e4f964dd36c4fec8684ae1eb3c` (local v12).

See [visual review](VISUAL_REDESIGN.md), [design system](DESIGN_SYSTEM.md),
[asset prompts](../assets/PROVENANCE.md) and [evidence](evidence/redesign/results.json).
Backend/assets/vector repair commit `5fb7132`; the editor/design/evidence commit follows.
Current limitations: fixed-frame long-copy behavior, roughly 1.97MB embedded-image payload,
small four-asset gallery, basic JSON editor, utilitarian native debug chrome and untested
physical-device/signing/accessibility coverage. Latest visual revision has not had a new
fresh-clone build; earlier reproduction evidence remains scoped to its recorded commit.
Next: presentation-machine visual review, accessibility/long-copy checks and more artwork.

## Comprehensive validation — first fixes verified

This review is in progress; do not read earlier scoped demonstration checks as exhaustive
conformance. All 11 widgets and 20 property controls were exercised through actual browser
UI, including source-preserving section operations. Fixed published-preview recompilation,
aspect-distorting image size edits, insufficient muted-text contrast, and acceptance of
silently dropped CircleShape clipping. 81 JVM tests, nine model tests, existing browser
regression and browser responsive/pointer/touch/keyboard checks pass. Wheel scrolling is
an observed player limitation. The expanded cross-platform corpus, native lifecycle tests,
strict screenshot differences and final report are being collected separately.

## Expanded gallery and lifecycle validation

The31-document corpus (11 edited widgets,18 primitive/custom fixtures,2 lifecycle documents)
has actual browser/Android/iOS captures and full digest checks. All18 complete custom trees
survive real visual operations.81 JVM and9 model tests pass; the109-byte browser proof is
preserved. Android assembly/unit/lint and2 instrumentation tests pass, including actual
visible-pixel retention across corrupt refresh and the recovered circle's RGB. The iOS
29-document gallery passes; its lifecycle test passes after correcting the automation's
switch hit target and asserting its value. The final strengthened iOS lifecycle test passes38.780s: an offline viewport retains
the actual green circle, and recovery requires a successful response rather than a stale
digest. See FULL_FEATURE_TEST_REPORT and evidence/full-validation. Native gallery and
lifecycle stages passed separately; failed earlier attempts remain recorded.

Fifteen of62 strict cross-platform ROI comparison rows differ; fonts are additionally
reported outside generic ROI gating. All deterministic animation geometry checks pass;
both live effects change in all players.27 reviewed initial golden checks and24 independent
repeat captures pass; the golden tool rejects two earlier bad Android capture frames.
Browser-only single-command validation ran successfully. Full native stages were executed
individually; do not imply a fresh clean-checkout one-shot native run was performed.


## Native viewport/app bar correction — current milestone

Both header aspect-fit adapters are removed. Android now has a native Compose Material3
TopAppBar/Scaffold and official-player AndroidView, logical viewport measurement and proper
safe insets. iOS lays out at the actual safe-area point viewport and maps input directly.
Responsive primitive right edges and bounded square hero artwork are server-authored;
no business-specific renderer was added and upstream pins are unchanged.

The focused scripts/verify-native-layout.sh passed end to end on two Android emulator
sizes and iPhoneSE3/iPhone18ProMax:82 JVM tests, unit/lint/build checks,3 instrumented tests
per emulator, two real XCTest executions and native full-screen/edge/circle/scroll checks.
Android150% native text and fractional-density coverage are additionally captured. Source
and test fixes address status-caption layout jumps and native debug-dialog lifecycle.

Old cropped390×844 native goldens hid the margins; capture tools now preserve real native
pixels and reject incompatible baseline sizes. See NATIVE_LAYOUT_FIX and evidence/native-layout
for root causes, before/after screenshots, actual physical/logical dimensions and hashes.
Next: matching-viewport cross-player parity references, native remote accessibility and
physical-device verification. This milestone does not certify general protocol parity.

Server-only hero-clearance publication19 was additionally rendered on the same installed
apps at both sizes, with identical client binary hashes and iOS test-without-building.
Native evidence/report and source changes are committed in the following local milestones;
use git log to identify their hashes. No remote push.
