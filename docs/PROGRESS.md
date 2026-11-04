# Progress and handoff

Updated 2026-11-04. Branch main. Current phase: usable cross-platform demonstration,
with measured compatibility limited to the fixtures below. Prior main was pushed with
explicit authorization; this editor-acceptance follow-up is local only.

Latest fix: Editorial stories now exposes the complete content/style fields for both tiles;
see the final section for regression evidence and scope.

Previous feature: canvas selection and Component JSON are implemented and verified; see the
final section and component-selection evidence. Native full-page regression is fresh.

Previous editor acceptance: all ten stages of `sh scripts/verify-editor.sh` pass; one async
published-load draft-loss defect fixed. See the final section and FULL_FEATURE_TEST_REPORT.
Browser/backend evidence is fresh; native results below are historical.

Latest full-page follow-up: the final section below supersedes the simplified default.
The original full retail page now has per-product controls and an integrated carousel;
see evidence/full-retail and run verify-full-retail.sh.

Historical interactive follow-up: see INTERACTIVE_DEMO.md and the final acceptance section
for carousel/local state, raw JSON publication, exact shared bytes and unchanged installed
client hashes. No remote push.

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

Native implementation, responsive source, tests and full-screen evidence commit:77e7d17.
The following evidence-summary commit records the final test totals. Branch main; no push.

## Interactive retail and raw-source lifecycle (2026-11-04)

Implemented a protocol-expression promotional carousel with three illustrated offers,
auto5s rotation, smooth slide/wrap, arrows, selectable active dots, banner events and
manual interval reset. Inspector supports2–5 slides, order, text/assets/colors, interval,
duration, visibility and action names. Added an explicit Load interactive demo action;
older static designed-page fixtures remain unchanged. Local favorite/category/quantity
and visible formatted counts use actual protocol state/actions. Hosts provide generic
Toast/native notice/browser logs, with no business widget or carousel timer.

Per-stage checks pass:85 JVM tests,12 model tests, twelve-template editor regression,
interactive/raw-JSON lifecycle,18 complete custom-tree preservation cases, deterministic
slide frames,37-event/no-backend stress test and null-action-name minimal reproduction.
Android build/unit/lint and four-case instrumentation suite pass; an additional native
selected-heart pixel test passes. iOS interaction/digest/resume/count and separate visible
heart XCTest methods pass. A final combined scripts/verify-interactive.sh run is being
collected; the following report/evidence milestone will record its outcome.

Fixed generic nested browser text initialization, alpha/color paint order and Android
Toast backlog. Initial native timing assumptions and a transient post-resume XCTest frame
were corrected with known-slide resets/stable geometry waits, preserving failed run notes.
Native exact bytes include original33a17957… and raw-editeda574d9eb… (see final proof).
All app-level source remains generic. General function/conditional blocks, physical devices,
remote accessibility and strict cross-player font equivalence remain unverified/out of scope.

Private GitHub repo https://github.com/aoriani/remote-compose was created at fdb1854;
origin SSH is configured, GitHub repository size0 confirms no push. No history rewritten.
See INTERACTIVE_DEMO.md and GITHUB_SETUP.md. Final screenshot/report commit follows.

### Interactive final acceptance evidence

The combined scripts/verify-interactive.sh passed end to end on source milestonebbdf2fc:
85 JVM/12 model tests, real browser workflows,5 Android instrumented cases and2 iOS UI
methods. Original109-byte proof remains intact. A separate live browser→native refresh
run passed: already running apps6→7, new nested text/vector/row source, exact shared
SHAa91ef946… and unchanged **installed** executable hashes. Both platforms emit the new
composition's promotion callback. Another iOS live-refresh UI method passed.

See FULL_FEATURE_TEST_REPORT, INTERACTIVE_DEMO and evidence/interactive/proof.json plus
18 actual screenshots. Main suite versions4/5/6 prove primitive original/edited rendering;
live7 proves a publication update without app rebuild. Backend8092 holds this isolated
interactive demo; original8080 publication19 is preserved. Native apps are left running
against8092/latest. No push. Follow-up report/evidence commit followsbbdf2fc.

Next: presentation review, optional inspector grouping/long-copy handling, namespace-safe
multi-carousel authoring, physical-device/accessibility/performance validation. General
protocol functions and strict cross-player typography parity are still not certified.

## Interactive design is now the default (2026-11-04)

Fresh editor sessions and Reset now use the fully interactive retail composition, not
the older static landing page. The previous design remains explicitly available via
Load previous static design. One shared source factory drives startup and the checked-in
interactive fixture. Untouched saved copies of the old default migrate with a local backup;
custom/modified/malformed drafts are preserved. No publication is changed by startup/reset.

Verified14 model tests, existing real twelve-template browser regression and a new real
browser startup/reset/legacy/migration/custom-draft/player-event test. Screenshot and
results are in evidence/default-design. Restarted the stale8080 JVM service with the
already validated current compiler; its existing publication19 was preserved. No native
changes or remote push. This milestone's commit is identified by git log.

## Full bundled retail design corrected and verified (2026-11-04)

