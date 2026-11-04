# Development guide

Read AGENTS and current PROGRESS before changing code. Preserve source pins and clean
upstream checkouts. `sh scripts/verify-demo.sh` runs JVM, model and real browser tests.
Mobile commands and prerequisites are in [setup](GETTING_STARTED.md).

Templates live in web-editor/model.mjs. Add only upstream primitive structures; declare
editable property paths and use conservative structural recognition. Never serialize a
widget discriminator into the protocol. Test custom-tree preservation and patch locality.
Raw JSON is authoritative; form mismatch must fall back to Custom. Section duplication
with declared IDs must fail until proven-safe ID remapping is implemented.

Validation.kt defines the service subset, not the template catalog. Add an operation
only after checking pinned parser semantics, validating its fields and exercising actual
compiled bytes on the intended player. Add invalid-input/location tests too. Keep the
permissive research CLI separate. Add resources to assets/catalog.json and editor labels to assets/library.json; the
validator reads the actual JVM catalog dynamically; never introduce uncontrolled server-side network fetching.

Backend.kt owns version transactions, conditional fetch and static editor hosting. Tests
must prove invalid compilation preserves previous publication and preview is isolated.
Never edit immutable stored versions. The development service has no authentication.

Android MainActivity is the native debug/fetch shell around official RemoteComposePlayer.
iOS Player.swift wraps the actual C++/Skia bridge. Neither may implement business widgets.
Keep fetch/decode failure preservation and host/local action distinctions. Android uses
Gradle/SDK/adb CLI; iOS uses CMake/xcrun. No physical-device iOS signer is configured.

Update PROGRESS, CONTEXT, DECISIONS, compatibility and setup with each tested milestone.
Commit source/tests/docs together; keep artifacts/caches/secrets out of Git. Push only with explicit user authorization.

For visual work use DESIGN_SYSTEM.md and the exact artwork prompts in assets/PROVENANCE.md.
Keep mobile content primitive; capture actual player screenshots before accepting changes.
Do not change old fixtures to hide regressions. Image replacements must patch only the
chosen reference, including in custom trees. The JSON editor virtualizes highlight lines;
do not restore full-document span mounting for large source documents.

## Rendering regression workflow

`sh scripts/validate-all.sh` extends the existing JVM, Playwright, instrumentation and
XCTest suites; it does not add an alternate renderer. New primitive gallery cases belong
in scripts/generate-validation.mjs. Test-only interaction coordinates/ROIs stay in plans,
not protocol JSON. A publication is compiled once, and all viewers select its immutable
version/full SHA. Inspect actual screenshots and native logs before declaring a pass.

`compare-validation.mjs` retains strict cross-platform failures; `check-visual-baseline.mjs`
checks reviewed static goldens within each platform and rejects changed fixture hashes.
Keep native window size/density and normalization in the evidence. Never silently regenerate
baselines to bless a failure. The reporter produces local REPORT.md/summary.json even when
strict comparison fails. GUI tests must not run concurrently against the same emulator.


## Android debug UI changes

