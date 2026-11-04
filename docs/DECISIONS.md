# Architectural decisions

## 001 — Upstream primitive JSON is authoritative (2026-11-02)

Decision: target the AndroidX creation JSON parser; keep editor hints outside its input.
Context: business-component JSON would reproduce the client registry constraint.
Alternatives: invent an editor/server widget protocol; use a separate low-level JSON
dialect. Reasoning: upstream parser structures offer layouts and drawing while custom
compositions remain editable. Consequence: verify and pin one parser dialect before
implementing templates; unknown custom subtrees survive editing.

## 002 — Compile/render proof precedes product implementation (2026-11-02)

Decision: hold backend/editor/mobile implementation behind a minimal plain-JVM compile
and actual binary-player smoke test. Alternatives: start UI scaffolding against guessed
JSON or substitute an HTML preview. Reasoning: the key risk is genuine protocol/player
compatibility. Consequence: environment restrictions currently block the critical path;
research and reproducible diagnostic work can proceed independently.

## 003 — Evidence and compatible pins are separate (2026-11-02)

Decision: record observed source hashes as research references and leave unresolved
implementation revisions null. Alternatives: arbitrarily label an indexed commit as
compatible or select latest branches. Reasoning: web-indexed sources span revisions;
experimental player coverage is untested. Consequence: no reproducible build claim until
both checkouts and the shared pipeline are tested and recorded.

## 004 — No environment restriction bypass (2026-11-02)

Decision: record denied Git writes and unavailable shell networking; retain normal
workspace files and provide a handoff. Alternatives: move Git metadata outside the
restricted workspace or use an unreviewed transfer path. Reasoning: normal source/Git
access is necessary for the requested reproducible workflow. Consequence: no commits
can currently be created; transfer must include the working files until Git is available.

Update after user initialization: the foundation now exists on `main` at `123b8b1`.
The initial no-repository consequence is superseded. Network restrictions persist in
the execution environment despite reported host connectivity. A supported escalation
attempt was rejected by approval policy; preserve exact diagnostics and do not recast
this permission prerequisite as an architectural limitation.

## 005 — Fragment caching deferred (2026-11-02)

Decision: investigate patterns and reuse in documentation only. Alternatives: encode
fragment caching into the first compiler. Reasoning: ID relocation and cross-player
expansion are unproven. Consequence: initial publishing design compiles complete
documents; future experiments remain separate from core acceptance.

## 006 — Standalone build of pinned upstream sources (2026-11-03)

Decision: compile unchanged remote-core and remote-creation-core Java/Kotlin sources
inside a small standalone Gradle JVM module; call the real JSON parser from Kotlin.
Alternatives: full AndroidX monorepo build, unverified published alpha artifacts, or
experimental TypeScript compilation. Reasoning: the selected source exposes the needed
JSON entry point and compiles without Android; monorepo infrastructure and unrelated
modules are unnecessary for this proof. Consequences: source hashes are enforced,
upstream licenses retained, Gradle/npm dependencies locked, upstream parser tests run.
The parser is library-group restricted, so this is an explicitly source-coupled research
integration, not a promise of stable supported SDK APIs.

## 007 — Scope compatibility claims to measured fixtures (2026-11-03)

Decision: pin AndroidX 8932b2c and experiments a7a76f1 for the verified minimal fixture;
keep broader/mobile compatibility unverified. Alternatives: claim all API-7 operations
work, follow moving upstream heads, or use documentation status as proof. Reasoning:
unknown commands/modifiers can be ignored, the browser truncates unknown opcode streams,
its TypeScript check fails, and status notes lag implemented template support.
Consequences: browser digest/pixel assertions gate changes; add feature-specific tests
for text/resources/animation/actions before expanding the supported authoring subset.

## 008 — Workspace-local toolchain caches (2026-11-03)

Decision: use a SHA-checked official Node archive, Gradle Wrapper with distribution
checksum, and workspace Gradle/npm caches. Keep JAVA_HOME user-configurable.
Alternatives: global installations or modifying the machine's Java/Xcode defaults.
Reasoning: portability and sandbox-friendly operation. Consequences: downloads are
ignored and reproducible; macOS arm64 is tested, other bootstrap hosts are not yet tested.
Git metadata writes and headless Chrome may still need explicit execution approval.

