# Remote Compose prototype

Build a cross-platform visual authoring prototype: upstream primitive JSON →
Kotlin/JVM compiler → one binary document → genuine browser, Android, and iOS players.
The visual widget catalog is an authoring convenience. Clients must not implement
business widgets. New compositions use supported primitives; new protocol capabilities
can still require client releases.

## Recover context first

1. Read this file, `docs/PROGRESS.md`, `docs/CONTEXT.md`, and `docs/DECISIONS.md`.
2. Inspect Git branch, status, diff, and recent history; preserve existing work.
3. Run `python3 scripts/doctor.py`; inspect `upstream-lock.json`.
4. Read relevant implementation and research before continuing the next milestone.

## Current layout

- `docs/`: research, design, evidence, and handoff. Distinguish plans from verified behavior.
- `samples/`: candidate upstream-format fixtures; see their README for validation status.
- `scripts/`: portable environment diagnostics and project checks.
- `upstream-lock.json`: exact sources verified for the minimal JVM/browser fixture.
- `pipeline/`: standalone Kotlin/JVM compiler CLI, unchanged upstream sources and tests.
- `player-smoke/`: real binary browser player harness and automated pixel checks.
- `web-editor/`: designed authoring workbench, asset gallery and genuine browser preview.
- `assets/`: original transparent artwork, prompts and separate JVM/editor catalogs.
- `samples/retail-home.json`: full interactive default; `interactive-retail.json` is an identical compatibility alias.
- `docs/DESIGN_SYSTEM.md` / `docs/VISUAL_REDESIGN.md`: visual conventions and actual render evidence.
- `android-player/`: Java generic viewer, Kotlin Material3 chrome and official AndroidX renderer.
- `ios-player/`: Swift debug shell, Objective-C++ bridge and C++/Skia Metal renderer.
- Backend HTTP service and immutable version store are in `pipeline/Backend.kt`.
- Run `sh scripts/verify-demo.sh` for backend/editor checks; mobile commands are in GETTING_STARTED.

## Development rules

- Prove JSON → JVM binary → genuine player before implementing the editor.
  That minimal gate now passes; preserve it with `sh scripts/verify-pipeline.sh`.
- Inspect pinned upstream source, tests, build files, history, and all applicable
  upstream instructions. Recursively read upstream Markdown as required by AndroidX.
- Do not treat research commit references as tested compatible dependency pins.
- Do not create another business-widget protocol or an HTML approximation renderer.
- Primitive JSON is authoritative. Keep editor metadata separate; preserve custom trees.
- Android must build, test, install, and debug using SDK/Gradle/emulator CLI tools.
  Do not depend on Android Studio workflows. iOS builds require Xcode on macOS.
- Use meaningful commits after validated milestones; never reset user work, rewrite
  history, force-push, or push without explicit authorization.
- If Git/network permissions block work, record exact failures. Do not bypass restrictions.
- Test changed behavior. Record commands, results, revision, and platform. A source
  inspection or successful parse is not a rendering or compatibility test.
- Update PROGRESS, CONTEXT, DECISIONS, and relevant setup/feature docs alongside changes.
- Before ending: run applicable checks; report branch, commit, dirty files, limitations,
  and next steps. Do not describe scaffolding or upstream claims as working product code.

Start with [README](README.md) and [research](docs/RESEARCH.md).

## Full rendering validation

Read docs/FULL_FEATURE_TEST_REPORT.md and inspect docs/evidence/full-validation.
Run `sh scripts/validate-all.sh` on a free emulator/Simulator (isolated backend8091);
`FULL_NATIVE=0` runs JVM/browser only. Do not run two native suites against one device.
Strict cross-platform pixel discrepancies are retained separately from functional and
same-platform golden checks. Never approve baselines solely because tests pass. Keep
plans.json/run.json test bindings separate from primitive documents. Preserve pins.

## Native viewport contract

Read docs/NATIVE_LAYOUT_FIX.md. Native players measure available dp/points; header390×844
is not an aspect-ratio constraint. Keep only device pixel conversion. Preserve actual
native screenshot dimensions and full-screen evidence: cropping a fitted rectangle can
hide container defects. Use scripts/verify-native-layout.sh for four-device checks;
legacy390×844 goldens must reject incompatible viewports, not stretch the image.

## Interactive demo

Read docs/INTERACTIVE_DEMO.md. The default is the full Common Market retail page, not the
former two-section test fixture. Run scripts/verify-full-retail.sh for full-page acceptance. Carousel/product
state is protocol-local; do not add platform timers/business widgets. Preserve the generic
explicit products_scroll variable and browser nested-TextData shim and minimal repro. Run scripts/verify-interactive.sh with an
isolated backend8092, idle emulator and IOS_SIMULATOR; see its prerequisites. origin is a
private GitHub repository; no push is authorized.
