# Compatibility

Pins remain AndroidX 8932b2c2b5043cc40c46a44cfd04a1671ec50fb7 and experiments
a7a76f1d9ecc5aff2af93d0de570a11532552ea3. Protocol1.1.0/API7, profiles0/512/513;
compression disabled. Full versions are in upstream-lock.json and dependency lockfiles.

| Feature | JVM/service | Browser | Android emulator | iOS Simulator |
| --- | --- | --- | --- | --- |
| Primitive JSON | Strict validated subset, 79 tests | Real compiled binary | Same binary | Same binary |
| Nested layout/text/gradient/circle | Compiled | Visually verified custom fixture | Visually verified | Visually verified |
| Two time-expression animations | Compiled | Varying player draw calls | Varying screenshot pixels | Varying screenshot pixels |
| PNG catalog bitmap | Real ImageIO encoding | Decoded drawImage verified | Not visually asserted | Not visually asserted |
| HostAction42 | Compiled | Actual pointer callback | Actual player input callback | Engine-input callback |
| Refresh failure preservation | API tests | Failed publish/preview preserved | Instrumentation verified | Real failing-fetch smoke verified |
| SVG drawPath | Strict service rejects | Not enabled | Failed trial: Odd command 0 | Trial omitted geometry |
| Patterns/binary fragment caching | Research only | Not tested | Not tested | Not tested |

[Evidence](evidence/cross-platform.json) records exact fixture digests and fixed native
application hashes. Browser Chrome156, Android17/API37 emulator, iPhone18Pro arm64
Simulator/Xcode27.2 were exercised. Native minimum Android26/iOS18.5; build SDK36.
This is measured fixture compatibility, not conformance across all protocol operations.

Important limitations: experimental TypeScript typecheck has pre-existing failures;
esbuild/runtime tests pass. Browser unknown-opcode warnings are rejected by smoke tests.
SVG paths are excluded after a genuine cross-platform failure. Shader paint state persists;
reset with shader=0 for solid geometry. API8 density/compression are not enabled. iOS
physical-device signing/build, Intel Simulator and full native image/scroll fidelity are
not verified. Android lint passes with existing upstream warnings. Native debug controls
are implemented but comprehensive native UI gesture automation is still pending.

Source-level support is broader than the service subset. Consult Validation.kt for what
is enabled, JSON_FORMAT for upstream syntax and RESEARCH for source references. The
[historical foundation report](COMPATIBILITY_FOUNDATION.md) preserves prior findings;
its unbuilt/untested statements describe the earlier milestone only.
