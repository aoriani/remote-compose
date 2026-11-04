# Full feature and rendering validation

Review date: 2026-11-03 (America/New_York). Baseline: `ed5ad06`; first fixes:
`6c66fb6`. The final evidence combines a successful29-document gallery with a targeted, corrected
lifecycle rerun; failed attempts remain in the evidence transcripts.
No upstream revisions changed, no remote push, no client business-component registry.

## Executive assessment

The tested editor-to-binary workflow is genuine. Actual browser controls author primitive
JSON; the JVM compiler publishes immutable bytes; browser, official Android and C++/Skia
Metal iOS viewers load those bytes. The browser preview is an upstream RcdPlayer canvas,
not DOM markup that imitates the document. Native shells contain fetch/debug/input code,
not product, banner, carousel or animation implementations.

This is a scoped engineering prototype, **not full protocol conformance or pixel parity**.
The review found and fixed real defects in immutable preview loading, image sizing,
clipping validation, named callbacks and startup. Remaining wheel, font/rasterization,
accessibility and physical-device gaps are explicit. A successful decode or event alone
is not treated as evidence that every visual or state transition worked.

## Recorded outcomes

- **31 immutable binary documents** rendered in browser, Android and iOS:11 modified
  widgets,18 custom/gallery documents and2 lifecycle publications. All31 Android full-hash
  assertions pass; XCTest verifies full native digests for the gallery and lifecycle.
- **81 JVM tests, nine model tests**, original109-byte pixel proof, browser editor/error
  regression, all20 property controls,18 complete custom-tree preservation checks pass.
- Android CLI assembly/unit/lint pass; **two instrumentation tests** cover real player
  input and refresh failure/corrupt-binary recovery. iOS build passes; gallery XCTest
  passes319.794s; the final strengthened lifecycle XCTest passes38.780s, including
  an actual offline viewport and a successful-response recovery assertion.
- **15 of62 strict cross-platform comparison rows retain ROI discrepancies**: bitmap
  filtering, thin animation edges and the edited circle edge. All10 native deterministic
  phase geometry checks pass; both live effects change on all three players. Text-region
  differences are reported separately, not passed by increasing thresholds.
- Reviewed static golden checks:27/27 initial checks; **24/24 independent repeat captures**
  pass for unchanged fixtures. Two earlier bad Android phase captures are correctly
  rejected as a negative control. The new clipping fixture is visually inspected on all
  three players; its baseline has no independent native repeat yet.
- `FULL_NATIVE=0 sh scripts/validate-all.sh` ran successfully end to end. Native stages
  were also executed separately with their actual CLI/instrumentation/XCTest results;
  a fresh one-shot native invocation after harness fixes has not been rerun in full.

Retail publication23: **1,970,167 bytes**, SHA-256
`e2c601547fc4eefab6dca6aa5d635442234e07bd015a6b4a0661769f09b454a2`.
The [complete31-document hash manifest](evidence/full-validation/proof.json),
[comparison metrics](evidence/full-validation/comparisons.json),
[live frame checks](evidence/full-validation/live-results.json) and
[independent golden repeat](evidence/full-validation/baseline-independent-repeat.json)
are portable evidence. Local raw bundles/xcresult remain in artifacts/full-validation.

Screenshots inspected:
[editor](evidence/full-validation/editor-retail.png),
[browser widgets](evidence/full-validation/widgets-browser.png),
[Android widgets](evidence/full-validation/widgets-android.png),
[iOS widgets](evidence/full-validation/widgets-ios.png),
[retail comparison](evidence/full-validation/retail-comparison.png),
[graphics](evidence/full-validation/graphics-comparison.png),
[bitmaps/bag](evidence/full-validation/bitmaps-comparison.png),
[typography/clipping](evidence/full-validation/layouts-comparison.png),
[animation states](evidence/full-validation/animation-phases.png).

## Environment and immutable dependencies

- Apple Silicon macOS; JBR25.0.4, JVM target17; Gradle9.2.1, Kotlin2.2.20, AGP9.0.0.
- Chrome156.0.8078.80; Playwright1.56.1; Node22.14.0; upstream Canvas2D player bundle.
- Android Emulator Medium_Phone_API_37.0, Android17/API37; SDK Build Tools36.0.0;
  default1080×2400, density420. CLI Gradle/adb only.
- Xcode27.2 build27B52; iPhone18Pro arm64 Simulator, iOS27.2; deployment target18.5;
  CMake3.31.6; Skia `m144-e2e6623374-4`. Simulator signing is ad hoc.
- AndroidX `8932b2c2b5043cc40c46a44cfd04a1671ec50fb7`.
- Experiments `a7a76f1d9ecc5aff2af93d0de570a11532552ea3`.
- Selected API7/profile512 primitive subset; see upstream-lock.json for full dependency
  pins. No assumption that other revisions/operations are compatible.

## Method and test matrix

