# Actual rendered-output evidence

See ../../FULL_FEATURE_TEST_REPORT.md for verdicts, scope, fixes and unresolved gaps.
proof.json contains all31 binary identities, exact dependency pins, source-file hashes,
installed-build identities and capture lineage. The29-document gallery and final corrected
lifecycle tests passed separately. Original failed lifecycle/early capture evidence is
retained; it has not been relabeled as a passing run.

- widgets-*.png: actual published modified widgets, with diagnostic footer lines.
- *-comparison.png: real browser/Android/iOS viewport contact sheets, each390×844.
- animation-phases.png: real variable-phase captures, not a clock-controlled live film.
- live-results.json: both protocol effects actually changed on each platform.
- ios-events.png and interactions*.log: named string payloads and numeric callbacks.
- ios-offline-retained.png / retention-results.json: actual retained pixels while offline.
- comparisons.json: strict cross-platform differences remain15/62; font ROIs excluded
  from gating are explicit and are not visual passes.
- baseline/:27 reviewed static per-platform goldens with primitive binary hash bindings.
- baseline-independent-repeat.json:24 unchanged captures from an independent run pass.
- baseline-negative-control.json: two known bad earlier Android capture frames rejected.
- cli-browser-*: successful actual single-command browser/JVM validation run.
- native transcripts retain the actual test failures and corrected successful reruns.

Runtime documents, all raw full-screen captures, native xcresult and generated heatmaps
are local under artifacts/full-validation/{final,lifecycle-fixed,retention-final,cli-browser}.
Reproduce them with scripts/validate-all.sh. No runtime data store or signing secret is
included. Baselines are intentionally platform-specific; do not substitute these report
contact sheets for native screenshots or update goldens without inspecting the result.
