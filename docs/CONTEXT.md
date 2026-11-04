# Durable context

Start with AGENTS, PROGRESS, DECISIONS, Git status/history and upstream-lock.json.
The minimal pipeline is preserved; do not repeat its research or replace its renderer.

## Implemented architecture

pipeline builds unchanged pinned AndroidX remote-core/creation-core. Validation.kt is
strict service capability validation, independent of editor template recognition. The
original research CLI remains permissive; public compile/publish use compileValidated.
Backend.kt uses JDK HttpServer, one atomic JSON version bundle containing source, base64
binary and metadata, a publication lock and immutable numeric versions. Preview never
writes versions. Binary responses include the version and digest to avoid metadata races.

web-editor/model.mjs edits actual upstream JSON. Recognition is conservative and separate
from protocol validity. Property forms patch individual paths. Unknown trees stay custom.
Resource/variable IDs are not safely remapped yet: unsafe duplication is rejected.
JvmAssets loads the checked-in PNG catalog through real upstream platform services and
bitmap definitions. No arbitrary URL fetching or custom business protocol is involved.

Android compiles source-coupled official player modules; iOS builds pinned experimental
rccore/rcskia and an adapted upstream Metal bridge. Native code is a generic renderer
plus debug shell. Both fetch the exact same latest binary with ETag/SHA checks.

## Hard-won compatibility findings

- API7/protocol1.1.0 and profiles0/512/513 are the service subset, not a universal guarantee.
- Unknown upstream JSON commands/modifiers can vanish silently; strict service rejects
  unknown operations/properties. Browser load can return a prefix on unknown opcode:
  tests fail on warnings and assert real draw behavior.
- Use expression `time` for continuous repaint. animationTime() alone does not sustain
  scheduling in the pinned browser. The animations live entirely in protocol expressions.
- JVM default bitmap services are stubs. JvmAssets fixes actual PNG encoding/catalog use.
- Real SVG path experiment failed Android with Odd command 0 and omitted iOS geometry.
  Paths are deliberately disabled in service validation pending encoding investigation.
- Gradient shader persists in paint state. `{"paint":{"shader":0}}` clears it.
- Android player uses a 160dpi context and scales authored header viewport into the host
  stage, matching virtual document geometry without API8 density flags or changed bytes.
- Swift sample touch-up did not call document onClick: the bridge exposes actual C++
  onClick and hostAction/hostNamedAction; Swift native gesture dispatch calls those APIs.
- Skia Simulator m144-e2e6623374-4 includes arm64 iosSim archive; ICU needs iOS18.5 target.
  Link shaper/unicode/harfbuzz/icu libraries as well as libskia or Swift linking fails.
- AGP9 built-in Kotlin is disabled for compatibility with root Kotlin2.2.20; app is Java.
- Upstream TypeScript typecheck fails; runtime bundle/tests pass. Keep claims distinct.

## Environment and handoff

Tested JBR25.0.4 (JAVA_HOME), Node22.14.0 local bootstrap, Gradle9.2.1; SDK36/AGP9;
Android17 emulator; full Xcode27.2/iPhone18Pro arm64 Simulator. No IDE GUI required.
Tools, upstreams, outputs and publication data are ignored and reacquired from scripts.
Current execution has network/Git access; old sandbox failures are historical, not current.

80 JVM tests, eight model tests, browser workflow, Android CLI/instrumentation and iOS
engine-input smoke passed. See PROGRESS/evidence for precise scope. No physical devices
were tested. Expanded fresh-clone validation at86e9595 passed backend/editor tests and both native
builds; see evidence/expanded-clean-checkout.json. Native image/scroll and UI automation
coverage remain next. Never infer broad compatibility from a successful parse.

## Demonstration-readiness authoring fixes (2026-11-03)

