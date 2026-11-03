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
