# Development guide

Read AGENTS and current PROGRESS before changing code. Preserve source pins and clean
upstream checkouts. `sh scripts/verify-demo.sh` runs JVM, model and real browser tests.
Mobile commands and prerequisites are in [setup](GETTING_STARTED.md).

Templates live in web-editor/model.mjs. Add only upstream primitive structures; declare
editable property paths and use conservative structural recognition. Never serialize a
widget discriminator into the protocol. Test custom-tree preservation and patch locality.
Raw JSON is authoritative; form mismatch must fall back to Custom. Section duplication
with declared IDs must fail until proven-safe ID remapping is implemented.

Validation.kt defines the service subset, not the template catalog. Add an operation
only after checking pinned parser semantics, validating its fields and exercising actual
compiled bytes on the intended player. Add invalid-input/location tests too. Keep the
permissive research CLI separate. Add resources to assets/catalog.json and editor labels to assets/library.json; the
validator reads the actual JVM catalog dynamically; never introduce uncontrolled server-side network fetching.

Backend.kt owns version transactions, conditional fetch and static editor hosting. Tests
must prove invalid compilation preserves previous publication and preview is isolated.
Never edit immutable stored versions. The development service has no authentication.

Android MainActivity is the native debug/fetch shell around official RemoteComposePlayer.
iOS Player.swift wraps the actual C++/Skia bridge. Neither may implement business widgets.
Keep fetch/decode failure preservation and host/local action distinctions. Android uses
Gradle/SDK/adb CLI; iOS uses CMake/xcrun. No physical-device iOS signer is configured.

Update PROGRESS, CONTEXT, DECISIONS, compatibility and setup with each tested milestone.
Commit source/tests/docs together; keep artifacts/caches/secrets out of Git. Do not push.

For visual work use DESIGN_SYSTEM.md and the exact artwork prompts in assets/PROVENANCE.md.
Keep mobile content primitive; capture actual player screenshots before accepting changes.
Do not change old fixtures to hide regressions. Image replacements must patch only the
chosen reference, including in custom trees. The JSON editor virtualizes highlight lines;
do not restore full-document span mounting for large source documents.
