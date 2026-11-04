# Common Market artwork

Four original fictional assets were generated with the built-in imagegen tool on
2026-11-03. Final PNGs are tracked here; no image-generation account, global Codex files
or API key is needed to build or run the project. The original transparent PNGs are
retained at full resolution. Existing club-bag.png remains solely for legacy fixtures.

| ID / file | Use | Direction |
| --- | --- | --- |
| oat-milk.png | Field / Oat barista carton | Sage/ivory tactile paper, botanical oat illustration |
| citrus-soda.png | Sol sparkling citrus can | Tangerine/cream aluminum can, fruit segments, condensation |
| granola.png | Morn maple granola pouch | Lavender/cream folded pouch, walnuts and oats |
| market-harvest.png | Hero still life | Cobalt wire basket, produce, baguette, berries |

## Prompt set (built-in tool, transparent background)

Oat milk: Original fictional premium grocery product illustration for Common Market
retail app. One freestanding tall oat milk carton, sage green and warm ivory packaging,
tasteful large typography FIELD / OAT, small OAT DRINK lettering. Three-quarter angle,
beautiful tactile paper, subtle realistic folds, soft studio lighting, refined 3D product
editorial illustration, high-end ecommerce packshot. Entire carton visible with generous
breathing room, tiny soft grounded shadow, centered subject occupying 75% height, no extra
scenery or objects, genuinely transparent background. Square image. Not a shopping bag.
No real brands.

Citrus soda: Original fictional premium beverage product illustration for Common Market
app. One slim sparkling orange soda aluminum can, rich tangerine-orange and cream graphic
packaging, tasteful bold SOL lettering, small SPARKLING CITRUS text, two orange segments
and small green leaf at base. Three-quarter angle, refined realistic 3D editorial product
illustration, soft studio highlights and tactile condensation, high-end ecommerce packshot.
Entire can visible with generous breathing room, subtle grounded shadow, centered subject
occupying 75% height, genuinely transparent background. Square image. No real brands,
no bags.

Granola: Original fictional premium grocery product illustration for Common Market app.
One standing breakfast granola pouch with curved folded top, lavender purple and warm
cream packaging, beautifully restrained MORN typography, small MAPLE GRANOLA lettering,
simple small oat botanical line drawing printed on packaging, two walnuts and a few oat
flakes at base. Refined realistic 3D editorial product illustration, premium tactile paper,
soft studio lighting, three-quarter angle, entire package visible, centered occupying 75%
height with generous breathing room and small grounded shadow. Genuinely transparent
background. Square image. No real brands or shopping bags.

Market harvest: Original premium 3D editorial illustration for Common Market grocery
Scan & Go app: a sculptural cobalt-blue open wire shopping basket filled with fresh
oranges, leafy greens, an artisan baguette and a small berry carton. Orange half and one
green leaf at base. Beautiful composition with diagonal movement and strong silhouette,
tactile clay-meets-photoreal surfaces, sophisticated restrained palette cobalt blue,
tangerine, sage green and cream. No text, no logos, no phone, no UI, no bags. Entire still
life visible, centered with generous breathing room, soft studio lighting and tiny
grounded shadow. Genuinely transparent background, square image.

## Runtime use and extension

catalog.json maps server IDs to PNG files; library.json supplies editor-only display
labels/colors/categories. JvmAssets loads catalog entries, resamples proportionally to
at most 640px with alpha preserved, and embeds actual PNGs through upstream BitmapData.
DrawBitmap destination rectangles in the new templates are square to preserve the square
source aspect ratio. No client-side asset catalog or business component is required.

Add a PNG plus entries in both manifests to extend the gallery. The validator consults
the actual JVM catalog, not a hardcoded product allowlist. Rebuild/restart the backend
for new classpath assets. Existing raw JSON/image references remain authoritative.
