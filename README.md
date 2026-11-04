# Remote Compose Studio prototype

Author an e-commerce landing page as AndroidX Remote Compose primitives, compile on a
plain Kotlin/JVM server, preview the actual binary in a browser and publish the same
binary to generic Android and iOS viewers. Templates are authoring conveniences;
clients contain protocol renderers, not business component registries.

Implemented: strict validation, immutable publication/ETags, eleven visual templates,
custom JSON preservation, property editing, real binary preview, two protocol-native
animations, bitmap resources, host callbacks and native refresh/debug shells.
Android emulator and iOS Simulator rendered the same published custom document without
changing their installed application binaries. This is an experimental subset, not a
production CMS or a claim of universal player compatibility.

## Quick start

Prerequisites: Git, Python 3, JDK 25 (tested JBR 25.0.4), Chrome; network access for tools.
Set `JAVA_HOME` to your JDK, then:

```sh
python3 scripts/bootstrap-node.py
python3 scripts/fetch-upstreams.py
sh scripts/node.sh npm ci --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm run bundle --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm ci --prefix player-smoke
sh scripts/gradle.sh :pipeline:installDist
sh scripts/start-backend.sh
```

Open http://localhost:8080. Existing drafts are preserved; click **Load designed page**
to see Common Market. Use Preview before Publish. Native viewers fetch the latest
published binary; unpublished previews never change it. Runtime versions live in ignored
`data/documents`. Test backend/editor with `sh scripts/verify-demo.sh`.

See [setup and mobile CLI commands](docs/GETTING_STARTED.md),
[demo](docs/DEMO_GUIDE.md), [architecture](docs/ARCHITECTURE.md),
[JSON](docs/JSON_FORMAT.md), [API](docs/API.md),
[compatibility](docs/COMPATIBILITY.md), [research](docs/RESEARCH.md),
[development](docs/DEVELOPMENT_GUIDE.md), [debugging](docs/DEBUGGING.md),
[future research](docs/FUTURE_ARCHITECTURE.md), [progress](docs/PROGRESS.md),
[context](docs/CONTEXT.md), [decisions](docs/DECISIONS.md) and
[third-party software](THIRD_PARTY.md). New sessions start with [AGENTS.md](AGENTS.md).

The [demonstration-readiness review](docs/DEMONSTRATION_REVIEW.md) records the full editor
walkthrough, native UI interactions, same-binary landing page, fixes and screenshots.

The [visual redesign](docs/VISUAL_REDESIGN.md) and [design system](docs/DESIGN_SYSTEM.md)
show the current illustrated retail page, asset gallery and rendered before/after review.
[Original artwork and prompts](assets/PROVENANCE.md) are tracked with the source.
