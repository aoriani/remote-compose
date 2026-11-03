# Research record

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