Keep native diagnostics in `PlayerChrome.kt` / `DebugSheet.kt`. Add generic snapshot fields
through `DebugInfo` and `MainActivity.showState()`; use `DebugActions` for host mutations.
Never put document-specific state, navigation or animation logic in the native sheet.
Preserve the separate draft/apply lifecycle and bounded immutable event snapshots described
in [Architecture](ARCHITECTURE.md#android-native-debug-sheet).

Run the Android unit and CLI instrumentation command in the
[debug-sheet test report](FULL_FEATURE_TEST_REPORT.md#android-material-debug-bottom-sheet--2026-11-04).
`DebugSettingsTest` checks input validation. `DebugSheetTest` drives real accessible controls
and an upstream-player host callback; ViewerTest and ViewportTest protect refresh and layout.
Use UiAutomation on the API37 preview image because the pinned Espresso reflection path
fails there. Inspect emulator screenshots with the keyboard open and larger text before
accepting a layout change. Preserve existing dependency pins unless a separate change justifies it.


## Full editor acceptance

After installing the prerequisites and setting JAVA_HOME, run:

```sh
sh scripts/verify-editor.sh
```

This runs verify-demo (JVM/model/real-player smoke) and twelve broader real-browser stages.
It starts a private backend on an ephemeral port, preserves demo publications and the existing
full-retail test binding, and shuts that backend down. No emulator/Simulator is required.
`artifacts/editor-acceptance/latest.json` identifies the completed run; its run.json lists
individual stage results, with logs and actual screenshots beside it. A stage failure fails
the command, while independent stages continue to collect evidence. No native rerun is implied.

Add real UI behavior to player-smoke/editor-lifecycle.mjs; add primitive fixtures to the
existing gallery generator. Keep custom-tree equality and exact binary/hash assertions.
Large multiline JSON tests should use editor-input.mjs, which exercises clipboard paste and
restores supported clipboard formats, instead of Chromium's event-heavy multiline fill path.
The reviewed browser baseline manifest reuses earlier images and enforces fixture identity;
inspect source/hash changes before approving baseline revisions. See the
[acceptance report](FULL_FEATURE_TEST_REPORT.md#full-editor-acceptance--2026-11-04).


## Selection regression checks

The full editor acceptance now includes `player-smoke/selection-smoke.mjs`: real canvas
picking, scoped edit/recovery, exact document-range navigation, malformed/stale drafts,
custom shorthand/nested layouts, zoom, scrolling, overlap and clipping. Three source-navigation
and mapping guard tests run alongside the model tests. Selection must not emit host events;
Interact must retain the original callbacks. Preserve the source/tree identity checks when
changing the player or parser, and never introduce editor IDs into the mobile document.

For native regression, `RC_TEST_URL=http://127.0.0.1:8092 sh scripts/node.sh node
player-smoke/selection-publish.mjs` authors a full-page headline change through the actual
component inspector and publishes it. It writes samples/full-retail-run.json for the existing
Android FullRetailTest and iOS testFullRetailPage. Run these sequentially after browser
acceptance; both suites share that test binding. Use an isolated8092 publication store, not
the live8080 demo. The entry point is a Node command on one line:

```sh
RC_TEST_URL=http://127.0.0.1:8092 sh scripts/node.sh node player-smoke/selection-publish.mjs
```


With SDK/JDK variables configured and both native clients installed (see Getting started),
the native checks used for this scoped-edit handoff are:

```sh
adb reverse tcp:8092 tcp:8092
sh scripts/gradle.sh -Pandroid :android-player:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=demo.remotecompose.FullRetailTest,demo.remotecompose.ViewerTest,demo.remotecompose.DebugSheetTest --console=plain
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test \
  -project ios-player/UITests.xcodeproj -scheme DemoUITests \
  -only-testing:DemoUITests/DemoUITests/testFullRetailPage \
  -destination "platform=iOS Simulator,id=$IOS_SIMULATOR" \
  -derivedDataPath ios-player/build/uitests CODE_SIGNING_ALLOWED=NO
```

Preserve any prior samples/full-retail-run.json before publishing this test change and
restore it after both native suites finish. Do not publish other test documents or run a
second suite against the same native devices during this handoff. Restore the viewers'
normal backend URLs afterward; these commands do not change the live8080 publication.


## Template property coverage

When expanding a template inspector, preserve its emitted primitive JSON. Editorial stories
uses field options.group to organize all values for Story1 and Story2; the UI shortcuts scroll
to each group. Property updates still patch one path. Images and text styles remain primitive
commands, not an editor-specific runtime format. Structural customization must still fall
back to JSON rather than regenerating a partially recognized template.

Do not derive all completeness assertions from the descriptor list being tested. Independently
walk the template's visible drawing operations and verify expected text/image/style fields
exist. The editorial model regression does this, while player-smoke/editorial-stories.mjs
exercises the actual controls in both the bundled document and palette-created section.
`sh scripts/verify-editor.sh` includes that browser case plus the existing full suite.
