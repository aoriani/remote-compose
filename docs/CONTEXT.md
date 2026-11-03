# Durable technical context

Read [progress](PROGRESS.md) before coding. This workspace began empty on 2026-11-02.
No existing user code or repository was present. The initial session could create normal
files but `git init` was denied at `.git`. The user subsequently initialized Git and
committed the foundation: `main`, `123b8b17a0076d3b562e47fda6e76fa7710245e5`.
The resumed session confirmed a clean initial status. Shell Git/curl networking still
cannot resolve GitHub. No upstream checkout was acquired. Do not treat prior web
reviews as a deep local source audit.

## Resumed execution restriction diagnosis

The host Mac can access GitHub according to the user, but this session's execution
environment cannot: Git exits 128 and curl exits 6 for github.com. Python getaddrinfo
fails for github.com, raw.githubusercontent.com and repo.maven.apache.org; scutil
reports no DNS configuration. This localizes the observed failure to the execution
environment; it does not establish a particular host DNS/network defect.

The supported exec `require_escalated` request was attempted and rejected before
execution: approval policy `sandbox_approval: false` disallows escalated permission
requests. The error also mentions `request_permissions: true`, but no corresponding
request tool is exposed in the available tool inventory. Plugin permissions tools
control connected apps, not the shell sandbox, and must not be used as a substitute.
Do not bypass restrictions with another process, transport, or relocated Git metadata.
Git metadata writes also remain denied: staging the five documentation updates fails
creating `.git/index.lock` with `Operation not permitted`. User-side initialization
did not change this tool execution permission. Documentation updates remain unstaged.

## Important findings

- Investigate `remote-creation-core`'s `androidx.compose.remote.creation.json` parser.
  Indexed source exposes a direct ByteBuffer API; its implementation and dependencies
  still need a pinned local compilation test. See [research](RESEARCH.md).
- A separate remote-core JSON parser/test representation exists. Do not mix its
  operation/modifier shapes with the creation parser. The fixture is only a candidate.
- Header API level, version, profile and the player's registered operations are separate
  compatibility concerns. Do not claim a common protocol number from a parser default.
- Ordinary layout/canvas compositions should be enough for new business widgets, but
  unsupported operations still require renderer updates.
- Widget recognition must be conservative. Editor sidecar metadata is not the protocol.
- Experimental state parity claims are not pixel/event parity. Status documentation
  contains stale contradictions; use code and tests at pinned revisions.
- Pattern definitions/inflation exist in indexed creation registry source. This proves
  neither cross-document caches nor safe binary concatenation. Research only.
- OnClick value-change actions are local behavior. Host event emission and callback
  exposure remain unverified across browser, Android and iOS.

## Original machine observations (not portable requirements)

The default Java launcher has no runtime selected. JBR 25.0.4 is available under
Android Studio Preview's Contents/jbr/Contents/Home; it ran via CLI. That does not require
Android Studio use. No Kotlin compiler, Node/npm, CMake or Gradle executable was in PATH;
no Gradle Wrapper dependency cache was found. Android SDK exists with build-tools 36.0.0
and an android-37.0 platform, emulator/platform-tools directories, but no cmdline-tools.

Full Xcode 27.2 is installed, while the selected developer directory is CommandLineTools.
A per-command DEVELOPER_DIR selects Xcode without changing global settings. The iOS
simulator SDK probe succeeded using that selection (see progress). No mobile app was
built, launched, or exercised. Re-run doctor on a new machine; do not hardcode these paths.

## Resume sequence

1. Restore authorized shell download access and, if still restricted, Git metadata writes
   in the execution environment. This is a permissions/tooling prerequisite.
2. Inspect the existing repository status/history; do not initialize or restart the project.
3. Acquire existing-or-new upstream checkouts and read applicable instructions/all required
   Markdown; pin exact hashes after source/test/history review.
4. Select compatible dependencies, prove minimal JVM compilation and binary browser
   rendering, then update the evidence lock and implement the product stages.
5. Keep [decisions](DECISIONS.md), compatibility and setup docs synchronized with real work.