## 009 — Explicit strict primitive capability subset (2026-11-03)

Decision: validate strict RFC JSON with Jackson (duplicate/trailing-token detection), then
validate a documented primitive subset with JSON Pointer diagnostics before upstream
compilation. This validation never rewrites input and is independent of widget recognition.
Alternatives: trust the permissive upstream parser/schema or invent widget JSON.
Consequence: unsupported primitives are explicit 422 errors; arbitrary nested supported
compositions remain legitimate. Broader upstream features require schema/tests before enablement.

## 010 — Atomic immutable publication bundles (2026-11-03)

Decision: each numeric version is a single atomic JSON file containing original source,
base64 binary and metadata. Publication is serialized with a process monitor/file lock;
latest is the highest committed numeric version. Alternatives: mutable latest plus
separate files or a database. Consequence: no source/binary/metadata race, no pointer to
half-written content; previews never write publication state. This is local prototype
storage, not a multi-host CMS. Binary GET supplies version, SHA and conditional ETags.

## 011 — JSON-tree authoring and conservative template recognition (2026-11-03)

The editor stores primitive JSON directly. Templates are factories; property forms are
recognized by structural fingerprints excluding only their editable paths. Raw structural
changes fall back to custom sections. Reordering/duplication/deletion patch section arrays;
ID/variable-declaring duplicates are refused pending explicit remapping. No business
widget discriminator is transmitted. Native clients remain generic protocol players.

## 012 — JVM resource services and real protocol animation (2026-11-03)

A separate classpath asset catalog supplies named bitmaps to upstream defineBitmap;
JSON still uses upstream addBitmap/drawBitmap commands. ImageIO implements actual PNG
encoding, replacing the upstream default's empty bitmap service. No JSON widget extension.
The two animations use continuous time expressions because ID-30 animationTime alone
does not request continuous repaint in the pinned browser. Tests observe varying real
player arc/rectangle calls, decoded bitmap drawing and an ID-42 HostAction callback.

## 013 — Generic mobile players and authored viewport (2026-11-03)

Use pinned official Android source and experimental C++/Skia, with native fetch/debug
shells only. Android's player context uses160dpi and scales the authored header viewport
rather than adopting API8 density flags. Swift adapts the upstream Metal bridge to expose
real host callbacks and onClick; touch-up alone did not dispatch click. Both apps fetch
identical published bytes. Simulator Skia requires arm64/iOS18.5 and ICU/shaper libraries.
Physical-device signing remains deferred and explicitly unverified.

## 014 — Restrict paths after actual rendering failure (2026-11-03)

An SVG custom fixture compiled but caused Android Odd command0 and missing iOS geometry.
Successful compilation is insufficient. Strict service now rejects drawPath/path resources;
the working custom fixture uses circles and resets persistent shader paint with shader0.
Keep the failed trial documented rather than hiding it with native UI fallbacks. Re-enable
paths only after investigating JVM path encoding and running real cross-platform tests.

## 015 — Demo fixes retain primitive source and snapshot boundaries (2026-11-03)

The review found padded backgrounds painted only inner text, duplicate selection remaining
on the original, misleading zoom footprint and ambiguous preview freshness. Fix template
primitive ordering/alignment, select the copy, fit the actual frame and show draft/preview
equality. Serialize compile/publish controls and discard previews for superseded source.
Publication still uses its submitted snapshot; preview remains separate. Existing custom
or older JSON is preserved, never upgraded by regenerating it from a changed template.

## 016 — Real Simulator input and compact native debug evidence (2026-11-03)

Add a standalone XCTest UI target against the installed generic viewer. This replaces
engine-input-only interaction evidence with actual gesture/host-log assertions for the
reviewed fixture. Keep scroll/bitmap visual verification separate from automated event
assertions. Collapse raw iOS metadata to expose events; keep source/renderer/pins unchanged.
No business widget, native animation or application-specific click behavior is introduced.

## 017 — Repair path capacity and use a real, portable asset catalog (2026-11-03)

