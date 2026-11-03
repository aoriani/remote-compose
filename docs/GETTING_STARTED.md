# Getting started

The minimal compiler/browser pipeline is runnable. The editor, Kotlin HTTP publishing
backend and mobile applications are not implemented yet.

## Prerequisites

- Git, Python 3 and a JDK; tested with JBR 25.0.4 on macOS arm64. Compiled JVM target
  is 17, but other build JDKs have not been exercised.
- Google Chrome installed (Playwright uses the `chrome` channel). A channel override
  is available via CHROME_CHANNEL; only Chrome was tested.
- Network access to GitHub, Maven Central, Google Maven, Gradle, Node and npm endpoints.
- Writable workspace plus normal Git metadata writes; sandbox approval may be needed
  for Git staging/commit and launching headless Chrome.

Set JAVA_HOME to your JDK home. Existing vendor JDKs can be used from the command line;
Android Studio is not part of this build workflow. Do not change global Java or Xcode
settings just to build the proof.

## Verified sequence

From the repository root with JAVA_HOME exported:

```sh
python3 scripts/bootstrap-node.py
python3 scripts/fetch-upstreams.py
sh scripts/verify-pipeline.sh
```

Node 22.14.0 is downloaded from nodejs.org and checked against the pinned SHA-256.
Gradle Wrapper 9.2.1 verifies its distribution checksum. Sources are fetched at the
exact hashes in upstream-lock.json; existing dirty or differently pinned checkouts
are refused, never discarded. Gradle/npm caches are workspace-local and ignored.

`verify-pipeline.sh` runs the JVM tests, builds the compiler CLI, compiles the fixture,
installs upstream locked npm dependencies, bundles the real player and tests it in
Chrome. All those steps were exercised in the original working tree. Fresh-checkout
verification status is recorded in PROGRESS; do not infer untested platform support.

Expected outputs (ignored/generated):

- `artifacts/minimal-canvas.rc`: 109 bytes.
- `artifacts/minimal-canvas.rc.metadata.json`: header, flat operations, size and SHA-256.
- `artifacts/browser-minimal.png`: actual canvas screenshot.
- `artifacts/browser-proof.json`: matching binary digest and browser pixel-test result.
- `pipeline/build/test-results/test/`: JUnit XML, 63 upstream + six local tests.

## Individual commands

```sh
sh scripts/gradle.sh :pipeline:test :pipeline:installDist --console=plain
pipeline/build/install/pipeline/bin/pipeline samples/minimal-canvas.json artifacts/minimal-canvas.rc
sh scripts/node.sh npm ci --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm run bundle --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm ci --prefix player-smoke
sh scripts/node.sh npm test --prefix player-smoke
sh scripts/node.sh npm run serve --prefix player-smoke
```

Open http://127.0.0.1:8080 while serve runs to see the real binary player. It shows the
blue circle and a binary digest; no remote UI is approximated in HTML. The tiny Node
server is only a static proof harness, not the planned Kotlin publishing service.

For a different compiled file, run `sh scripts/node.sh node player-smoke/server.mjs
/path/to/document.rc`. The automated smoke test intentionally expects the minimal
circle, so arbitrary compositions need their own assertions.

```sh
python3 scripts/check-project.py
python3 scripts/doctor.py
```

The first checks documentation/JSON/metadata integrity, not protocol behavior. Doctor
reports broader project prerequisites and can exit 1 even when the minimal proof works
(e.g. missing Android CLI tools or CMake). Upstream `npm run check` currently fails;
see COMPATIBILITY rather than describing all upstream checks as passing.

No Android/iOS application build commands are available yet. The following sections
record their CLI setup requirements, not completed module builds.

## Android CLI workflow — prerequisites, not project validation

Install Android SDK Command-Line Tools from the official Android developer distribution
on a network-enabled machine. Set ANDROID_HOME to the SDK and include
`cmdline-tools/latest/bin`, `platform-tools`, and `emulator` in PATH. Use a compatible
JDK and obtain required licenses explicitly with `sdkmanager --licenses`.

Choose platform/build-tools/system-image packages matching the eventual pinned build;
list candidates with `sdkmanager --list`. Create an AVD with `avdmanager create avd`
using the selected image; list/start it using `emulator -list-avds` and
`emulator -avd <name>`. Do not assume a particular image is installed.

When the Android module and Wrapper exist, implement and verify the required
assembleDebug, testDebugUnitTest, lintDebug, and connectedDebugAndroidTest tasks.
Then use `adb install -r <apk>`, `adb shell am start -n <package>/<activity>` and
`adb logcat` for installation, launch and logs. Those artifact/package names are not
defined yet. No Android project command is represented as currently runnable.

For a USB device or emulator, `adb reverse tcp:8080 tcp:8080` allows the app to reach
a host backend at device localhost:8080. Android Emulator alternatively exposes the
host through 10.0.2.2. A physical device without reverse needs a reachable host LAN
address and server binding. Cleartext development networking must be configured in
the future app; it is not enabled by this documentation.

## iOS CLI workflow — prerequisites, not project validation

Full Xcode is required on macOS; Command Line Tools selection alone is insufficient.
Use a per-command `DEVELOPER_DIR` pointing to Xcode's Contents/Developer directory,
then inspect `xcodebuild -version`, `xcrun --sdk iphonesimulator --show-sdk-path`, and
`xcrun simctl list devices available`. This avoids changing global developer settings.
The original machine has Xcode 27.2 and an iOS simulator SDK when selected this way.

After implementing an actual scheme, build with xcodebuild for a selected simulator;
install and launch with simctl. No app/scheme exists yet. Device builds need an Apple
development team, signing identity and provisioning; simulator builds do not prove
device signing or performance. iOS builds cannot run on Linux. C++/Skia dependencies
and a Swift bridge still require investigation at the experiments pin.
