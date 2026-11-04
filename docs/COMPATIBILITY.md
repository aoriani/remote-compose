# Compatibility

Pins remain AndroidX 8932b2c2b5043cc40c46a44cfd04a1671ec50fb7 and experiments
a7a76f1d9ecc5aff2af93d0de570a11532552ea3. Protocol1.1.0/API7, profiles0/512/513;
compression disabled. Full versions are in upstream-lock.json and dependency lockfiles.

| Feature | JVM/service | Browser | Android emulator | iOS Simulator |
| --- | --- | --- | --- | --- |
| Primitive JSON | Strict validated subset, 79 tests | Real compiled binary | Same binary | Same binary |
| Nested layout/text/gradient/circle | Compiled | Visually verified custom fixture | Visually verified | Visually verified |
| Two time-expression animations | Compiled | Varying player draw calls | Varying screenshot pixels | Varying screenshot pixels |
| PNG catalog bitmap | Real ImageIO encoding | Decoded drawImage verified | Visually verified landing | Visually verified landing |
| HostAction42 | Compiled | Actual pointer callback | Actual player input callback | Actual Simulator tap callback |
| Refresh failure preservation | API tests | Failed publish/preview preserved | Instrumentation verified | Real failing-fetch smoke verified |
| Inline SVG M/L/C/Z | Populated-length fix, CLOSE opcode regression | Curved heart and product icons verified | Curves/icons verified | Curves/icons verified |
| Patterns/binary fragment caching | Research only | Not tested | Not tested | Not tested |

[Evidence](evidence/cross-platform.json) records exact fixture digests and fixed native
application hashes. Browser Chrome156, Android17/API37 emulator, iPhone18Pro arm64
Simulator/Xcode27.2 were exercised. Native minimum Android26/iOS18.5; build SDK36.
This is measured fixture compatibility, not conformance across all protocol operations.

Important limitations: experimental TypeScript typecheck has pre-existing failures;
esbuild/runtime tests pass. Browser unknown-opcode warnings are rejected by smoke tests.
The previous SVG capacity bug is fixed in the JVM adapter; inline absolute M/L/C/Z paths
are enabled. Arbitrary SVG import/resources remain excluded. Shader paint state persists;
reset with shader=0 for solid geometry. API8 density/compression are not enabled. iOS
physical-device signing/build, Intel Simulator are not verified; native landing PNG/scroll behavior was visually inspected. Android lint passes with existing upstream warnings. A real iOS UI test now asserts 42/99 callbacks and log clearing; Android instrumentation
and adb gestures cover its debug/player workflow. See DEMONSTRATION_REVIEW for scope.

Source-level support is broader than the service subset. Consult Validation.kt for what
is enabled, JSON_FORMAT for upstream syntax and RESEARCH for source references. The
[historical foundation report](COMPATIBILITY_FOUNDATION.md) preserves prior findings;
its unbuilt/untested statements describe the earlier milestone only.

The current visual fixture is samples/retail-home.json (~1.97MB). Four genuine PNGs,
vector hearts and two time expressions were rendered in unchanged native apps. See
VISUAL_REDESIGN.md and evidence/redesign/results.json for measured checks and visual scope.

## Expanded measured subset (2026-11-03)

See [full feature report](FULL_FEATURE_TEST_REPORT.md) for captures and exact scope.
DrawCircle/Oval/RoundRect/Arc, cubic inline paths, linear gradients, alpha, save/clipRect,
translate/rotate/scale, embedded PNGs, named string callbacks and local float-state changes
are exercised with genuine binary documents on all three players. Parser acceptance alone
is insufficient: CircleShape clip is silently omitted by the pinned writer and is now
rejected; supported square roundRect radius half the side produces circular clipping.

C++ named-action text resources nested in action lists require generic bridge initialization.
No business-specific native implementation was introduced. Fonts and bitmap edge filtering
are not pixel-equivalent. Browser wheel input is absent; pointer/touch dragging works.
Android scaled virtual accessibility bounds and canvas labels are incomplete; iOS Metal has
no generated remote semantic tree. Shadows/elevation/general SVG/external images remain
outside the enabled subset. Do not extrapolate this gallery to protocol conformance.