The suite uses the existing Playwright, JUnit/AndroidX instrumentation and XCTest tools.
Browser tests operate real controls, not only the editor model. Each gallery document is
published once on isolated backend8091, downloaded and hashed, then selected by immutable
version in all three generic viewers. Android logs its full digest. XCTest reads the full
native digest accessibility value. Screenshots come from real canvases/adb/Simulator.
The iOS lifecycle publishes two additional documents and the other players fetch those
same immutable versions. No per-platform compilation is performed.

| Area | Observed coverage | Verdict |
|---|---|---|
| Widget controls | All11 widgets, all20 property controls, add/select/move/duplicate/delete; exact unrelated-JSON checks | Pass |
| Custom source | All18 generated custom fixture trees/resources preserved through real visual controls | Pass |
| JSON/errors | Malformed, unsupported, invalid properties, source editing/formatting, last-good preview/publication, offline/stale requests | Pass in JVM/browser suites |
| Large/empty |160-section browser document; empty fixture across players | Browser large; native long-scroll fixtures, not160 sections |
| Graphics | Circle/ellipse/rounded rect, alpha/color/gradient, cubic path/arc, save/clipRect/transform, nested layouts/overlap | Captures plus declared geometry/color checks; fonts separately reported |
| Assets | Four distinct transparent fictional PNGs, reference resolution, square/stretch destinations and legacy bag | Rendered on all players; filtering differences remain |
| Animations | Five deterministic protocol-variable phases and live time-driven badge/progress frames | Geometry/live observations; clocks are not synchronized |
| Interactions | Touch502/503, click501, named validation.echo/hello-protocol; separate local-state marker movement | Real input, host log and rendered marker checked |
| Native lifecycle | Manual/auto refresh, failed refresh, corrupt-binary retention/recovery on Android; draft/publish/manual/auto/offline on iOS | See final run status/evidence |
| Responsive | Browser390/768/1100/1500, zoom65/85/100%; Android small/large/font150%/landscape; iOS landscape capture | Fixed authored layout fits; not adaptive reflow |
| Scrolling | Pointer/touch, vertical/nested horizontal, native swipes | Browser wheel fails; real trackpad untested |
| Accessibility | Keyboard editor controls, contrast tokens, Android hierarchy/native debug; iOS native controls | Remote semantic coverage incomplete; no spoken screen-reader certification |
| Undo/redo | No controls exist | Not supported; not silently treated as tested |

Widgets: header, text, spacer, hero, promo, image, button, products, news, badge, progress.
Widget screenshots include a separate diagnostic footer line to make spacer/layout height
visible. Fixtures and test-only plans are in samples/validation; plans are not a UI protocol.

## Bugs, causes and repairs

1. **Load published recompiled source.** It could not prove byte identity. It now snapshots
   metadata, loads immutable source/binary and checks the exact hash; browser automation
   asserts no compile POST occurs during Load published.
2. **Image width distorted art.** Updating only the right bound changed aspect/center.
   The image-size form updates all four bounds, preserving aspect/center within the188px
   art frame. A model regression checks unrelated operations and invalid size rejection.
3. **Circle clip silently disappeared.** Parser parseShape accepts CircleShape, but pinned
   creation/modifiers/ClipModifier.write only emits RectShape/RoundedRectShape. The backend
   rejects circle clip at its JSON location. Supported roundRect radius50 in100×100 is
   exercised instead; it is a genuine emitted clip, not an HTML mask.
4. **Android named events were not subscribed.** The generic viewer now registers the
   CoreDocument ActionCallback as well as ID actions. Both event kinds reach its bounded log.
5. **iOS named event had empty name.** HostAction.write creates DATA_TEXT for the name
   inside the action list. The C++ action container skips that data pass. The bridge now
   preloads immutable text definitions recursively, without executing actions/drawing.
   XCTest asserts both name and string payload; all pins remain unchanged.
6. **iOS startup could cancel its initial fetch.** Scene activation and task start both
   restarted the same task. Start is now idempotent until stop; native gallery startup is
   tested repeatedly across immutable versions.
7. **Android stale failure/304 could overwrite changed-backend status.** Those paths now
   use the same backend guard as successful responses.
8. **Muted text contrast was too low.** Paper text was3.68:1 and a small editor label3.04:1.
   Corrected tokens are4.81:1 on paper and5.02:1 on white. This is a token measurement,
   not a claim that every pixel of artwork or every native control was audited.
9. **Capture harness sampled Android activity fade/old restored task.** It now waits for
   the actual expected hash and viewport, settles the launch, rereads viewport dimensions,
   and retries a mismatched launch once. Wrong hashes remain failures, not accepted shots.
   The first two exploratory runs retain their failed first-header capture records.

## Clipping, vectors, bitmaps and rendering differences

The old shopping bag is a120×120 opaque PNG with a flat handle cap in the **source**.
The gallery renders it at120×120 and at the old160×120 destination: the latter stretches
horizontally on every player. No extra canvas/player crop explains that flat cap. The new
artwork uses transparent, distinct products; the property repair prevents new accidental
aspect distortion. Explicit raw JSON stretching remains possible and is shown deliberately.
The earlier populated-length SVG-path encoding repair is preserved; the cubic-heart fixture
and line icons render as protocol paths on all players. General SVG import is not enabled.

