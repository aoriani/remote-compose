# Remote Compose cross-platform authoring prototype

This project demonstrates primitive Remote Compose JSON compiled on Kotlin/JVM and
rendered by general-purpose players. Editor widgets will be authoring templates;
new business compositions should not require native business-component implementations.
Unsupported protocol capabilities can still require player/application updates.

**Working foundation:** unchanged pinned AndroidX sources compile the primitive JSON
into a real binary document. A browser harness loads those bytes using the pinned
experimental TypeScript player. The automated test checks the binary digest and canvas
pixels. HTTP publishing, the full editor, animations/events and mobile apps remain pending.

## Quick start

Install/select a JDK (tested: JBR 25.0.4), Python 3, Git and Google Chrome. Network access
is needed for sources/dependencies. Set JAVA_HOME to the JDK's home, then:

```sh
python3 scripts/bootstrap-node.py
python3 scripts/fetch-upstreams.py
sh scripts/verify-pipeline.sh
```

The script runs 63 upstream parser tests, six prototype tests, compiles the sample,
bundles the genuine player and exercises it in headless Chrome. On sandboxed macOS,
Chrome launch and Git metadata writes may require explicit approval.

For the visible proof after verification:

```sh
sh scripts/node.sh npm run serve --prefix player-smoke
```

Open http://127.0.0.1:8080. This is a primitive canvas proof, not a visual editor.
See [getting started](docs/GETTING_STARTED.md) for individual commands and prerequisites.

## Recorded result

The 390×844 circle fixture produces 109 bytes, protocol v1.1.0, default API level 7,
profile 0. The browser consumes the same SHA-256 that the JVM reports.
[Evidence and exact revisions](docs/evidence/minimal-pipeline.json),
[rendered screenshot](docs/evidence/minimal-browser.png).
Only this fixture is established as compiler/browser compatible. Android/iOS are unbuilt.

## Repository

- `pipeline/`: Kotlin compiler CLI, real upstream-source compilation, JUnit tests.
- `player-smoke/`: genuine browser player host and Playwright checks.
- `samples/`: upstream primitive JSON fixture.
- `scripts/`: pinned-source acquisition, tool bootstrap and verification.
- `upstream-lock.json`: selected source revisions, dependencies and verification scope.
- `docs/`: research, architecture and durable handoff.

## Documentation

| Guide | Purpose |
| --- | --- |
| [Getting started](docs/GETTING_STARTED.md) | Verified compiler/browser setup; mobile prerequisites |
| [Architecture](docs/ARCHITECTURE.md) | Implemented proof and intended service/editor/mobile design |
| [JSON format](docs/JSON_FORMAT.md) | Real parser behavior and verified example |
| [Research](docs/RESEARCH.md) | Local audit, corrections and historical evidence |
| [Compatibility](docs/COMPATIBILITY.md) | Fixture-level evidence versus broader capabilities |
| [Development](docs/DEVELOPMENT_GUIDE.md) | Extension/test plan |
| [Debugging](docs/DEBUGGING.md) | Current issues and historical environment diagnostics |
| [Demo](docs/DEMO_GUIDE.md) | Primitive proof and future full demonstration |
| [Future architecture](docs/FUTURE_ARCHITECTURE.md) | Research-only reuse and caching |
| [Context](docs/CONTEXT.md) | Discoveries and recovery steps |
| [Progress](docs/PROGRESS.md) | Completed work and next actions |
| [Decisions](docs/DECISIONS.md) | Architectural decision log |
| [Agent instructions](AGENTS.md) | Session startup and development rules |
| [Third-party software](THIRD_PARTY.md) | Source/license/dependency handling |

History is preserved. The former network isolation is resolved; approved Git writes
work. Upstream sources and generated outputs are excluded from Git and reacquired by pin.
