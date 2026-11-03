# Durable technical context

Read [progress](PROGRESS.md), [decisions](DECISIONS.md), then inspect Git status/history.
The initial empty-workspace research is preserved in history. Foundation commit 123b8b1
was created by the user; 05f8e48 preserves the five prior sandbox/handoff updates.

## Working foundation (2026-11-03)

`pipeline/` builds unchanged AndroidX remote-core + remote-creation-core source in an
isolated Gradle JVM application. Kotlin calls the real creation JSON parser, then actual
remote-core decodes the bytes for inspection. `player-smoke/` serves those bytes to the
real TypeScript RcdPlayer. No widget/editor/HTML approximation draws the remote content.

Exact sources, dependency versions and scope live in `upstream-lock.json`. Both checkouts
are ignored and reacquired by scripts; source revisions and clean status are enforced
before compilation. Upstream root/remote AGENTS and run_tests guidance were inspected,
Markdown recursively inventoried/scanned, relevant architecture/parser/player guides and
actual tests/source reviewed. Neither upstream has been modified.

Minimal fixture: 109 bytes, v1.1.0, API 7 default, profile 0, 390×844. Its SHA-256 is
58eeeb0c27c70bfac67e8a1f1c94b8f456c4c0b4c252b09d5bb8949d04db4903.
Implementation commit: `93fce22`. A fresh Git clone with empty project caches reproduced
the entire pipeline, same binary digest and clean source trees; see
[evidence](evidence/clean-checkout.json). Installed JDK/Chrome were external prerequisites.
69 JVM tests pass (63 upstream, six local). Real Chrome checks binary hash and three
canvas pixels; screenshot was visually inspected. This establishes only the static
canvas fixture, not layout/text/events/animation or Android/iOS compatibility.

## Nonobvious discoveries

- Target `androidx.compose.remote.creation.json.RemoteComposeJsonParser` input, which
  accepts type/shorthand components and single-key ordered modifier arrays.
- The apparent alternate remote-core parser was a commented-out test. No working
  alternate parser exists in the pinned source; the initial research inference is corrected.
- Unknown components throw contextual exceptions; unknown modifiers and commands can
  be silently ignored. Strict authoring validation remains to implement.
- Default JVM platform returns empty image data and zero dimensions. Canvas/path
  compilation works, but image handling needs real services.
- Header metadata must be read from Header. CoreDocument dimensions are not populated
  by setVersion alone; the inspector reports Header properties, not uninitialized size.
- Byte order is big-endian. Protocol version, target API and profile are separate.
- The browser loader warns/returns on unknown opcodes, potentially rendering a prefix.
  Test expected content and reject warnings; do not rely on load completion alone.
- HostAction and browser callback registration exist at the pin. Local state actions
  remain distinct from host-visible events. Neither path has a prototype event test yet.
- Experiments STATUS/GAPS lag code: history and current TS/C++ Loom implementations
  supersede old claims of all macro ops being stubs. No cross-document cache is proven.
- Upstream tsc fails with many existing errors; esbuild and the measured browser fixture
  work. Do not claim the TypeScript project passes all checks.
- org.json Android vs desktop iteration order differs; use ordered resource fixtures
  when investigating byte parity. Do not concatenate independently compiled fragments.

## Environment and portability

Network access now works for GitHub and Maven Central. Normal Git writes and headless
Chrome still need approved escalation in this execution environment. Approved staging,
committing and Chrome commands work; no restriction was bypassed. Historical diagnostics
are in [debugging](DEBUGGING.md) and Git history.

Use JAVA_HOME, not hardcoded machine paths. Verified local JDK: JBR 25.0.4 inside Android
Studio Preview, used solely via CLI. Node 22.14.0 is SHA-checked under .toolchains;
Gradle Wrapper 9.2.1 has a distribution checksum. Gradle/npm caches stay inside workspace.
Full Xcode 27.2 and SDK were discovered, but no iOS app ran. Android SDK has some packages
but lacks sdkmanager/avdmanager; no Android build occurred. No global settings changed.

## Resume

1. Read current progress/decisions and inspect dirty files and commits; preserve work.
2. Set JAVA_HOME, bootstrap Node and fetch pinned sources (getting-started commands).
3. Run `sh scripts/verify-pipeline.sh`; request Chrome/Git approval if sandbox blocks them.
4. Implement the lightweight preview/publish backend with strict unknown-input validation,
   immutable versions, ETags and last-good preservation before the full visual editor.
5. Add actual feature/player fixtures before expanding compatibility claims.
