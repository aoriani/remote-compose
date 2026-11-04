# Demonstration

Current visual demo: use **Load designed page** or samples/retail-home.json. Browse the
asset gallery, insert an illustration, select Product collection, choose its replacement
target, select another asset and Replace selected. Preview, then Publish. Existing drafts
are preserved until explicitly replaced. The older fixture/runbook below remains useful
for custom-event99 regression; see VISUAL_REDESIGN.md for the current presentation.


1. Start the backend/editor using README. Open localhost:8080. Load the demo, change a
   header property, add a template and Preview. This compiles raw primitive JSON on JVM;
   the real browser player consumes its binary, not HTML business components.
2. Switch to Primitive JSON. Edit a label or drawing value and Apply/Preview. Add the
   animated badge and progress templates. Both animate inside the player. Inspect `time`
   expressions in raw JSON; no JavaScript animation implements their appearance.
3. Add a button and click its rendered area. Host event 42 appears below the preview.
4. Publish. Launch Android and iOS as in GETTING_STARTED, enable auto-refresh in Debug.
   Compare version, byte count and SHA with the published metadata endpoint.
5. Replace the full raw document with samples/custom-composition.json and Preview.
   These nested layouts, gradient/circle drawing and custom button are not catalog widgets.
   The outline labels them custom. Duplicate/move a section and confirm JSON is retained.
6. Restore the unmodified custom fixture, Publish and wait for native refresh. All three
   players show the new composition. Neither native app is rebuilt. The recorded fixture
   is 932 bytes with SHA 3ea80866c330a6f27b827ec964b4d86909fa1b77cafc3926e241b9e047a7d871.
7. Insert an unknown operation/property and Publish. A path-specific diagnostic appears;
   native publication and the last successful preview remain intact. Restore valid JSON.
8. Stop the backend or set an unreachable native URL. Debug remains accessible, errors
   are visible and the previous valid document stays displayed. Restore the URL/backend.

For repeatable interaction smoke use samples/interaction.json (190 bytes, host event 42).
For native animation comparison publish samples/animations.json (556 bytes). The actual
session records and screenshots are under docs/evidence; versions are local store state,
so a fresh run need not use the same version numbers. No production readiness is claimed.

## Reviewed live-demo fixture and preflight

Use samples/demo-landing.json for the full thirteen-section demonstration. Paste it in
Primitive JSON and Apply, or publish it with the curl command in GETTING_STARTED. Current
verified output: 4,163 bytes, SHA-256 7dd683f3de2b007b9b307799cf9128536b0de8b0da47c006819a15711b546d63.
Bring all players to the same publication and compare metadata. Drag vertically to the
custom gradient section and purple event 99 button; drag product cards horizontally.
Use a real pointer/touch drag rather than the mouse wheel inside the canvas.

Before presenting: run verify-demo.sh, check adb reverse and native URLs, open native
Debug and verify the digest, then close Debug and return to the top of the page. Download
JSON before deliberately replacing a draft. Confirm “Preview matches draft” before
presenting a preview; Publish and Preview are separate actions. Do not rebuild apps
while demonstrating a new composition. Allow the configured refresh interval to elapse.
The review and screenshots are in DEMONSTRATION_REVIEW.md.

## Current full retail interaction presentation

Open the editor and choose **Reset to full retail design** if a saved draft is present.
Preview, then Publish. This is the original complete Common Market page. On both native
players use the same backend URL and Refresh; verify the version/hash in Debug.

1. Scroll slightly to the promotional area. Select a dot, use both arrows, tap its CTA,
   and wait five seconds for the next offer. Navigation resets the automatic interval.
2. Scroll to The good stuff. Toggle FIELD/OAT and SOL hearts separately; deselecting one
   leaves the other selected. Tap Add, then plus/minus. The count changes immediately.
3. Swipe the product row horizontally to MORN. Its heart/quantity are independent. Decrement
   to zero to restore Add. Native notices/logs report product asset ID and numeric value.
4. Keep scrolling to the preserved member perk, editorial stories and reward animation.
5. In the editor select Product collection, edit a product name/price or replace its asset.
   Inspect the primitive JSON actions/variables, Preview and Publish. Refresh both unchanged
   apps to show the updated complete page. New document decoding resets session-local state.

Run `sh scripts/verify-full-retail.sh` with the documented environment for automated full-page
acceptance; use `python3 scripts/capture-full-retail-motion.py` for live native frame captures.
The latter reinstalls the existing APK if instrumentation removed it; it does not build apps.
