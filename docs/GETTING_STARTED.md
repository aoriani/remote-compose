# Getting started

The product is not runnable yet. These are the only implemented project commands:

```sh
python3 scripts/check-project.py
python3 scripts/doctor.py
```

The check command should pass; doctor returns nonzero if prerequisites/pins are missing.
Do not interpret either command as Remote Compose validation.

## Resume the initial investigation

1. Read [progress](PROGRESS.md), [context](CONTEXT.md), and [decisions](DECISIONS.md).
2. Ensure the workspace permits normal Git metadata writes and outbound Git/dependency
   downloads. The original session could write source files but not initialize `.git`.
3. Inspect status before changes. In a new empty-history workspace only, initialize Git:
   `git init -b main`. Commit research after checking the diff and running the checks.
4. Inspect any existing local upstream copies before downloading. Neither upstream was
   found in the original workspace or its Development parent. Use `upstream/` (ignored)
   for external checkouts once network access is available.
5. Acquire AndroidX and experiments, inspect instructions/source/history, choose complete
   commit hashes, and populate the revision lock. Do not use moving branches as final pins.
6. Resolve compatible build/dependency versions, then prove the minimal pipeline described
   in [research](RESEARCH.md). Backend, editor and mobile start commands do not exist yet.

## JVM and web prerequisites

A JDK is needed; `/usr/bin/java` alone is not proof of an installed runtime. For an
existing vendor JDK, set JAVA_HOME to its home and prepend its bin to PATH. The original
machine has JBR 25.0.4 inside Android Studio Preview; this was detected without using
Android Studio. Its compatibility with selected Gradle/AGP/Kotlin is unverified. Prefer
the JDK required by the pinned build. Node/npm and CMake were absent from PATH.

No Gradle Wrapper or Node lockfile is shipped yet because no build has been selected.
The existing upstream package-lock and native dependency fetch mechanisms must be
reviewed and pinned rather than silently replaced by latest packages.

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