The prior SVG failure was traced to DEFAULT_PLATFORM returning RemotePathBase.getPath(),
which exposes allocated capacity rather than populated length. The JVM platform now
copies only getSize() elements. A decoded-binary regression asserts the final CLOSE
opcode, preventing trailing zero commands. Curved heart paths rendered on browser,
Android and iOS. Strict service enables bounded finite inline absolute M/L/C/Z paths;
other path dialects/resources remain outside the enabled subset. This supersedes 014's
blanket path restriction, without changing protocol pins or modifying upstream.

Original transparent product artwork is checked in. Classpath catalog IDs are resolved
dynamically, assets are proportionally bounded to 640px for binary embedding, and the
editor gets a separate browse/insert/replace gallery. Source JSON still contains only
upstream addBitmap/drawBitmap/path operations. New artwork/compositions need no mobile
business widgets or client rebuild. Bitmap documents are larger; compression and fragment
caching remain deferred.

## 018 — Editorial composition and source-preserving asset authoring (2026-11-03)

Reconsider hierarchy and imagery together: original product silhouettes, typographic scale,
compact Scan & Go hero, horizontal collections and quiet member content. The editor is a
visual workbench with real image targets, not a flattened product mockup. All mobile text,
layout, icons and cards stay protocol primitives; only illustrations are raster resources.
Existing drafts/custom JSON are not migrated or regenerated. Lower-page animations are
measured in a visible fixture and native captures. Adopt visible-line highlighting to
retain raw-JSON editing performance with larger primitive documents. No protocol pin or
native business renderer changes; record remaining fixed-frame and payload-size limits.

## 019 — Validate emitted capabilities and load immutable preview bytes (2026-11-03)

Decision: Load published fetches the immutable version binary, not a recompilation of
its JSON. Editable bitmap size preserves its aspect ratio and center within the existing
188px art frame. CircleShape clipping is rejected with a location-specific unsupported
error because the pinned creation ClipModifier.write emits only RectShape and
RoundedRectShape. A square rounded rectangle with half-side radius supplies a genuine
supported circular clip. Alternatives: silently accept the dropped shape, stretch the
bitmap by editing only its right edge, or treat recompilation as proof of identical
published bytes. Consequences: arbitrary safe JSON remains authoritative; larger image
frames require raw JSON; compilation failures identify the actual supported subset.
Tests: 81 JVM tests, nine model tests, browser controls and exact downloaded-hash checks.

## 020 — Generic nested text initialization and observable native actions (2026-11-03)

Decision: subscribe Android CoreDocument's named-action callback alongside ID actions;
initialize immutable nested DATA_TEXT in the iOS bridge before interaction. Context:
real gallery clicks exposed an empty C++ action name despite an intact string payload.
The writer creates the name inside the action list, which the pinned C++ DATA traversal
skips. Alternatives: change protocol JSON/business names, special-case event IDs, or
advance upstream pins. Reasoning: resource initialization is a generic renderer concern.
Consequences: pins stay unchanged; no business callback map or native widget types;
XCTest asserts both name/payload, and a separate marker proves local variable updates.
Patterns/overriding text and broader action-list data semantics remain outside this proof.

## 021 — Separate functional, deterministic-state and strict pixel evidence (2026-11-03)

Decision: publish each gallery case once, validate immutable digest in all players,
retain strict cross-platform differences, and keep same-platform static goldens separate.
Five phase-variable documents test matching expression states; live time-driven frames
prove motion without claiming clock synchronization or frame-rate parity. Alternatives:
compare arbitrary live phases, raise thresholds until all screenshots pass, or accept
model tests/decoding as rendering evidence. Consequences:15 strict ROI comparison flags
remain visible;24 independent unchanged golden captures pass, and two known bad earlier
Android captures are rejected. Test coordinates/ROIs never become a business UI protocol.

## 022 — Measure native logical viewports; retire header aspect-fit (2026-11-03)

Decision: layout receives available dp/point width and height. Device pixel ratio is the
only host-level uniform conversion. The Android API7 context stays160dpi to avoid double
density adjustment; its ViewGroup remeasures logical bounds and rounds outward by<1dp.
iOS uses UIView points and direct point input, then Skia drawable pixels. Alternatives:
fit the390×844 header, stretch a bitmap, match backgrounds to hide gaps, or enable a newer
untested density protocol. Reasoning: measured full-screen captures showed114.7px Android
and98px-per-side iOS gaps caused by aspect-fit, not native constraints. Consequences:
responsive primitive expressions are required for fixed canvas right edges; old native
390×844 goldens are incompatible and capture tools must preserve actual pixels. Full-width
edge colors and circle geometry are tested, along with raw full-screen screenshots.

