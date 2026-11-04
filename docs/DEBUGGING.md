# Debugging

## Current state (2026-11-03)

Network isolation is resolved: GitHub git ls-remote and Maven Central HTTP access pass.
Git staging/committing succeeds with approved escalation. Chrome headless launch fails
inside the sandbox (SIGABRT/EPERM) and succeeds through supported approved execution.
Request approval for the failing command; do not work around sandbox restrictions.

The JVM/browser fixture works. Known unresolved issues:

- The upstream player `npm run check` fails with existing TypeScript errors; esbuild
  bundles and the fixture renders. Do not modify upstream to hide these diagnostics.
- Unknown JSON modifiers/commands can disappear without error; future authoring service
  validation must reject unsupported input rather than assume parser strictness.
- Browser unknown opcodes warn and truncate parsing. Loading can appear successful;
  tests must reject warnings and assert expected pixels/state.
- Default parser bitmap services return empty/zero data. Images need real services.
- If npm defaults to an unwritable home cache, use scripts/node.sh (project cache).
  Do not run npm's suggested chown against the user's home.
- CoreDocument size immediately after decode is not header metadata; use Header fields.
- Gradle may log an FSEvents warning in this sandbox; the recorded tasks still passed.

The older session diagnostics below are retained as historical evidence. They are not
current Git/network blockers. See [progress](PROGRESS.md) for the current handoff.


## Historical environment failures

| Symptom | Observed result | Next action |
| --- | --- | --- |
| `git init -b main` | `.git: Operation not permitted` | Run in a workspace permission profile allowing normal Git metadata writes; no commit exists |
| `git ls-remote ...` | `Could not resolve host: github.com` | Restore authorized shell network/DNS; web search is not a source checkout |
| `java -version` | No selected Java runtime | Select an installed compatible JDK through JAVA_HOME/PATH |
| `xcodebuild -version` default | Active developer directory is CommandLineTools | Use per-command DEVELOPER_DIR pointing at full Xcode |
| Android SDK manager | cmdline-tools directory absent | Install command-line tools explicitly; existing SDK platforms alone are insufficient |
| node/npm/cmake/Gradle | Absent from PATH; no Gradle cache found | Acquire compatible tools/dependencies once networking works |

### Resumed-session diagnosis

Git is now initialized: `main` at `123b8b1`; the startup working tree was clean. The
initialization error above is historical, not the current repository state.

Reproduction inside the tool execution environment:

```sh
git ls-remote https://github.com/camaelon/remotecompose-experiments.git HEAD
curl --connect-timeout 5 -I https://github.com
scutil --dns
```

Observed: Git exit 128 (`Could not resolve host: github.com`), curl exit 6, and
`No DNS configuration available`. Python socket.getaddrinfo also fails for GitHub,
raw.githubusercontent.com and repo.maven.apache.org with gaierror errno 8. User reports
the host's same Git request succeeds, so do not change host DNS or blame upstream.

Supported escalation was attempted using exec's `sandbox_permissions=require_escalated`
for the read-only Git command. The tool rejected the request before running it because
the approval policy has `sandbox_approval: false`. Its error mentions a separate request
permissions capability, but no such tool is available in this session's tool inventory.
Do not mistake connected-app permission controls for shell sandbox controls. Resuming
source acquisition requires an execution environment that permits these network operations
or exposes the appropriate permission request mechanism.

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

## Current implementation pitfalls

- SVG paths are intentionally rejected by strict validation: a compiled trial failed
  Android with Odd command0 and omitted C++ geometry. Do not bypass the restriction for
  a demo or substitute native drawing. Investigate JVM path encoding separately.
- Gradient paint stays active until cleared: use paint shader=0 before solid colors.
- Use continuous `time` expressions for animation; animationTime-only repaint stalls
  on the pinned browser. Unknown-opcode warnings are failures, even if load returns.
- iOS undefined ICU/shaper symbols: link the auxiliary Skia libraries in build-ios.sh.
  The prebuilt ICU object requires iOS18.5 minimum deployment target.
- Android AGP9 built-in Kotlin must stay disabled with this root Kotlin plugin; app is
  Java. Existing upstream lint warnings are recorded, not hidden compilation failures.
- Native fetch defaults to localhost8080: Android needs adb reverse; Simulator uses Mac
  localhost. Debug URL/refresh controls remain native when the remote document fails.
- Service errors identify JSON pointers. The original permissive research CLI does not
  enforce the strict service subset. A parser success never proves renderer support.

## Visual iteration corrections

The older path-rejection warning above is historical: populated-length serialization is
fixed, and bounded absolute M/L/C/Z paths now render across all three. Legacy research CLI
still uses the default upstream platform; service compilation uses JvmAssets. Wrong
padding arrays can clip card content: use [start,top,end,bottom]. PNG destination bounds
must match source aspect ratio unless deliberate stretching is intended. Avoid emoji
arrow glyphs for cross-platform icon consistency; use supported line/path operations.
Existing browser drafts do not automatically become the new example—Load designed page
explicitly. Large JSON syntax highlighting renders only visible lines to prevent freezes.

### Gallery capture and rendering diagnostics

Use FULL_FEATURE_TEST_REPORT before interpreting a pixel mismatch. Android activity fade
and a restored task can produce a wrong first screenshot: wait for the expected full
RC_DOCUMENT digest and RC_VIEWPORT, then let the activity settle. The gallery retries one
mismatched launch, and fails if the hash/viewport still does not match. The comparison
normalizes only the actual document rectangle to390×844, not the native toolbar.

An iOS callback `name= type=2 value=...` indicates the action name's nested DATA_TEXT was
not loaded; the local bridge now initializes those static definitions recursively. A circle
clip that parses but draws square is a pinned creation-writer omission, not a player mask
failure. Use the supported roundRect form, or expect the strict backend's unsupported error.

Native test debug settings may point at the isolated8091 backend afterward. Use the generic
CLI --backend/--version overrides or set the normal8080 URL in native debug for the live demo.