The earlier60482fa two-section default is superseded. The **original full retail page**
now contains the rotating three-banner carousel and independent outlined/filled hearts,
pressed Add feedback and functional minus/quantity/plus on all three existing products.
Header, hero, category pills, imagery, stories and rewards are preserved. Both bundled
JSON filenames represent the same full source factory; the alternate design button is gone.
Inspector/raw editing preserves state/actions; existing modified drafts remain intact.

Verified: combined scripts/verify-full-retail.sh;85 JVM tests (fresh run),16 model tests,
12-template real editor regression, startup/reset/migration, full-page browser/native tests
with27 exact events per platform, full-page carousel configuration/deterministic browser
frames and native live motion screenshots. Android unit/lint/CLI checks pass; iOS real
XCTest passes. Actual full-page product screenshots were inspected on both platforms.
Publication12/8092 is1,980,638bytes SHA5f32c3221aa7ce717151c6f0adb8e591de968abe2b172f97bff511748d258bda.
Both native executables are unchanged from the previous milestone. No production native
code or upstream pins changed. No push. Evidence: docs/evidence/full-retail and the final
section of FULL_FEATURE_TEST_REPORT. The following local implementation commit identifies
this milestone; inspect git log for its hash.

Found/fixed implicit horizontal-scroll constant repaint resets by using an exported named
scroll variable; added sample files as Gradle test inputs; rejected duplicate collection
namespaces. Earlier failed harness timing/viewport assumptions are recorded in the report.
Next: review the full design on the presentation machine, optional larger quantity touch
targets/namespace-safe collection duplication, then physical-device/accessibility checks.
State remains session-local; native fonts/ripples and unsynchronized animation clocks differ.

Demo handoff: normal backend8080 now has immutable publication20, identical verified full-page
bytes/hash. Both native apps are running against8080/latest (no version pin), so subsequent
editor publications can be fetched normally. The old8080 publication19 remains in history.
Historical raw-JSON and stress browser regressions additionally pass on isolated8094.

## Root documentation refreshed (2026-11-04)

The root README now introduces the full retail prototype with embedded actual editor,
Android and iOS screenshots from the committed full-page evidence. It includes current
features, architecture, first-run commands, native setup links, validation scope, repository
map and limitations, tied to implementation1b4ef0f. Removed obsolete eleven-template and
Load designed page instructions from current entry-point guides; historical reports remain.
GETTING_STARTED now selects the standalone Android ViewerTest and iOS landing method
explicitly, avoiding accidental execution of suites that require other manifests.

Documentation-only validation: doctor prerequisites pass; project Markdown/link/JSON checks,
README image existence/dimensions/evidence-hash checks and git diff --check pass. Existing
rendered screenshots were inspected. Runtime suites were not rerun for documentation edits.

## Android Material 3 debug sheet (2026-11-04)

Replaced the plain bottom-positioned Dialog with a genuine Compose ModalBottomSheet using
existing Material3 1.3.2. Connection/Document/Events tabs now provide labeled settings,
Auto-refresh, inline errors, a persistent Apply/refresh button, readable selectable metadata
and a newest-first event log. Dismissal discards drafts; tab switches preserve them. New
cadence settings reset the pending refresh callback. No Remote Compose renderer, document,
upstream pin, backend, editor or iOS change. Based on clean main at d0d5728.

