# Interactive demonstration evidence

Captured2026-11-03/04 on Chrome156, AndroidAPI37 emulator and iPhone18Pro/iOS27.2 arm64
Simulator. Pins, immutable binary hashes, source hashes, event payloads and installed
client binary hashes are in [proof.json](proof.json). File hashes/dimensions are in
[screenshots.json](screenshots.json). Full logs/xcresult/binaries are ignored local
artifacts/interactive; compact evidence here is portable.

- [Browser initial](browser/initial.png), [third offer](browser/third-banner.png),
  [selected heart](browser/favorite-selected.png), [raw edit](browser/raw-edited.png),
  [inspector](browser/inspector.png), [live source/editor](browser/live-source-editor.png).
- [Android local state](android/local-state.png), [selected vector heart](android/favorite-selected.png),
  [raw edit](android/raw-edited.png), [live refresh](android/live-refreshed.png).
- [iOS local state](ios/local-state.png), [selected vector heart](ios/favorite-selected.png),
  [resume retains quantity](ios/resume.png), [raw edit](ios/raw-edited.png),
  [live refresh](ios/live-refreshed.png).
- Actual browser player, test-only pinned clock: [4.55s](animation/phase-4.55.png),
  [4.775s](animation/phase-4.775.png), [5s](animation/phase-5.png).

Native screenshots retain full screen dimensions; browser screenshots retain actual canvas/
editor dimensions. No cross-platform stretching or HTML replacement. Different viewport
widths/font metrics and asynchronous live phases prevent a pixel-equivalence claim.
The halfway frame shows a genuine clipped horizontal translation of two neighboring offers.

The live test starts both installed applications at publication6, edits and previews raw
JSON through the real browser, confirms the draft is unpublished, then publishes7. Both
native players refresh to SHAa91ef946… while the installed APK/iOS executable hashes remain
identical. Both emit a promotion.open callback from the new composition. This is separate
from immutable4/5/6 document selection in the main suite.

[Minimal resource reproduction](resource-repro.json) records a null shared action name
on the unadapted browser player and the correct name after generic TextData initialization.
No unsupported operation was hidden behind native widgets. See INTERACTIVE_DEMO and
FULL_FEATURE_TEST_REPORT for scope, timing, initial failed attempts and known limitations.
