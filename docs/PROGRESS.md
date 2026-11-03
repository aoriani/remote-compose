# Progress and handoff

Updated 2026-11-02. Current phase: **Stage 1, partial research and environment setup**.
The full prototype is not implemented. Stage 2's mandatory compile/render gate has not
passed. There are no backend, editor, Android or iOS product modules.

## Completed work

- Inspected empty workspace and Development parent; attempted Git status/history/init.
- Investigated indexed upstream parser/registry/test source, creation-core build config,
  relevant parser history, and experimental architecture/status documentation.
- Recorded sources, actual creation-format findings, separate dialect risk and unresolved
  dependency/version selection in portable files.
- Added candidate primitive JSON, environment diagnostics, handoff checks, design diagrams,
  planned acceptance/behavior tests and future caching research.
- Created all requested documentation entry points with explicit implementation status.

## Validation

- `python3 scripts/check-project.py`: **passed**; required handoff files, local Markdown
  links, candidate JSON syntax and research lock consistency checked. This is not a
  compiler/player test.
- `python3 scripts/doctor.py`: executed; **exit 1 as expected**. Missing Node/npm,
  CMake, sdkmanager, avdmanager, project Git repository and compatible upstream pins.
  Gradle/kotlinc are also absent from PATH; no Wrapper has been added yet.
- Direct JBR CLI probe: OpenJDK 25.0.4 found; build compatibility not tested.
- Per-command Xcode selection: Xcode 27.2 and iPhoneSimulator27.2.sdk resolved successfully.
  No app build/test performed. adb and emulator executables were found, but no device or
  emulator was launched or exercised.
- No JSON compilation, binary decoding, browser rendering, Android build/test, iOS build/test,
  animation, interaction, publishing or refresh tests have run.

## Blockers

1. `git init -b main` fails: `.git: Operation not permitted` under the current execution
   permissions. Files are saved but **not committed**. Branch: none. Commit: none.
2. Shell outbound source acquisition fails: `Could not resolve host: github.com`.
   Web tools expose only some cached/indexed source and cannot provide complete checkouts.
3. Upstream compatible revisions cannot yet be selected/verified; `upstream-lock.json`
   retains null implementation pins. References are not a compatibility lock.
4. Node/npm/CMake/Gradle and Android command-line tools are absent or unresolved. Selected
   build versions and runtime dependencies still need network-enabled investigation.

## Next actions

Resolve authorized workspace Git/network access, acquire sources, inspect all required
upstream docs/code/tests/history, then select exact revision/dependency pins. Implement a
minimal plain Kotlin/JVM compiler probe with the upstream creation parser; inspect its
binary in remote-core and render those same bytes with the real TypeScript player.
Record evidence before starting backend/editor work.

Subsequent stages: backend preview/publish/version tests; genuine browser integration;
palette and custom-preserving JSON editor; two protocol-native animations and host events;
Android CLI player/debug shell; iOS C++ bridge/debug shell; same-binary cross-platform
demo; clean-checkout verification. See [development plan](DEVELOPMENT_GUIDE.md).

## Git handoff

No commits exist, no existing history was modified, and nothing was pushed. All created
files currently live only in the working directory. Once metadata writes are possible,
review files, run checks and create `docs: record initial Remote Compose investigation`.
Do not invent milestone hashes or report this directory as a portable Git clone yet.
