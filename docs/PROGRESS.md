# Progress and handoff

Updated 2026-11-02. Current phase: **Stage 1, partial research and environment setup**.
The full prototype is not implemented. Stage 2's mandatory compile/render gate has not
passed. There are no backend, editor, Android or iOS product modules.

## Resumed session

Read AGENTS, progress, context and decisions before changes. Confirmed the user's
foundation commit `123b8b17a0076d3b562e47fda6e76fa7710245e5` on `main`, with a clean
working tree at startup. Preserved all existing research and corrected obsolete claims
that Git was uninitialized. Upstream access remains an execution-permission issue;
no architectural conclusion or implementation pin follows from this failure.

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
  CMake, sdkmanager, avdmanager and compatible upstream pins on the resumed run.
  Gradle/kotlinc are also absent from PATH; no Wrapper has been added yet.
- Direct JBR CLI probe: OpenJDK 25.0.4 found; build compatibility not tested.
- Per-command Xcode selection: Xcode 27.2 and iPhoneSimulator27.2.sdk resolved successfully.
  No app build/test performed. adb and emulator executables were found, but no device or
  emulator was launched or exercised.
- No JSON compilation, binary decoding, browser rendering, Android build/test, iOS build/test,
  animation, interaction, publishing or refresh tests have run.

## Blockers

1. Initial Git initialization was completed by the user. Repository reads work, but
   `git add README.md docs/CONTEXT.md docs/DEBUGGING.md docs/DECISIONS.md docs/PROGRESS.md`
   exits 128: `Unable to create .../.git/index.lock: Operation not permitted`. This
   execution environment still lacks normal Git metadata write access.
2. Exact command `git ls-remote https://github.com/camaelon/remotecompose-experiments.git HEAD`
   exits 128: `Could not resolve host: github.com`. Curl independently exits 6. Python
   getaddrinfo fails for GitHub, raw.githubusercontent.com and Maven Central; scutil
   reports `No DNS configuration available`. User reports successful host access.
   `require_escalated` was attempted through exec but rejected before execution because
   the approval policy sets `sandbox_approval: false`. No dedicated permission-request
   tool is exposed. This is an execution restriction, not an architectural blocker.
3. Upstream compatible revisions cannot yet be selected/verified; `upstream-lock.json`
   retains null implementation pins. References are not a compatibility lock.
4. Node/npm/CMake/Gradle and Android command-line tools are absent or unresolved. Selected
   build versions and runtime dependencies still need network-enabled investigation.

## Next actions

Resolve authorized execution-environment Git/network access, acquire sources, inspect all required
upstream docs/code/tests/history, then select exact revision/dependency pins. Implement a
minimal plain Kotlin/JVM compiler probe with the upstream creation parser; inspect its
binary in remote-core and render those same bytes with the real TypeScript player.
Record evidence before starting backend/editor work.

Subsequent stages: backend preview/publish/version tests; genuine browser integration;
palette and custom-preserving JSON editor; two protocol-native animations and host events;
Android CLI player/debug shell; iOS C++ bridge/debug shell; same-binary cross-platform
demo; clean-checkout verification. See [development plan](DEVELOPMENT_GUIDE.md).

## Git handoff

Branch: `main`. Latest commit: `123b8b1` (created by user). Nothing was pushed or rewritten.
Five documentation files remain modified and unstaged: README, CONTEXT, DEBUGGING,
DECISIONS and this file. `git add` failed before staging because index.lock creation
is denied. `python3 scripts/check-project.py` and `git diff --check` pass. Doctor ran
and exits 1 for missing prerequisites/pins. No compiler/player tests ran. Upstream
sources/dependencies are still unavailable, so runtime milestones remain unimplemented.
