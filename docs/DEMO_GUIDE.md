# Demonstration guide

The primitive binary pipeline demonstration is runnable. Follow
[getting started](GETTING_STARTED.md), then serve `player-smoke/` with its npm command.
The page shows the genuine Remote Compose player rendering the JVM-generated blue
circle and reports its SHA-256. The automated browser test checks three pixels and
the exact binary digest. This proves the foundation, not the e-commerce editor demo.
[Progress](PROGRESS.md) records the remaining gates.

## Acceptance script to implement and verify

1. Start the actual backend and editor using commands added only after validation.
2. Open unchanged Android and iOS viewer builds; record app artifact hashes and versions.
3. Add header, hero, text, image, button, product/content carousels and spacers from palette.
   Compile and confirm the preview player consumed binary bytes.
4. Add the two tested animations; show their operations in raw JSON and observe movement.
5. Publish; show immutable version, ETag, binary size and SHA-256.
6. Refresh both mobile apps and confirm the same published digest and rendered document.
7. Replace a template with an uncatalogued nested primitive layout/canvas composition.
   Reorder and duplicate a safe custom section; show the custom subtree is preserved.
8. Compile, publish and refresh all players without rebuilding apps; compare app hashes.
9. Trigger a supported host-visible event and inspect native log ID/payload. Separately
   demonstrate a local variable change; explain the distinction.
10. Submit invalid JSON; show diagnostics and unchanged published version. Simulate a
    fetch failure and confirm the last valid document and native debug sheet still work.
11. Toggle automatic refresh and interval in both native debug interfaces.

Record exact commands, fixtures, revisions, screenshots, event evidence and platform
limitations when this script becomes executable. Until then it is an acceptance plan.