## 023 — Material3 developer chrome stays native (2026-11-03)

Decision: Android ComponentActivity hosts a Compose Material3 TopAppBar/Scaffold and an
AndroidView containing the official player. Native title, refresh/debug icons,48dp targets
and safe insets replace the old LinearLayout buttons. Generic HTTP/debug logic remains in
Java; no business widget moves to Compose. AGP9 built-in Kotlin is enabled, Kotlin/compiler
stays2.2.20, and AGP/Compose plugins share the root classloader. Alternatives: keep generic
buttons or add another toolbar toolkit. Consequences: UI dependencies are locked; plain
JVM compilation still works without an Android runtime. One-line native status prevents
error/refresh layout jumps; full errors remain in debug. Upstream revisions are unchanged.

## 024 — Phase-based carousel and session-local shopping state (2026-11-04)

Decision: encode the carousel phase, manual reset/retarget, active indicators and local
shopping state entirely as existing variables, expressions and opcode227 actions.
Alternatives: per-platform timers or a native carousel business component; new protocol
operations; advancing pins. Reasoning: actual source/runtime tests establish support
for elapsed time, arithmetic, clamp/modulo, translation, textFromFloat and expression
writes. A single phase avoids overlapping animation jobs or duplicate automatic host
callbacks. Consequences: backgrounding catches up, state is session-local, decode time
can consume the initial interval, and inspector slide count is bounded2–5. Native hosts
only display generic action feedback. Unknown structural JSON remains custom and intact.

## 025 — Initialize interned nested text consistently (2026-11-04)

Decision: apply only immutable browser TextData recursively after loading, before clicks,
matching the established C++ bridge repair. Context: the third dot emitted null action
name because the resource was nested under the first dot's unexecuted action list.
Alternatives: business-specific name maps, clicking the first dot programmatically,
changing JSON names to avoid interning, or updating upstream. Consequences: generic,
source-coupled browser shim, pinned API guard, minimal unadapted/adapted reproduction
and exact name/payload regression tests. No action execution or fake rendering in setup.

## 026 — Private GitHub remote without publication (2026-11-04)

Authenticated owner aoriani and workspace name remote-compose resolved naming. Created
private aoriani/remote-compose with gh, set origin SSH, retained all local history. No
push is authorized. Future push requires explicit user authorization and renewed content/
history secret audit. See GITHUB_SETUP.md. Ignore rules alone do not prove a clean history.

## 027 — Interactive design is the editor default (2026-11-04)

User requested that the new design replace the default rather than require an extra
load action. Startup/reset now use the shared interactive primitive factory. The previous
static design remains explicit. Migrate only identical untouched old defaults and keep a
backup; preserve every modified/custom/malformed draft. Published source is never replaced
by startup. Real browser tests cover migration, reset, retention and genuine player input.

## 028 — Enhance the original full retail page, not a replacement demo (2026-11-04)

Decision: supersede027's choice of the simplified interactive fixture as default. Preserve
all original full-page sections except the promotional area and product controls; integrate
carousel and per-product state directly into those sections. Both bundled JSON names are
identical generated aliases. Remove the alternate design loader; retain historical factories
only for regression/migration. User clarification explicitly requires the existing full design.

Alternatives: keep a separate interactive demo, hide simplified content behind another action,
or implement native cards. Rejected because they fail the full-page/same-client objective.
Consequences: a longer scrolling full page, independent product namespaces and conservative
inspector editing; existing modified drafts are never regenerated. Namespace collisions are
reported rather than silently sharing state. Mobile application executables remain identical.

Use an explicit exported products_scroll reference. Browser testing showed the implicit
literal0 path emits a FloatConstant reapplied during paint, resetting context position on
press and mis-targeting scrolled products. A primitive-source declaration avoids this path
without changing pins or player code. Full-page pointer tests on all three platforms and
actual screenshots, including live native slide frames, are the acceptance evidence.
