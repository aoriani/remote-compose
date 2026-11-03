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

79 JVM tests, six model tests, browser workflow, Android CLI/instrumentation and iOS
engine-input smoke passed. See PROGRESS/evidence for precise scope. No physical devices
were tested. Expanded fresh-clone validation at86e9595 passed backend/editor tests and both native
builds; see evidence/expanded-clean-checkout.json. Native image/scroll and UI automation
coverage remain next. Never infer broad compatibility from a successful parse.
