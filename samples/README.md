# Verified minimal fixture

`minimal-canvas.json` compiles on a plain JVM using the pinned AndroidX creation parser
and renders through the pinned experimental TypeScript `RcdPlayer` in Chrome.

Expected: 109 bytes, header v1.1.0, API level 7 default, profile 0, 390×844, blue circle
center (195,160), radius 64. SHA-256:
`58eeeb0c27c70bfac67e8a1f1c94b8f456c4c0b4c252b09d5bb8949d04db4903`.
See [evidence](../docs/evidence/minimal-pipeline.json) and
[setup](../docs/GETTING_STARTED.md). Android/iOS rendering is not verified.
