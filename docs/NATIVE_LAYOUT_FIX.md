# Native viewport and app bar correction

2026-11-03. Follow-up to the manually discovered native defects after6340599.
This corrects the native sizing contract and the validation coverage gap. It is not
an additional graphics feature or a change to the upstream protocol/pins.

## Root causes

**Both hosts treated390×844 header dimensions as a fixed display rectangle.** Android
measured the player at390×844 and used `min(stageWidth/390, stageHeight/844)` as a View
scale, anchored left. At1080×2400/density2.625, the2089px available height limited the
render to965.296px wide: an unexplained114.704px white strip on the right. This is much
larger than fractional-pixel rounding. The stage itself already occupied the width.

iOS likewise used an aspect-fit transform around390×844, centered in the MTKView, while
clearing its drawable black. The1206×2622 capture contains98 black pixels at **each**
horizontal edge at mid-height. These were unused Metal surface pixels, not SwiftUI
safe-area requirements. The surface/root view was wide enough; its internal drawing
viewport was not. The old Swift touch-coordinate inverse repeated the same fit logic.

The header is a design-time document size. The retail root already declares fillMaxSize
and vertical scrolling, but many canvas right edges were literal370 (=390−20). Those
primitives also needed responsive authoring; enlarging only the root does not reposition
fixed drawing operations.

**The old validation cropped the fitted document rectangle and normalized it to390×844.**
That checked document pixels while excluding the native margins and toolbar. It did not
establish native-container correctness. Historical evidence remains available with this
scope correction; it is not proof of the criterion fixed here.

## Implementation

- Android retains the official AndroidX RemoteComposePlayer. A generic ProtocolViewport
  measures it against the available **logical dp** bounds. The only uniform View transform
  is the device dp→pixel conversion. Neither header width/height nor available height
  determines that scale. The upstream engine remeasures the real viewport.
- Android View dimensions are integers: fractional dp bounds round outward by less than
  one dp and the parent clips that raster boundary. This covers the final physical pixel;
  it does not fit/crop an authored390×844 frame. Example:1080/2.625=411.429dp is measured
  as412dp; that is1.5 physical pixels of normal outward rounding, not a114px margin.
- Android now uses a native Compose Material3 TopAppBar/Scaffold, title,24dp refresh and
  settings icons with48dp touch targets and accessible labels. Top-app-bar/system insets
  are consumed once; content respects horizontal/bottom safeDrawing insets. Native debug
  and fetching remain outside the protocol document. The full protocol renderer is an
  AndroidView, not a Compose reimplementation of retail widgets.
- iOS lays out its MTKView at the available SwiftUI safe-area width/height. C++ context
  dimensions are the actual **point** viewport; Skia maps points to drawable pixels using
  the device pixel ratio. Header aspect-fit offsets are removed. Input uses UIView points
  directly. Resize updates context dimensions while preserving existing local state.
- No matching-color background was introduced to hide margins. The Metal clear remains
  black and the Android host retains its native theme. Tests prove that blue/navy protocol
  drawing itself reaches both physical edges.
- New authoring templates and retail-home.json anchor trailing geometry with supported
  `windowWidth()` expressions. Hero bitmap left/right edges move together, preserving its
  aspect; card sizes remain fixed within horizontal scroll rows. Custom/published trees
  are never regenerated or silently rewritten. Existing publication12 remains immutable.
- Status captions stay one line, with complete errors in native debug. A long failure
  message previously changed the stage's vertical position while screenshots/touches
  were being evaluated. Debug dialogs now have explicit lifecycle cleanup and duplicate
  opening protection.

The generic player unit contract for this API7 subset is one protocol unit per native
logical dp/point. The160dpi Android renderer context prevents legacy implicit density
adjustments from being applied a second time. Pixel conversion happens at the host
boundary, while layout sees the real logical viewport. This is a vector/layout repaint,
not a stretched bitmap of a fixed page. Explicit fixed-width primitive constraints remain
fixed; authors must choose fill sizing/window expressions for responsive content.

## Measured final viewports

| Target | Physical display | Effective scale | Native content origin/size in pixels | Logical/root viewport |
|---|---|---:|---|---|
| Android small |720×1600|2|0,224 /720×1328|360×664dp|
| Android large |1440×3120|3|0,336 /1440×2712|480×904dp|
| iPhone SE3 |750×1334|2|0,181 /750×1153|375×576.5pt|
| iPhone18ProMax |1320×2868|3|0,397 /1320×2370|440×789.667pt|

