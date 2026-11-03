# Debugging

## Current environment failures

| Symptom | Observed result | Next action |
| --- | --- | --- |
| `git init -b main` | `.git: Operation not permitted` | Run in a workspace permission profile allowing normal Git metadata writes; no commit exists |
| `git ls-remote ...` | `Could not resolve host: github.com` | Restore authorized shell network/DNS; web search is not a source checkout |
| `java -version` | No selected Java runtime | Select an installed compatible JDK through JAVA_HOME/PATH |
| `xcodebuild -version` default | Active developer directory is CommandLineTools | Use per-command DEVELOPER_DIR pointing at full Xcode |
| Android SDK manager | cmdline-tools directory absent | Install command-line tools explicitly; existing SDK platforms alone are insufficient |
| node/npm/cmake/Gradle | Absent from PATH; no Gradle cache found | Acquire compatible tools/dependencies once networking works |

`python3 scripts/doctor.py` reports local details without installing tools, accepting
licenses, changing settings, or calling remote hosts. Raw diagnostic output is local
machine information; do not use it as a portable dependency lock.

## Protocol investigation checklist (future runtime)

- Unknown opcode: compare header/profile and version maps; do not skip unknown lengths.
- Empty/missing content: distinguish parse failure, parsed no-op, clipping, zero layout,
  zero variables, resource failure and wrong viewport/density.
- JSON accepted but behavior absent: inspect unknown modifier/command handling and the
  actual emitted operations. Acceptance alone is not feature support.
- Wrong text: check actual font measurements, density and player text op support.
- Frozen animation: inspect time and repaint scheduling separately; use deterministic
  frame traces rather than assuming a headless browser advances continuously.
- Click visually works but host sees nothing: local value mutations and host callbacks
  are distinct operations/APIs. Verify the callback path end to end.
- Refresh appears stale: compare binary ETag/version/hash; retain last-good document
  until replacement decoding succeeds. Metadata/latest can race publication.

Experimental upstream tools include state traces, writer-ID inspection, computed layout
and headless rendering. See [status](https://github.com/camaelon/remotecompose-experiments/blob/main/STATUS.md)
and inspect tool scripts at the pin before using them. A differential between two
engines identifies disagreement, not which one is correct.
