# Demonstration-readiness review

Reviewed 2026-11-03 from clean main at `7d2d3cc`. The prototype is ready for a scoped live
engineering demo on the tested Chrome/Android emulator/iOS Simulator setup. Source pins,
compiler, publishing architecture and actual players are unchanged. Physical-device and
production-readiness claims remain out of scope.

## Methods and results

The browser review used step-by-step headed Chrome controls and screenshot inspection,
then expanded the reproducible Playwright regression. Android was exercised using actual
adb taps/swipes, native UI hierarchy capture and screenshots. iOS used a new standalone
XCTest UI target against the installed viewer, with real Simulator input. Native scroll
and bitmap results were visually inspected; they are not pixel-perfect conformance tests.

| Requested review | Result and evidence |
| --- | --- |
| Add, select, configure, move, duplicate, delete widgets | All eleven templates exercised through visual controls. Duplicate/property locality also has a new model regression. |
| Preserve custom JSON | Resource-backed custom tree survives every template's operations; raw additions/duplication/reordering preserve two custom copies. |
| Genuine binary preview | Browser's loaded SHA equals exact POST /api/compile response bytes. Canvas hosts pinned RcdPlayer, not HTML widget rendering. |
| Two genuine animations | Radius/progress fields contain time expressions; actual protocol expression operations drive the engines. Browser draw-call variation and both native paint-color pixel counts change. No business-specific JavaScript/Swift/Java animation. |
| Browser host events | Actual pointer clicks produce event 42; scrolled custom composition produces event 99. |
| Android host events | Actual adb taps reach native event 42 and custom event 99; debug hierarchy shows matching binary SHA. |
| iOS host events | Real XCTest taps reach event 42 and event 99; debug log and clear action asserted. No --smoke/internal engine injection used by UI test. |
| Responsiveness/error handling | 390/768/1100/1500px checks, zoom/frame resizing, malformed JSON, network failure and edits during compilation preserve last successful preview. |
| Realistic multi-section page | Thirteen sections: header, hero, promo, scan button, animations, bitmap products, nested carousels and custom gradient/circle/row/button composition. Vertical/horizontal drags visually checked. |
| Shared binary/generic native apps | All three render local publication 7: 4,163 bytes, SHA-256 7dd683f3de2b007b9b307799cf9128536b0de8b0da47c006819a15711b546d63. App hashes fixed across publication. Native source contains only generic player/fetch/debug code. |

Version numbers describe this local store and will differ on another checkout. The
source fixture is [demo-landing.json](../samples/demo-landing.json). Compact machine-readable
results, native animation pixel counts and screenshots are in [evidence](evidence/readiness/results.json).

## Bugs fixed

- Background modifier ordering painted only inner text: templates now paint the full
  section before padding. The scan button uses genuine box centering.
- Duplicate left the original selected: editing now targets the new copy.
- Zoom changed the canvas without resizing its frame. Frame and available width now
  agree; narrow screens stack panels instead of clipping most of the phone.
- Preview freshness was ambiguous. Draft state is explicit; obsolete in-flight results
  cannot replace a newer draft. Compile/publish controls serialize requests. Publication
  reports the submitted snapshot, separately from preview.
- Apply intercepted malformed JSON with a generic client exception. It now uses the
  JVM diagnostic path. Fetch/compilation failures retain the existing player canvas.
- Named browser event logs could grow indefinitely; both event channels are bounded.
- iOS raw metadata pushed events far down the sheet. The raw dump is collapsible, with
  version/digest/status and event log immediately accessible.

Older authored JSON is never regenerated to match a changed template. Older structures
may conservatively appear as Custom; they remain valid, editable and preserved.

## Screenshots

[Desktop editor](evidence/readiness/editor-desktop.png),
[narrow before](evidence/readiness/editor-narrow-before.png),
[narrow after](evidence/readiness/editor-narrow.png),
[tablet](evidence/readiness/editor-tablet.png),
[browser custom/event 99](evidence/readiness/browser-custom-and-event.png),
[Android top](evidence/readiness/android-top.png),
[Android scrolled](evidence/readiness/android-scrolled.png),
[Android debug](evidence/readiness/android-debug.png),
[iOS top](evidence/readiness/ios-top.png),
[iOS scrolled](evidence/readiness/ios-scrolled.png),
[iOS debug](evidence/readiness/ios-debug.png),
[iOS custom/event 99](evidence/readiness/ios-custom-event.png).

## Validation and caveats

79 JVM tests, seven Node model tests and the expanded browser workflow pass. Android
assembly, unit test, lint (upstream warnings, zero errors) and one connected test pass.
iOS Simulator build and one actual UI test pass. Expanded fresh-clone verification remains
recorded for `86e9595`; the latest UI changes were not retested on another machine.

Use pointer press-and-drag for canvas scrolling; pinned browser player does not wire a
mouse-wheel scroll handler. Animation phases differ between players because clocks are
local. Font metrics, host letterboxing and gesture sensitivity differ; pixel-identical
rendering is not claimed. The sample product artwork is intentionally a repeated catalog
illustration. External image URLs, arbitrary assets and every protocol operation are not
enabled. SVG paths remain rejected after the earlier genuine rendering failure.
Upstream TypeScript typecheck still fails; the real runtime bundle passes measured tests.
Physical devices/signing and exhaustive accessibility/performance testing remain unverified.

Recommended next work: repeat this exact runbook on the presentation machine; test
projector/window sizes and device networking; then broaden visual regression coverage and
physical-device verification. Preserve this measured fixture and pins before experimenting
with new protocol capabilities.
