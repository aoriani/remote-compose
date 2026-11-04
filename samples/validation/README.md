# Rendering validation fixtures

These are real primitive documents, generated with `scripts/generate-validation.mjs`.
`plans.json` is test-only screenshot/interaction metadata and is never compiled or sent
to mobile clients. `run.json` is ignored, machine-local immutable-publication bindings.

- `graphics`: alpha, linear gradient, rounded rect, ellipse, circle, cubic path, arc,
  save/clipRect/rotate/translate/scale. Interior color and geometry assertions.
- `bitmaps`: four fictional embedded transparent PNGs, explicit aspect-ratio distortion,
  original 120-square legacy bag and old 160-by-120 stretched destination.
- `layouts`: nested rows/columns/box, wrapping and 12–30 size text, bold, round clipping.
  A circle is expressed with supported roundRect radius50 on a 100-square frame.
  The pinned writer drops CircleShape clip entirely; validation now rejects that form.
- `interactions`: touch502/503, click501, named payload and a separate local-state marker.
- `nested-scroll`: horizontal product row inside long vertical layout.
- `phase-0..4`: deterministic expression-state companions at 0, π/4, π/2, π, 2π.
  They substitute a protocol variable for time, not a host-drawn animation or a claim
  to control the live player clock.
- `live-animations`: actual time-driven badge and progress expressions.
- `retail`: the representative multi-section Common Market landing page.
- `empty`: valid empty layout.
- `*-edited`: changed custom primitives for publication/update verification.

Run `sh scripts/validate-all.sh` with prerequisites from GETTING_STARTED. Each fixture
is published once by the editor; that immutable version/hash is consumed by all players.
The full report distinguishes functional assertions from strict pixel discrepancies.
