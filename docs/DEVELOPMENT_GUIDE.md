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

This runs verify-demo (JVM/model/real-player smoke) and ten broader real-browser stages.
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
