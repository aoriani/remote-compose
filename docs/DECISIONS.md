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