Verified: assembleDebug,4 unit tests, lint (0errors/206 existing scan warnings), DebugSheetTest,
2 ViewerTest methods, ViewportTest and FullRetailTest all pass. The full retail test exercises
27 expected actions with the same1,980,638-byte published binary. After the large-text tab fix,
assemble/unit/lint and DebugSheetTest were rerun successfully. Actual emulator screenshots
were inspected at411.43dp/1.0font and360dp/1.3font, including software keyboard, scrolling,
metadata and a real Scan & Go event. Downward sheet dismissal is manually verified.
Evidence and scope: [full report](FULL_FEATURE_TEST_REPORT.md#android-material-debug-bottom-sheet--2026-11-04)
and [screenshots/manifest](evidence/android-debug-sheet/manifest.json).

The APK is installed on the running Android emulator. Its backend remains8080/latest(v20).
Display/font/keyboard test overrides were restored. Physical-device, dark-mode, landscape
and TalkBack checks remain unverified; browser/iOS were not rerun for this Android-only UI
change. Next: obtain user feedback on the new sheet, then resume the broader demonstration
validation backlog. Commit this milestone locally as `fix: replace Android debug dialog with Material bottom sheet`; do not push.


## README coverage and authorized GitHub publication (2026-11-04)

User authorized pushing main to the existing private GitHub repository. Reviewed the clean
branch at9853484 and confirmed origin/account/private visibility. Before the first push the
remote has no branches, so publication includes existing local history. Default SSH fails
host-key verification; authenticated HTTPS works with a command-scoped rewrite (origin is
preserved). See [GitHub setup](GITHUB_SETUP.md) for transport and audit scope.

README now links every tracked Markdown guide and includes the new Android debug screenshot,
usage, implementation and test links. Architecture explains snapshot flow, draft validation,
settings persistence, refresh scheduling and generic host events. Development documents
extension/testing boundaries. Existing historical research/evidence remains intact.

Validation: doctor passes; check-project.py passes complete README coverage, local links and
image paths; Python compilation and an isolated positive/negative coverage-check exercise
pass; git diff --check passes. Historical targeted secret/filename scan found only a reviewed
synthetic URL validation fixture and no real findings/oversize blobs. Runtime suites were
not rerun for these documentation/checker changes; Android runtime results remain scoped
to9853484. This milestone's publication is authorized; future pushes require authorization.


## Full editor acceptance and draft-loss fix (2026-11-04)

Started clean on main at aac2c0e. Updated stale property tests and added an isolated,
random-port acceptance runner. All ten stages of `sh scripts/verify-editor.sh` pass:
85 JVM tests (also forced fresh),16 model tests,12-template smoke,76 inspector edits,
30 binary/gallery fixtures,18 complete custom-tree preservation cases,21 lifecycle checks,
full-retail27 events, raw-JSON18 events and stress37 events with no interaction HTTP.
Nine historical browser goldens are pixel-identical; screenshot hash rejection negative
control passes. Actual rendered screenshots were inspected, including mid-slide and selected
product states. See [report](FULL_FEATURE_TEST_REPORT.md#full-editor-acceptance--2026-11-04)
and [portable evidence](evidence/editor-acceptance/README.md).

Fixed the reproduced Load published race: a pending source response no longer replaces newer
typing. Malformed responses preserve draft/preview and busy controls prevent concurrent load/
publish requests. No backend, native app, primitive protocol or upstream pin changes.
Current demo backend publications were not touched. Final local run:
artifacts/editor-acceptance/2026-11-04T14-41-39.965Z. Initial failing runs are retained and
explained; they are not counted as passes. The final suite also checks documentation.

Known limits: wheel scrolling and canvas keyboard/screen-reader semantics, absent undo/redo,
protected ID-bearing duplication, static full-page category pills, Chrome-only execution.
No fresh native rerun. Next: broaden browser/native acceptance and improve inspector field
organization separately. Commit this tested source/evidence milestone locally; no push is
authorized for these new changes. Use git log to identify its final commit hash.


## Component selection, scoped JSON and native regression (2026-11-04)

Implemented Select/Interact modes, measured layout outlines, exact Component JSON/path,
nested Parent navigation, Find in document and isolated subtree Apply. Pending scoped drafts
survive reload; malformed/stale buffers preserve document/preview. Full source remains the
protocol source of truth. Picking is disabled for stale previews or mismatched player trees.
No published editor metadata, renderer/compiler changes or native source changes.

Verified: full verify-editor command11 stages pass; final targeted18-case selection rerun;
85 fresh JVM,16 model,3 source/mapping,4 fresh Android unit tests;9 unchanged pixel goldens;
Android assemble/lint and4 instrumentation tests; iOS build and full-page XCTest pass.
A headline edit authored through Component JSON produced one1,980,638-byte publication with
SHA c3e96414df541d94e1fdc80c2674efda5bbd20feb6b33b27ed81a33d80fd6238; both native tests
verified its digest and27 actions. Full native/editor screenshots were inspected. Client
build hashes remained unchanged across publication and native execution. See
[report](FULL_FEATURE_TEST_REPORT.md#component-selection-and-native-regression--2026-11-04)
and [evidence](evidence/component-selection/README.md).

Known limits: canvas-command granularity, Interact required for scrolling, no general
source-map contract for unsupported player operations. Existing browser zIndex modifier bug
was isolated with a minimal reproduction; selection follows actual painted order. No upstream
changes or cross-platform zIndex claim. Human novice-usability sessions remain recommended.
Native apps returned to8080; its publication and prior ignored native test binding preserved.
Changes are committed locally on main; identify the milestone with git log. Do not push
without new authorization. Next: novice usability observation, then separate zIndex research.


## Editorial stories property completeness — 2026-11-04

Fixed the user-reported missing controls: both existing story tiles now expose all visible
text, images, colors and font sizes (31 fields), grouped with Story 1 / Story 2 shortcuts.
The default primitive output is unchanged; property edits update only the selected leaf.
Custom compositions remain preserved.

Validated `sh scripts/verify-editor.sh`: 20 Node tests, 12 browser stages, 105 property edits,
30 compiled/rendered fixtures and nine pixel-identical goldens. Dedicated real-UI coverage
edits every story field, checks JSON round trips, palette insertion and section operations,
and renders tile two through horizontal drag. Both final screenshots were visually inspected.
JVM tests were UP-TO-DATE; native clients were not rerun for this editor-only fix. See
[evidence](evidence/editorial-stories/README.md) and FULL_FEATURE_TEST_REPORT for scope.

Changes are committed locally on main in the editorial-properties fix milestone following
35aef64; no push requested for this fix. Demo backend/publication and native apps unchanged.
Next: user review of the two story groups; longer text still requires manual geometry
adjustments in JSON. Existing player zIndex/font/accessibility limitations remain open.