Template backgrounds must precede padding in ordered modifiers to cover the section;
button alignment is genuine box alignment. Existing authored JSON is never regenerated
when factories change: older template structures safely fall back to Custom. Duplicate
now selects the new copy so a subsequent property edit does not change the original.
The phone frame follows actual zoom/available width; <=650px uses a stacked layout.
Draft/preview equality is explicit. Compile/publish controls serialize requests; editing
while compilation is pending cannot install an obsolete preview. A publish reports the
submitted snapshot separately from preview. Apply sends malformed JSON to the JVM for
consistent diagnostics; fetch failures preserve the last canvas. Named and ID logs share
one 50-entry bound. Seven Node tests and expanded real browser workflow pass.

## Native demonstration review (2026-11-03)

DEMONSTRATION_REVIEW.md records the complete review, methods and limitations. The new
standalone ios-player/UITests.xcodeproj drives the installed generic app with real XCTest
Simulator input, not --smoke. Publish samples/demo-landing.json first: it has the fixed
390×844 coordinates used by the UI test. Events42/99 and clearing are asserted; scroll
and bitmap screenshots are visually reviewed. Raw iOS metadata is a DisclosureGroup so
events remain reachable. Android real adb taps also produced 42/99. Both native apps kept
identical hashes while publication changed to the 4,163-byte combined landing/custom doc.
New native image/scroll evidence supersedes earlier pending notes. See readiness/results.

## Visual iteration: asset and path foundation

Four new generated transparent originals and prompts live in assets/. JvmAssets now
accepts catalog IDs dynamically and bounds embedded images proportionally to 640px.
PNG alpha/dimensions, MIME routes and catalog validation are tested. The path bug was
unused backing-array capacity: copy getSize() of RemotePathBase.getPath(), not the full
array. The service supports finite inline absolute M/L/C/Z paths; a curved heart and
product outline hearts rendered in all three unchanged players. Older claims that all
paths are disabled are superseded. Legacy CLI compile still uses the default upstream
platform; use service compile for the corrected asset/path adapter.

## Current visual implementation

Default initialDocument is Common Market; samples/retail-home.json is its tracked output.
Old landing/demo-landing fixtures remain unchanged as regression artifacts. Existing
browser drafts are preserved: use Load designed page explicitly to replace one. Gallery
metadata is editor-only; catalog IDs resolve to classpath bitmaps embedded in the binary.
Replacement patches only selected addBitmap.image, including custom subtrees; multi-image
target selection persists. Source JSON remains authoritative.

Array padding is [start,top,end,bottom], not CSS order. Wrong ordering introduced vertical
carousel padding and price clipping; corrected arrays were inspected on all players.
Keep image destinations square for the square transparent originals. Hero typography/art
positions were iterated from real screenshots. Emoji arrows were replaced with line ops.
The highlighter now virtualizes visible lines: full-span rendering froze large JSON pastes.
Two time-expression animations remain actual engine operations; scripts/analyze-animation.mjs
checks connected blue dot/bar regions in native capture pairs. Native app binaries stayed
unchanged; one published 1,970,167-byte document renders on all three platforms.

The iOS UI test now reads immutable publication source/metadata to determine whether the
legacy fixture has event 99; it still asserts42, clearing, digest prefix and captures real
swipes for the new retail fixture. Use retail-home.json for the visual demo and legacy
sample for optional99 coverage. See VISUAL_REDESIGN for explicit limitations/evidence.

## Full validation discoveries (2026-11-03, in progress)

Load published now downloads /api/documents/{version}, avoiding recompilation; the
browser suite checks that no compile POST occurred and checks its exact binary hash.
Image-size property edits four bitmap bounds together, preserving center/aspect; 16..188
is the safe art-frame range. Original edge-only edits distorted illustrations.
Pinned creation/modifiers/ClipModifier.write silently ignores CircleShape even though
parseShape accepts it. Backend now returns UNSUPPORTED_OPERATION at the clip type;
use roundRect radius half a square frame side. All 81 JVM and nine model tests pass.
Muted text colors were darkened after contrast measurements (paper 4.81:1, editor white
5.02:1 for the corrected tokens). Browser pointer and synthetic touch scroll work;
wheel events do not scroll the pinned player. Real trackpad hardware remains untested.
Further native gallery/lifecycle evidence and final verdict follow in FULL_FEATURE_TEST_REPORT.

