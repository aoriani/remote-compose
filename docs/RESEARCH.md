# Research record

## Pinned local-source audit — 2026-11-03

The earlier web-index research below is retained as historical evidence. It is superseded
where noted here. Both repositories were acquired, relevant source/tests/builds/history
reviewed, and a genuine JVM-to-browser fixture verified.

| Source | Selected revision |
| --- | --- |
| AndroidX | `8932b2c2b5043cc40c46a44cfd04a1671ec50fb7` |
| Experiments | `a7a76f1d9ecc5aff2af93d0de570a11532552ea3` |

These were the source heads fetched at acquisition; subsequent remote movement was
observed during history inspection, but local HEADs remain fixed. Fetch scripts and
Gradle verify the selected revisions/clean status. Compatibility is scoped to the minimal
fixture, not all operations. See [evidence](evidence/minimal-pipeline.json).

### Verified route

The real static `RemoteComposeJsonParser.parseToByteBuffer` sorts header tags, constructs
RemoteComposeWriter, parses and returns encodeToByteArray output. A fresh parser/writer
is used for each invocation. Unchanged remote-core and creation-core Java/Kotlin sources
compile in a standalone Kotlin JVM Gradle module. No Android runtime, local parser fork,
TypeScript creation engine or business-component adapter is used. The source API remains
library-group restricted and is deliberately coupled to its exact revision.

Actual remote-core decodes the result; Header supplies metadata and an unnested operation
list supplies inspection. The static fixture produces 109 bytes (v1.1.0/API 7/profile 0).
The browser's real RcdPlayer.loadFromArrayBuffer consumes those exact bytes. Three pixel
assertions and SHA-256 agreement pass in Chrome; the screenshot was visually inspected.

Tests: 44 RemoteComposeJsonParserTest cases, 19 Mesh2D parser cases and six local compiler
characterization tests all pass. Upstream's broad TypeScript `npm run check` fails with
existing errors; bundling and the measured runtime fixture pass. See compatibility.

### Corrections and source findings

- `remote-core/.../json/RemoteComposeJsonParserTest.kt` is commented out; no functioning
  alternate parser was found. The earlier inference from indexed test text was wrong.
- Unknown components throw contextual errors. Unknown modifier keys and drawing commands
  are ignored; local tests verify both. Schema presence does not make parsing strict.
- Default JVM platform path support uses RemotePathBase, but bitmap byte/size methods are
  empty/zero stubs. Images need a real platform service before being advertised.
- HostAction/HostNamedAction/metadata forms exist in the actual modifier parser, alongside
  local variable changes. Browser CoreDocument has public callbacks; current iOS Obj-C
  bridge header exposes rendering/touch but no host action callback. Events are untested.
- Experiments commit `9055d26a9048cfe02fe5dc73fb93d2535df8d3fa` added TS/C++ templates,
  layouts and animations. Current Loom source and newer conformance docs supersede stale
  STATUS/GAPS claims that all templates are stubs. We have not independently validated them.
- WireBuffer's integer reader is big-endian. Browser unknown-op handling returns a prefix
  with a warning rather than reliably throwing. No browser decompression path was found;
  keep compression off for the shared subset.
- Conformance's java-json.sh deliberately substitutes Android org.json for ordering;
  our JVM uses upstream's desktop org.json dependency. Resource-order parity needs tests.

### Pinned implementation references

All AndroidX paths below are relative to compose/remote at the selected revision:

