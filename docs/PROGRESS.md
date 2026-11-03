# Progress and handoff

Updated 2026-11-03. Current phase: **Stage 2 minimal JVM/browser pipeline verified**.
The Kotlin HTTP service, publishing/version store, full editor and mobile apps are not
implemented. The work in this session is limited to the requested foundation.

## Completed milestones

- Preserved the existing repository/history and reviewed all five prior documentation
  changes. Committed them as `05f8e48` after checks (`123b8b1` is the initial foundation).
- Confirmed GitHub and Maven Central connectivity after the permission restart.
  Git writes and Chrome launch work with supported approvals; earlier blockers are resolved.
- Fetched both upstreams, examined actual source/build/test files, source history and
  documentation; corrected indexed-source inferences in RESEARCH/JSON_FORMAT/COMPATIBILITY.
- Selected AndroidX `8932b2c2b5043cc40c46a44cfd04a1671ec50fb7` and experiments
  `a7a76f1d9ecc5aff2af93d0de570a11532552ea3`. Later moving heads were not adopted.
- Built unchanged AndroidX core/creation-core in an isolated Kotlin/JVM Gradle app.
  Kotlin calls the real upstream parser; real remote-core decodes the result.
- Compiled the primitive circle fixture to 109 bytes, v1.1.0/API 7/profile 0, 390×844.
- Bundled the actual experimental RcdPlayer, served the compiled bytes and verified
  exact SHA-256 plus three canvas pixels in Chrome. Visually inspected its screenshot.
- Added checksum-pinned Node bootstrap, Gradle Wrapper, dependency locks, guarded source
  acquisition, reproducible verification script and durable evidence.

## Validation results

- `:pipeline:test`: **69 passed** (44 upstream parser + 19 upstream Mesh2D parser + six
  local compiler tests). Covers real operations/header, deterministic bytes, primitive
  edits changing binary, malformed input, missing root/fields, unknown component errors,
  declared profiles and characterization of ignored unknown modifiers/commands.
- `:pipeline:installDist`: **passed**, no Android runtime dependencies.
- `npm ci` and upstream `npm run bundle`: **passed**.
- `npm test --prefix player-smoke`: **passed**, Chrome 156.0.8078.80; exact 109-byte digest
  and three inside/outside/paint-color assertions. Evidence is tracked under docs/evidence.
- `python3 scripts/check-project.py` and `git diff --check`: **passed**.
- Upstream `npm run check`: **failed** (exit 2), existing TypeScript errors across
  ColorAttribute, layout inheritance/access, shader tests, CanvasPaintContext and more.
  Upstream is unchanged. Runtime/bundle success does not imply its typecheck passes.
- Initial sources/archives and new Wrapper were exercised; fresh Git-checkout end-to-end
  run is pending the implementation milestone commit.
- Android/iOS builds, runtime animations, events, larger resource/layout/text fixtures,
  backend endpoints and editor behavior have **not** been tested/implemented.

## Current constraints

Compatibility is established only for the minimal fixture, not all API-7 operations.
Unknown JSON modifiers/commands can silently vanish; the browser can return a parsed
prefix on unknown opcodes. Default JVM bitmap services are stubs. Keep compression off.
Build/source integration is library-group restricted and pinned; see compatibility.
Node/Gradle caches are local; JDK is supplied via JAVA_HOME. Full Xcode exists locally,
but Android sdkmanager/avdmanager and CMake remain uninstalled and are not needed by this gate.

## Next recommended work

1. Finish fresh-checkout pipeline verification and record the implementation commit.
2. Add strict input/capability validation and preview compilation to a lightweight Kotlin
   HTTP backend, then immutable atomic publication/ETags with failure preservation tests.
3. Expand shared fixtures for nested layout/text/images, two continuous animations and
   host-visible callbacks before claiming broader compatibility.
4. Implement the editor preserving raw primitive/custom subtrees. No full editor started.
5. Build/run Android with CLI tools and iOS with the actual C++ bridge, using identical
   published binary hashes and native refresh/debug shells.

## Git handoff

Branch: `main`; prior milestone `05f8e48`. The current compiler/browser implementation,
source lock, scripts and updated docs are ready for the validated implementation commit.
Nothing was reset, rebased, force-pushed or pushed. Final commit/dirty status and
fresh-checkout results will be recorded after validation.