## Expanded native validation and evidence interpretation

The generic Android viewer supports transient intent backend/version selection and named
CoreDocument callbacks. iOS supports --backend/--version/--no-auto/--interval, idempotent
start and full GUI digest identity. C++ named action name DATA_TEXT is nested in the
writer's action list; generic bridge preloading repairs its omitted data traversal.
No upstream source/pin changes were made. Fixture generators use only actual primitive
JSON; plans/immutable run bindings are separate test metadata.

Use FULL_FEATURE_TEST_REPORT and docs/evidence/full-validation/proof.json. Primary raw
runs are artifacts/full-validation/final (gallery, initial failed lifecycle), lifecycle-fixed
(successful corrected lifecycle), and retention-final (stronger final retention assertions).
The first lifecycle failure was an automation row tap, not proven runtime auto-refresh
failure; tapping the actual switch and asserting value1 makes the test precise. Gradle's
connected test may uninstall the target on completion: never interleave it with a gallery
run against the same emulator. The driver reinstalls the same APK before final captures.

Cross-player font metrics and physical-pixel filtering differ. Strict pixel failures are
retained, not accepted by larger tolerances. Phase-variable fixtures are deterministic
states, not live clock injection. Android font-scale150% does not enlarge authored text;
virtual accessibility child bounds also fail to follow host scaling. iOS Metal semantics
are absent. These are open limitations, not successful accessibility tests.

## Native viewport correction after6340599

The old header-aspect-fit adapter was wrong for native UI. Android left a114.7px white
strip on1080px width; iOS centered98px black margins on a1206px screen. Prior validation
cropped that document rectangle and normalized it, excluding the defective containers.
Read NATIVE_LAYOUT_FIX.md; actual full-screen/edge/circle checks now establish the claim.

Native layout now uses the available logical dp/point viewport. ProtocolViewport wraps
unchanged official AndroidX player sources, with only standard dp→px conversion and<1dp
outward rounding. iOS context dimensions are UIView points and input is direct; Metal
performs point→drawable conversion. Neither host fits the390×844 header. Do not restore
height-dependent fit or image stretching. Explicit fixed raw JSON remains fixed.

Android has Java fetch/debug plus Kotlin Material3 chrome (TopAppBar/Scaffold/AndroidView).
AGP9 built-in Kotlin is now enabled; the earlier Java-only opt-out is superseded. Root
apply-false plugin declarations keep AGP/Kotlin visible in the same classloader. The
pipeline remains JVM-only and its checks passed with no Android SDK variable required.
Native status is one line; long failures previously shifted the viewport under input and
screen sampling. Debug dialog cleanup prevents multiple/orphan developer windows.

Use scripts/verify-native-layout.sh and its documented device variables. Two read-only
Android instances require all instances sharing that AVD to be read-only. Framebuffer
-skin sizes work, but this API37 image requires explicit wm density overrides. Early
large-device test failures were a System UI ANR overlay, not a protocol renderer failure.
Recover the emulator before testing; never loosen colors/geometry to accept a dimmed shot.

Retail templates now use actual windowWidth expressions, including bounded square hero
art for360dp. Old/custom JSON is not regenerated. Server-only publication updates are
verified on the same installed apps. Legacy native golden tools reject wrong dimensions;
new cross-player parity references need matching measured viewports, not390×844 resizing.

Final responsive retail publication19 is1,970,617bytes, SHA b737dd53ebe96186ebbd807b10d6b70a5fdef759a12acdd24fd6ac4a5e39fb0e. The square hero min-expression
clears the headline at360dp. Server-only recaptures use unchanged app binaries. Android
capture checks the latest decoded identity before/after the screenshot, not historical
log membership; installation/configuration transitions can restore an older task briefly.