- [Parser](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/RemoteComposeJsonParser.java)
- [Component registry](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultComponentParsers.java)
- [Modifier/action registry](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultModifierParsers.java)
- [Creation schema](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/Documentation/parts/remote_compose_schema.json)
- [Parser tests](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/src/test/java/androidx/compose/remote/creation/json/RemoteComposeJsonParserTest.java)
- [JVM build dependencies](https://github.com/androidx/androidx/blob/8932b2c2b5043cc40c46a44cfd04a1671ec50fb7/compose/remote/remote-creation-core/build.gradle)
- [Browser loader/render loop](https://github.com/camaelon/remotecompose-experiments/blob/a7a76f1d9ecc5aff2af93d0de570a11532552ea3/players/typescript/src/web/main.ts)
- [Browser decode behavior](https://github.com/camaelon/remotecompose-experiments/blob/a7a76f1d9ecc5aff2af93d0de570a11532552ea3/players/typescript/src/core/RemoteComposeBuffer.ts)
- [Newer conformance findings](https://github.com/camaelon/remotecompose-experiments/blob/a7a76f1d9ecc5aff2af93d0de570a11532552ea3/players/conformance/README.md)
- [iOS bridge header](https://github.com/camaelon/remotecompose-experiments/blob/a7a76f1d9ecc5aff2af93d0de570a11532552ea3/players/cpp/apps/iosViewer/iosViewer/Bridge/RCMetalRenderer.h)

### Outstanding research

Strict validation strategy; layout/text/font and image fixtures; clocks/repaint;
host callbacks on all players; official Android integration/version checks; experimental
iOS lifetime/touch/event integration; larger common opcode/profile subset. The current
source pair is not mobile-validated. Future fragment/caching research stays separate.

## Initial web-index investigation (historical)


Status: partial source investigation, 2026-11-02. No local upstream checkout, compiled
artifact, player execution, or compatibility measurement exists. Web search excerpts
are useful evidence but do not replace acquiring complete source and tests.

## Evidence ledger

| ID | Source | Observation and confidence |
| --- | --- | --- |
| R1 | [AndroidX architecture](https://github.com/androidx/androidx/blob/androidx-main/compose/remote/remote-core/doc/REMOTE_COMPOSE_ARCHITECTURE.md) | Documents creation, binary encoding, player decoding, layout, expressions, and drawing; documentation inspected |
| R2 | [Creation-core build](https://github.com/androidx/androidx/blob/androidx-main/compose/remote/remote-creation-core/build.gradle) | `java-library` and Kotlin/JVM; depends on remote-core; compile-only org.json 20231013, annotation 1.8.1; moving-branch build inspected |
| R3 | [Parser at 62d36f9](https://android.googlesource.com/platform/frameworks/support/+/62d36f9952c23fdd41095a4fd7ba968fade32eaf/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/RemoteComposeJsonParser.java) | Indexed source exposes static parseToByteBuffer/parseToBuffer and writer.encodeToByteArray; full page fetch failed |
| R4 | [Parser at fa07a37](https://android.googlesource.com/platform/frameworks/support/+/fa07a37857e71e91427b7d68ec6b6f7f2931000a/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/RemoteComposeJsonParser.java) | Indexed source shows resource preprocessing, object/array roots, and contextual exceptions |
| R5 | [Component registry at fa07a37](https://android.googlesource.com/platform/frameworks/support/+/fa07a37857e71e91427b7d68ec6b6f7f2931000a/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultComponentParsers.java) | Indexed implementation inspected: layout registries, first-pass definitions, pattern parameter IDs and inflation |
| R6 | [Modifier registry at 4d0b560](https://android.googlesource.com/platform/frameworks/support/+/4d0b56080497b79e6ac3d1b3b87f1029edf9c3c7/compose/remote/remote-creation-core/src/main/java/androidx/compose/remote/creation/json/DefaultModifierParsers.java) | Indexed onClick parsing creates local value-change actions; this alone is not a host callback |
| R7 | [Parser tests at fa07a37](https://android.googlesource.com/platform/frameworks/support/+/fa07a37857e71e91427b7d68ec6b6f7f2931000a/compose/remote/remote-creation-core/src/test/java/androidx/compose/remote/creation/json/RemoteComposeJsonParserTest.java) | TestStage4Features and parser invocation visible in index; tests not executed or completely reviewed |
| R8 | [Upstream parser guide](https://android.googlesource.com/platform/frameworks/support/+/8b6942263237d29650d16cfff913e0273a9f8ce1/compose/remote/Documentation/parts/json-parser.md) | Indexed primitive/modifier/paint/scroll documentation inspected; implementation must arbitrate |
| R9 | [Experiments status](https://github.com/camaelon/remotecompose-experiments/blob/main/STATUS.md) | Unpinned project report distinguishes measured state parity from missing operations and rendering; inspected, not independently verified |
| R10 | [C++ player guide](https://github.com/camaelon/remotecompose-experiments/blob/main/players/cpp/README.md) | rccore → rcskia rendering; rcplayer runtime; SwiftUI/MTKView iOS host documented |
| R11 | [C++ build guide](https://github.com/camaelon/remotecompose-experiments/blob/main/players/cpp/BUILDING.md) | Build instructions accessible; local dependencies unavailable |
| R12 | [AndroidX testing guide](https://github.com/androidx/androidx/blob/androidx-main/compose/remote/TESTING.md) | Dedicated capture, screenshot, interaction, and embedded-player rules documented |

## JVM hypothesis

R2 makes a plain JVM route plausible. R3 offers a direct JSON-to-ByteBuffer entry
point with default platform services. The server will need an actual org.json runtime
dependency, not just the upstream compile-only declaration. Still inspect transitive
remote-core sources and default platform resource behavior before choosing artifacts.
The parser is marked library-group restricted in indexed source; package access and
distribution implications require review. A successful Java library declaration does
not prove text/image creation works on a server.

Minimal experiment: compile a fixed canvas circle with a fresh parser/writer; decode
the output with the same remote-core; inspect header/version/op list; render those exact
bytes in the experimental browser player. Record source/binary hashes, dependency
versions, commands, and screenshot. Only then start the editor/backend product work.

## Relevant history

[adb54cfe](https://android.googlesource.com/platform/frameworks/support/+/adb54cfebdf55f11e223f75d7efce5d9a7ca3969)
exposes addDataList IDs to JSON variable lookup. This demonstrates that parser coverage
changes even when the underlying protocol operation exists. Review the parent/diff and
test at the selected revision; do not assume all releases include this fix.

Source references here span several AndroidX commits and unpinned experimental docs.
They are **research references, not a selected compatible revision pair**.

## Remaining investigation

- Acquire both repositories; record clean HEADs and inspect relevant Git history.
- Read upstream AGENTS and recursively inventory/read Markdown before modifying upstream.
- Review full parser, ResourceParser, ExpressionParser, default registries, tests,
  writer, WireBuffer, Header, and operation version maps at one commit.
- Resolve the separate remote-core JSON parser/test dialect versus creation JSON.
- Check unknown component/modifier/command behavior, duplicate keys, expression errors,
  resource failures, and parser limits. Reject silent unsupported input at the service.
- Inspect experimental browser binary loader, animation invalidation and event hooks;
  inspect Swift/C++ bridging header, ownership, touch dispatch, and callback ABI.
- Inspect official Android player APIs at the same pin. Avoid confusing AOSP framework
  internal RemoteComposePlayer with the AndroidX public library.
- Determine reproducible JVM artifacts/source inclusion, licenses, and exact versions.

## Runtime findings from the expanded implementation (2026-11-03)

Pins are unchanged. The real compiler, browser, official Android player and C++/Skia iOS
player now exercised nested layout/text/gradients, two time-expression animations and
HostAction42; see COMPATIBILITY and evidence/cross-platform.json for scope. JVM ImageIO
platform services supply actual PNG bytes. The custom932-byte fixture rendered on all
three without changing installed mobile application hashes. An earlier SVG fixture did
not: Android reported Odd command0 and iOS omitted its geometry. Paths are now excluded
from strict service. Persistent gradient paint requires shader0 reset. The iOS bridge's
engine host callbacks and onClick are wired explicitly; the original sample touch-up
alone was insufficient. These verified findings supersede earlier unbuilt/untested notes
in this historical research narrative. No broad protocol or physical-device claim follows.

## SVG failure resolution and visual-resource findings (2026-11-03)

Source inspection established that RemotePathBase.getPath exposes backing capacity while
getSize returns populated length. The default JVM platform forwarded the entire array,
including invalid zero command tails. The prototype adapter now trims to populated length;
a decoded-wire CLOSE assertion and actual curved-heart renders on all three players
verify the repair. This supersedes the earlier blanket path restriction; the enabled
service subset is finite inline absolute M/L/C/Z only. Source pins/upstreams are unchanged.
ImageIO preserves alpha and proportionally bounds the new embedded originals to 640px.
Actual screenshots exposed Remote Compose's start/top/end/bottom padding order and a
colored-emoji icon mismatch; both were corrected in source primitives. See VISUAL_REDESIGN.

## Interactive surfaces follow-up (2026-11-04)

Reviewed the official Android Dev Summit session and its interactive transcript:
[Powering interactive surfaces with Remote Compose](https://developer.android.com/events/dev-summit/talks/powering-interactive-surfaces-with-remote-compose)
(video csh2Opo_wjE). The transcript describes document-side touch/scroll, expression-driven
graphics, animated changing values, functions and reusable components. This motivates the
prototype but is not evidence that every shown operation works in our older pinned players.

Verified directly against pinned sources: `DefaultModifierParsers.parseAction` emits
ValueFloatExpressionChange; `ExpressionParser` maps animationTime() to ID30 and time to
continuous ID1; `RemoteComposeJsonParser` emits textFromFloat variables and supports
conditional blocks/functions in its broader registry. The latter two remain outside the
service subset. No new operation or upstream update was required for this carousel.

Actual browser/Android/iOS tests exercise opcode227 evaluation, ID30 elapsed phases,
continuous repaint, modulo/clamp translations and formatted numeric text. Browser/C++
sources evaluate expression changes at click time, reading earlier actions in the same
list. Generic native hosts only notify/log HostNamedAction float/string arguments.
See INTERACTIVE_DEMO.md, the minimal nested-action-resource reproduction and the updated
FULL_FEATURE_TEST_REPORT. Presentation claims are explicitly separate from tested behavior.