The two Android instances use the same installed API37 image with explicit framebuffer
sizes and density overrides320/480 (the underlying image's physical density is420).
iOS safe areas differ: SE has no home-indicator bottom inset; ProMax reserves34pt at the
bottom. Their top safe areas are also different. Those system areas are intentional.

A20-unit calibration circle measures80×80px at scale2 and120×120px at scale3 on **all four**
configurations. Both native root backgrounds reach the available physical width. Bitmap
frames stay100×100 logical units. Native/root metrics, full screens and exact edge RGB
assertions are retained in the evidence, with no aspect-changing screenshot normalization.

## Validation and reproducibility

`sh scripts/verify-native-layout.sh` is the focused suite. See GETTING_STARTED for device
setup and its required environment variables. It runs JVM/compiler tests, Android
assembly/unit/lint/instrumentation, native screen captures, the iOS build and actual XCTest
on a small and a large Simulator. It publishes three immutable cases and checks the same
full digest in Android and iOS; it does not compile separately for each platform.

The diagnostic includes nested weighted columns/rows,12/24/30-unit text, a bitmap, cubic
vector path, a circle and a long vertically scrolling page. The retail case includes a
horizontal product carousel. Screenshot analysis requires a substantial vertical pixel
change, and a change inside the actual product-image row for horizontal scrolling;
animations elsewhere cannot satisfy those assertions. XCTest scrolls the carousel into
view on small screens before interacting with it.

Android tests verify actual screen pixels, root dimensions, circle geometry, native
48dp toolbar targets, manual/auto refresh, engine callbacks and last-good retention and
recovery. iOS tests tap Refresh/Debug, assert full native document SHA and event501, and
capture the actual safe-area surface. Android150% system text is also captured; explicit
remote text sizes remain authored, while native chrome scales and truncates safely.

An early large-emulator attempt was covered by a **System UI ANR** dialog; its dim layer
explained a40% color sample and missing toolbar accessibility nodes. The final run passed
after recovering System UI. Earlier failed test logs remain local. These failures were
not hidden by loosening pixel tolerances. Tests also wait for the actual native debug
window, rather than querying a stale activity accessibility snapshot.

Legacy390×844 native goldens are incompatible with the corrected viewport contract.
The full gallery capture path now retains actual native pixels; comparison helpers reject
incompatible dimensions instead of stretching them into the old baseline. Regenerating
cross-player references at matching measured viewport sizes is separate follow-up work.
The browser preview remains genuine RcdPlayer/JVM binary rendering at its authored phone
viewport; JVM/browser regression checks still pass.

## Scope and remaining limits

This is Simulator/emulator verification, not physical-device or signed-device certification.
Platform fonts, rasterization and remote accessibility limitations from the full report
remain. Native system text scaling does not automatically enlarge explicitly authored
protocol text. Fixed author geometry stays fixed. General SVG/shadow support and other
new graphics capabilities were not added. Portrait is the measured acceptance orientation;
viewport resize is supported but broad landscape/accessibility coverage remains future work.

## Recorded outcome and evidence

The combined focused suite completed successfully at
`artifacts/native-layout/suite-20261103-220151`:82 JVM tests, nine model tests, Android
assembly/unit/lint, six instrumentation executions (three per emulator), two actual iOS
XCTest executions, and all four native pixel/geometry/scroll capture checks. The browser
editor regression also passes. The additional150% Android text and2.625-density captures
pass their edge/circle/scroll checks.

After reviewing the screenshots, the360dp hero image needed more headline clearance.
Its bounded square expression was published as version19, SHA-256
`b737dd53ebe96186ebbd807b10d6b70a5fdef759a12acdd24fd6ac4a5e39fb0e`,1,970,617bytes.
The same installed Android/iOS binaries rendered it at small and large sizes; iOS reruns
used test-without-building. Client binary hashes before/after are identical in the proof.
This is a server-side composition adjustment using existing protocol math, not a client
widget implementation or a whole-document scale.

- [Android before/after](evidence/native-layout/android-before-after.png)
- [iOS before/after](evidence/native-layout/ios-before-after.png)
- [Full dimensions, hashes and pixel/scroll assertions](evidence/native-layout/proof.json)
- [Android150% native text](evidence/native-layout/android-large-text.png)

Raw full-screen images and calibration captures are tracked alongside these thumbnails.
The thumbnails use uniform display scaling only; validation uses original native pixels.