Strict comparisons use declared thresholds: ROI mean RGB error≤5/255, fraction of pixels
with a channel error>12/255≤3%, solid interior channels±3, geometry±2 document pixels.
Failures are retained. Full-frame metrics are informational; text regions are explicitly
excluded from generic ROI gating and are **not** labeled visual passes. Same-platform
static golden checks are separate (mean≤1, fraction>12≤1%). No thresholds were raised to
make cross-platform captures pass. One-pixel-neighborhood diagnostics and8×8 luminance
SSIM help investigate edges; they do not override strict failures.

Bitmap filtering differs between browser Canvas2D and native Skia, compounded by native
physical-pixel capture normalization to390×844. C++ uses linear SkSamplingOptions; browser
uses its Canvas2D image-smoothing path. Solid colors and destinations match; detailed art
and edge pixels differ. Thin progress-bar pixel differences collapse in the one-pixel
edge diagnostic while analytic widths/radii agree. Live clocks are not used for equality.

Layout text is a larger unresolved difference: browser uses platform sans-serif Canvas2D
metrics, Android uses Android font metrics, C++/CoreText selects Helvetica Neue/Helvetica
fallbacks. The nested typography fixture exposes different baselines, line heights and
resulting sibling offsets. An embedded cross-platform font/metric policy is not implemented.
Do not present this fixture as pixel-equivalent. The retail composition uses explicit
geometries for most drawn copy, reducing but not eliminating font differences.

## Animation interpretation

The badge radius is `4 + 1.2*sin(time*3)` and progress width is
`185 + 24*sin(time*2)`, evaluated by player expression operations. The five phase documents
replace time with a protocol variable at0,π/4,π/2,π,2π; radius/width assertions compare
matching mathematical states across players, including loop-equivalent endpoints.
These companions are not a deterministic clock hook and do not prove real-time rate,
easing or dropped-frame parity. Live frames show both effects changing independently.
They loop continuously and have no terminal state. Host JavaScript/Swift/Java does not
animate the business content. Exact timing, sustained FPS and synchronized clock testing
remain future work.

## Usability and accessibility findings

The library, hierarchy, canvas and inspector are coherent at desktop sizes; narrow windows
stack/scroll panels without horizontal document overflow. Real rendered widget contact
sheets show distinctive art, clear retail hierarchy and consistent proportions. Remaining
limitations: no undo/redo, authored-size remote text, long JSON as a textarea/highlight
layer rather than a full code IDE, and pointer drag rather than wheel canvas navigation.
Product imagery/metadata are separate properties; swapping art does not rewrite copy.
Drawn hearts, filter tabs, search and editorial arrows are decorative unless their primitive
JSON defines an action. Product cards emit201–203 and scan surfaces42; this is an event
demonstration, not a cart, wishlist, search or checkout implementation.

Android UI hierarchy exposes some CoreText/scroll semantics, but drawn captions/buttons
are frequently unlabeled; virtual child bounds do not follow the scaled host viewport.
iOS Metal content has no generated document semantic tree. Native debug controls remain
separate and accessible to the automation APIs. Browser canvas is labeled as an image with
an explicit pointer/keyboard limitation; editor controls are keyboard-focusable and selected
layer/assets/modes expose pressed state. No VoiceOver/TalkBack spoken-output test, switch
control certification or full contrast/touch-target audit was performed.

The final offline iOS capture retains the same centerRGB(0,130,126) and the circle's
normalized extent within the predeclared±2px tolerance; Android checks a real retained
screen pixel and the recovered circleRGB(0,103,160). See
[retention metrics](evidence/full-validation/retention-results.json),
[offline viewport](evidence/full-validation/ios-offline-retained.png),
[named iOS event log](evidence/full-validation/ios-events.png), and
[Android events](evidence/full-validation/interactions--android.log).

## Remaining work and demonstration guidance

Use the reviewed portrait retail document and pointer/touch dragging for the engineering
demo. Keep native debug accessible, show full hashes, edit raw primitives and republish
without rebuilding. Do not claim arbitrary protocol support, pixel-identical fonts,
adaptive text, general SVG, shadows/elevation, external images or production accessibility.
Shadows/elevation are not enabled by the strict compiler subset; no substitute was drawn.

Next priorities: resolve font/metric policy and scaled semantic bounds; add a supported
wheel input path; synchronize native clocks for timing tests; test physical devices,
real trackpad gestures, VoiceOver/TalkBack and another clean checkout. Native network
coverage is finite; prolonged outages, signed-device packaging, resource exhaustion and
all cancellation races remain unverified. The upstream TypeScript typecheck failure is
unchanged and separate from the executed runtime bundle.

## Reproduction and evidence

See GETTING_STARTED and scripts/validate-all.sh. The script starts isolated backend8091,
keeps immutable version bundles and generates REPORT.md/summary.json plus raw captures,
logs/xcresult and heatmaps under artifacts/full-validation. Selected portable evidence and
same-platform baselines are tracked under docs/evidence/full-validation. Baselines must
be reviewed explicitly when fixture hashes change. No generated local SDK/config/signing
files, credentials or large runtime publication stores are tracked.
