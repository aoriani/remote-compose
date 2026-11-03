# Remote Compose prototype

Build a cross-platform visual authoring prototype: upstream primitive JSON →
Kotlin/JVM compiler → one binary document → genuine browser, Android, and iOS players.
The visual widget catalog is an authoring convenience. Clients must not implement
business widgets. New compositions use supported primitives; new protocol capabilities
can still require client releases.

## Recover context first

1. Read this file, `docs/PROGRESS.md`, `docs/CONTEXT.md`, and `docs/DECISIONS.md`.
2. Inspect Git branch, status, diff, and recent history; preserve existing work.
3. Run `python3 scripts/doctor.py`; inspect `upstream-lock.json`.
4. Read relevant implementation and research before continuing the next milestone.

## Current layout

- `docs/`: research, design, evidence, and handoff. Distinguish plans from verified behavior.
- `samples/`: candidate upstream-format fixtures; see their README for validation status.
- `scripts/`: portable environment diagnostics and project checks.
- `upstream-lock.json`: research references and unresolved implementation pins.
- Backend, editor, and mobile applications are not implemented yet.

## Development rules

- Prove JSON → JVM binary → genuine player before implementing the editor.
- Inspect pinned upstream source, tests, build files, history, and all applicable
  upstream instructions. Recursively read upstream Markdown as required by AndroidX.
- Do not treat research commit references as tested compatible dependency pins.
- Do not create another business-widget protocol or an HTML approximation renderer.
- Primitive JSON is authoritative. Keep editor metadata separate; preserve custom trees.
- Android must build, test, install, and debug using SDK/Gradle/emulator CLI tools.
  Do not depend on Android Studio workflows. iOS builds require Xcode on macOS.
- Use meaningful commits after validated milestones; never reset user work, rewrite
  history, force-push, or push without explicit authorization.
- If Git/network permissions block work, record exact failures. Do not bypass restrictions.
- Test changed behavior. Record commands, results, revision, and platform. A source
  inspection or successful parse is not a rendering or compatibility test.
- Update PROGRESS, CONTEXT, DECISIONS, and relevant setup/feature docs alongside changes.
- Before ending: run applicable checks; report branch, commit, dirty files, limitations,
  and next steps. Do not describe scaffolding or upstream claims as working product code.

Start with [README](README.md) and [research](docs/RESEARCH.md).
