# Remote Compose cross-platform authoring prototype

The intended demonstration is an e-commerce landing page authored as **AndroidX
Remote Compose primitive JSON**, compiled by a Kotlin/JVM server, and rendered from
the same binary by general-purpose browser, Android, and iOS players. Widget templates
belong to the editor. New supported primitive compositions should need no app release.

**Current state: initial research and environment diagnostics only.** There is no
working backend, editor, or mobile application. The required minimal compilation and
genuine rendering gate has not passed. See [progress](docs/PROGRESS.md).

## Available commands

Python 3 and Git are the only prerequisites for the current repository tools:

```sh
python3 scripts/check-project.py
python3 scripts/doctor.py
```

The first checks documentation links, metadata, and candidate JSON syntax. The second
reports available toolchains without installing anything or changing machine settings;
it exits nonzero when prerequisites are missing. Neither validates Remote Compose.

Implementation will require a compatible JDK/Kotlin/Gradle stack, Node/npm, Android
command-line SDK tools, and Xcode plus an iOS SDK on macOS. Versions are deliberately
unselected until upstream revisions can be acquired and tested. `upstream-lock.json`
records unresolved pins separately from source research references.

## Documentation

| Guide | Purpose |
| --- | --- |
| [Getting started](docs/GETTING_STARTED.md) | Current checks and prerequisites |
| [Architecture](docs/ARCHITECTURE.md) | Intended pipeline and consistency rules |
| [JSON format](docs/JSON_FORMAT.md) | Parser findings and candidate example |
| [Research](docs/RESEARCH.md) | Source references, evidence, remaining investigation |
| [Compatibility](docs/COMPATIBILITY.md) | Separate parser/protocol/player support |
| [Development](docs/DEVELOPMENT_GUIDE.md) | Next implementation stages and test plan |
| [Debugging](docs/DEBUGGING.md) | Environment and protocol pitfalls |
| [Demo](docs/DEMO_GUIDE.md) | Planned acceptance demonstration; currently unavailable |
| [Future architecture](docs/FUTURE_ARCHITECTURE.md) | Research-only reuse and caching |
| [Context](docs/CONTEXT.md) | Durable discoveries and constraints |
| [Progress](docs/PROGRESS.md) | Verified work, blockers, next actions |
| [Decisions](docs/DECISIONS.md) | Decision log |
| [Agent instructions](AGENTS.md) | Resume work in a new session |

The current environment denies `.git` creation and shell network resolution. Files
are saved in the workspace but cannot yet be committed. No repository history or
compatible upstream pin is claimed.
