# Historical foundation compatibility (superseded scope)

## Selected revisions and proven scope

- AndroidX: `8932b2c2b5043cc40c46a44cfd04a1671ec50fb7`.
- Experiments: `a7a76f1d9ecc5aff2af93d0de570a11532552ea3`.
- Gradle 9.2.1, Kotlin 2.2.20, JBR 25.0.4, JVM target 17, Node 22.14.0,
  esbuild 0.27.7, TypeScript 5.9.3, Playwright 1.56.1.
- JVM dependencies: org.json 20231013, jspecify 1.0.0, annotation-jvm 1.9.1;
  tests use JUnit 4.13.2. Exact transitives are locked.

The unchanged AndroidX sources compile on plain JVM. The 109-byte sample has protocol
v1.1.0, API level 7, profile 0 and renders in Chrome 156.0.8078.80 using the real
experimental RcdPlayer. Browser and compiler SHA-256 agree; three canvas pixel assertions
pass. [Evidence](evidence/minimal-pipeline.json).

**This is a fixture-compatible pair, not a claim of complete protocol compatibility.**

| Area | JVM/parser | Browser | Android | iOS |
| --- | --- | --- | --- | --- |
| Minimal circle canvas | Compiled and decoded | Rendered, hash + 3 pixel checks | Unbuilt | Unbuilt |
| Parser behaviors | 44 general + 19 Mesh2D upstream tests pass | Not a parser implementation | Not exercised | Not exercised |
| Dimensions/paint/drawing | Actual sample operations inspected | Exact sample pixels verified | Official player source reviewed | C++/Skia bridge source reviewed |
| Layout/text | Registry and source tests inspected | Implementation exists; untested here | Unbuilt | Unbuilt |
| Images/resources | Default JVM bitmap service is a stub | Decode capability not tested | Not tested | Not tested |
| Time/expression animation | Upstream parse tests pass | Runtime animation untested | Not tested | Not tested |
| Host actions | HostAction parser branch present | CoreDocument callbacks present; not exercised | ID listeners found; not exercised | Current Obj-C bridge exposes touch, no host callback API in header |
| Patterns/templates | Definition/inflation registry present | Loom implementation present | Not tested | C++ expansion implementation present, unbuilt |
| Compression | AndroidX supports API-8 writer compression | No decompression path found in buffer loader | Unbuilt | Unverified |

## Important limitations

- The browser buffer loader warns and returns early for unknown opcodes. A document can
  appear loaded while only a prefix was parsed. Smoke tests reject such warnings and
  verify expected pixels; a service still needs a tested operation subset.
- The upstream browser `npm run check` exits 2 with pre-existing type errors across
  layout, ColorAttribute, shader tests, CanvasPaintContext and other files. esbuild
  bundling and the minimal browser runtime test succeed. Upstream was not modified.
- The experimental STATUS/GAPS documents are stale in places. Commit 9055d26 added
  substantial template, action/layout and animation support. Do not repeat their older
  claim that all Loom ops are stubs or use old missing-op counts as current truth.
- No universal supported version/profile intersection is established. API-7 success
  for this fixture does not establish all API-7 operations. Compression stays off.
- JVM desktop org.json iteration differs from Android's org.json. Resource ordering and
  byte parity need ordered fixtures; the minimal fixture contains no such resources.
- Parser success can include ignored unknown modifiers/commands; strict validation is
  pending. No claim of e-commerce readiness follows from these tests.

Next expand fixtures for layout/text/fonts/images, continuous animation, host callbacks
and unsupported-operation rejection; then build and run official Android and experimental
iOS players against the exact same binary hashes.
