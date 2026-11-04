# Full retail design evidence

This is the complete bundled Common Market page, not the earlier two-section fixture.
`proof.json` contains exact publication12/8092 SHA/size, upstream revisions,27 recorded
host events per player, native executable hashes and screenshot hashes/dimensions.

- `browser-editor/top`: actual editor/default composition. `products-before/selected`,
  `third-product` and `pressed` show independent vector hearts and Add/quantity behavior.
- `browser-phase-4.55/4.775/5`: genuine full-document player with the existing test-only
  clock hook. Intermediate frame shows horizontal translation inside the protocol clip.
- Android/iOS full-screen captures retain original device pixels, native toolbar/safe areas,
  product states and full publication identity. They are not stretched to a common viewport.
- `android-motion-03/04/05`: live first→second slide; `ios-motion-09/10/11`: live second→third;
  `ios-motion-19/20/21`: live last→first wrap. Each includes the full surrounding retail page.
  Capture times are in proof.motion; clocks are not synchronized across players. These are
  screenshot samples, not a frame-rate/performance benchmark.

The implementation required no new mobile application binary: APK/iOS executable hashes
match the prior interaction milestone. Source/test changes are committed with this evidence.
Raw Gradle/Playwright/XCTest logs and result bundles remain ignored under artifacts/full-retail.
Reproduce with scripts/verify-full-retail.sh and scripts/capture-full-retail-motion.py after
following GETTING_STARTED. See FULL_FEATURE_TEST_REPORT for initial failures and limitations.
