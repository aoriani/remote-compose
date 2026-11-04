# Common Market design system

The fictional retail brand is warm, editorial and useful. The workbench is a restrained
neutral design tool; the mobile page has its own brand hierarchy, generous product art
and deliberate retail content. Neither is a grid of placeholder rectangles.

## Visual language

| Area | Decision |
| --- | --- |
| Retail color | Paper #F5F4EF, ink #182C38, navy #203B73, cobalt #305BEF, muted #73808A |
| Product families | Sage oat carton, tangerine citrus can, lavender granola pouch; each has its own packaging silhouette |
| Typography | Web system sans; mobile player-native sans. Editorial headings25px/650 weight, hero28px, price21px, body13–15px, supporting copy10–12px. No font is baked into a screen image. |
| Spacing |4px base,8px component rhythm,20px page gutters,12px carousel inset plus8px card inset. Remote Compose padding is start/top/end/bottom. |
| Proportions |390×844 authored viewport; compact masthead/greeting,232px illustrated feature,172px-ish product cards, horizontal story panels, quieter member content below the fold. |
| Iconography | Thin geometric strokes. Search/plus/arrows use drawing primitives; hearts use real cubic SVG PathData. Editor palette has distinct line glyphs. No platform emoji arrows. |
| Surfaces | White product cards on paper, tinted image stages, contrasting navy feature. Elevation stays restrained: editor phone/panel shadows and artwork's own studio shadows. No unsupported mobile shadow claim. |
| States | Web hover/focus/selected/disabled/empty/error and stale-preview states. Selected asset and layer are explicit; image-replacement target survives edits. Native host callbacks demonstrate actions; this is not a functioning cart/checkout. |

## Composition, not a flattened mockup

The mobile UI is real text, rows, columns, canvas paths/lines/rectangles/circles and bitmap
resources. Product artwork is bitmap imagery; headings, prices, cards, controls and layout
remain directly editable Remote Compose JSON. Nested horizontal rows sit in a vertically
scrolling column. Generic clients need no Common Market business components.

The editor presents an asset library, compact primitive-template palette, ordered layers,
portrait artboard and inspector. Search/filter, insert and replacement operate on upstream
addBitmap references. Unknown/custom subtrees can replace images too. Forms never rebuild
the whole document. All source remains available in the highlighted JSON editor.

## Artwork and extensions

Original transparent PNGs, exact generation prompts and runtime policy are in
[asset provenance](../assets/PROVENANCE.md). Source files remain high resolution; the JVM
preserves alpha and proportionally bounds embedded images to 640px. The new templates use
square image destinations to match square source canvases and avoid stretching. Arbitrary
raw drawBitmap rectangles are still caller-controlled, as required by the actual protocol.

To add artwork: add a PNG, a catalog entry and an editor library entry, rebuild the JVM
resources and restart. No mobile rebuild is needed. Prefer illustrations with negative
space, a clean silhouette and predictable transparent margins. Do not substitute the
legacy shopping-bag fixture for new products.

## Boundaries

Canvas-authored headlines have designed frames; unusually long copy needs a layout-text
composition or explicit size/position edits. The gallery currently has three products and
one hero illustration, not a full CMS/import pipeline. Category/favorite/cart affordances
are demo content; product cards emit generic201–203 events and the feature emits 42.
Only inline absolute M/L/C/Z SVG commands are enabled, not arbitrary SVG files or filters.
Native font metrics, letterboxing and animation phases differ. The native debug shells
remain utilitarian and outside the authored retail page. Accessibility and production
retail behavior have not been certified.
