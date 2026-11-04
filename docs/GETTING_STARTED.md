# Getting started

## JVM backend and browser

Use the commands in [README](../README.md). JDK 25.0.4, Node 22.14.0, Gradle 9.2.1 and
Chrome 156 were exercised on macOS arm64. JAVA_HOME must name a JDK; an IDE is not
required. Source acquisition enforces both upstream commit pins and clean checkouts.

`sh scripts/start-backend.sh` serves the editor and APIs on 127.0.0.1:8080.
Optional environment: PORT, RC_DATA_DIR, RC_BIND_HOST. Binding beyond localhost exposes
an unauthenticated development server; do so only for your local device network.
Run `sh scripts/verify-pipeline.sh` for the original minimal gate and
`sh scripts/verify-demo.sh` for the expanded backend/editor suite. Install npm dependencies
first. Persistent version bundles are generated data, not tracked source.

## Android entirely from CLI

Install a compatible JDK and Android SDK. On macOS the checksum-pinned local tool
bootstrap installs CMake and SDK command-line binaries without an IDE:

```sh
python3 scripts/bootstrap-mobile.py
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PWD/.toolchains/android-cli/cmdline-tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
sdkmanager --sdk_root="$ANDROID_HOME" --licenses
sdkmanager --sdk_root="$ANDROID_HOME" 'platforms;android-36' 'build-tools;36.0.0' platform-tools emulator 'system-images;android-36;google_apis;arm64-v8a'
avdmanager create avd -n RemoteCompose -k 'system-images;android-36;google_apis;arm64-v8a'
emulator -avd RemoteCompose -no-snapshot-save
```

Accept SDK licenses interactively. The SDK-36 build was verified; the emulator actually
exercised in this session was an existing API-37 Android 17 Medium Phone AVD. Creating a
new SDK-36 AVD is the documented equivalent, not a claim that this particular AVD was run.
Linux uses the official Linux CLI tools and an image matching host architecture instead.

In another terminal, with JAVA_HOME and ANDROID_HOME set:

```sh
sh scripts/gradle.sh -Pandroid :android-player:assembleDebug :android-player:testDebugUnitTest :android-player:lintDebug
adb reverse tcp:8080 tcp:8080
adb install -r android-player/build/outputs/apk/debug/android-player-debug.apk
adb shell am start -n demo.remotecompose/.MainActivity
adb logcat -s RC_DOCUMENT RC_HOST_EVENT
sh scripts/gradle.sh -Pandroid :android-player:connectedDebugAndroidTest
```

Instrumentation uses an in-device test HTTP server and a genuine compiled fixture;
it need not publish or alter your backend. It can uninstall the application afterward:
reinstall the APK for a demo. Debug opens a native bottom dialog with URL, interval,
auto-refresh, status, metadata and bounded event log. Default URL uses localhost and adb
reverse. Emulator 10.0.2.2 reaches the host as an alternative. A physical device can use
USB adb reverse or your host LAN address, with backend RC_BIND_HOST=0.0.0.0.

## iOS Simulator CLI (macOS only)

Requires full Xcode, its licensed command-line tools and an installed iOS Simulator
runtime. Tested Xcode 27.2, iPhone 18 Pro Simulator, arm64; minimum linked target 18.5.
The build uses xcrun swiftc plus CMake, not an Xcode GUI project.

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcrun simctl list devices available
python3 scripts/bootstrap-mobile.py
sh scripts/build-ios.sh
```

Choose a device UUID from the list and substitute it below:

```sh
xcrun simctl boot DEVICE_UUID
xcrun simctl bootstatus DEVICE_UUID -b
xcrun simctl install DEVICE_UUID ios-player/build/RemoteCompose.app
xcrun simctl launch DEVICE_UUID demo.remotecompose.ios
xcrun simctl io DEVICE_UUID screenshot ios-player/build/screenshot.png
```

Simulator localhost reaches the Mac backend. Publish a document before launching.
Native Refresh and Debug remain available when fetching or decoding fails. The debug
sheet contains URL, auto-refresh, interval, metadata, errors and host log.

For the automated engine-input smoke: publish samples/interaction.json, launch with
`--smoke` and simctl --stdout/--stderr file arguments. It sends the fixture click into
the real C++ engine, observes event 42, deliberately fetches an unreachable URL, checks
last-good preservation and restores the URL. This is not a native UI tap automation test.

Physical-device iOS packaging/signing is not implemented or tested. It requires the
device Skia slice, an iPhoneOS build, a development team/certificate/provisioning profile,
signing entitlements and a reachable backend URL. Linux cannot build this iOS target.

## Reproduction evidence

A fresh clone of86e9595 fetched both exact upstream revisions and rebuilt/tests passed
for backend/editor, Android assembly/unit/lint and iOS Simulator. It reproduced the custom
932-byte binary digest with clean project/upstream trees. Host JDK/Chrome/SDK/Xcode and a
verified CMake executable were reused as installed prerequisites; native runtime tests
were exercised in the original checkout. See evidence/expanded-clean-checkout.json.
Mobile build entry points now additionally enforce clean, pinned upstream sources.

## Real iOS UI interaction test

Build/install the generic app as above and start the backend. Publish the exact extended
fixture (the test uses its authored 390×844 coordinates), then run the standalone UI test
project. It does not change the app architecture or use the internal --smoke click hook.

```sh
curl --fail -X POST -H 'Content-Type: application/json' --data-binary @samples/demo-landing.json http://localhost:8080/api/publish
xcrun simctl install DEVICE_UUID ios-player/build/RemoteCompose.app
xcodebuild test -project ios-player/UITests.xcodeproj -scheme DemoUITests -destination 'platform=iOS Simulator,id=DEVICE_UUID' -derivedDataPath ios-player/build/uitests -resultBundlePath ios-player/build/ui-results.xcresult CODE_SIGNING_ALLOWED=NO
```

Use a new resultBundlePath for subsequent runs (Xcode will not overwrite an existing
result bundle). Assertions cover actual taps/events 42/99 and native log clearing;
retained screenshot attachments cover the landing page, carousel and vertical drags.
Scroll/bitmap fidelity is inspected visually, not inferred from test completion.

## Current designed example

The default fresh draft is now Common Market. Existing local drafts are deliberately
preserved; click **Load designed page** to see the redesign. Alternatively paste
samples/retail-home.json into Primitive JSON and Apply. Its gallery uses four checked-in
PNG originals; rebuilding JVM resources includes them automatically.

```sh
curl --fail -X POST -H 'Content-Type: application/json' --data-binary @samples/retail-home.json http://localhost:8080/api/publish
```

The same iOS UI-test command works with retail-home.json; it checks 42, clearing, digest
prefix and swipes, and tests 99 only when present in the publication's primitive source.
To analyze retained native screenshots:
`sh scripts/node.sh node scripts/analyze-animation.mjs docs/evidence/redesign`.
Review VISUAL_REDESIGN.md for current screenshots and limitations before presenting.

## Full feature and rendered-output validation

Use the same JDK/SDK/Xcode environment above and boot one Android emulator and one
arm64 iOS Simulator. Stop other test runs that manipulate those devices. The single
command is:

```sh
sh scripts/validate-all.sh
```

It runs JVM/model/browser checks, CLI Android unit/lint/instrumentation, the iOS build,
actual editor controls, immutable binary gallery captures, native UI lifecycle checks,
viewport variants and screenshot comparisons. It starts its own backend on **8091**
with isolated publication data; leave that port free. `FULL_NATIVE=0 sh scripts/validate-all.sh`
runs the portable browser/JVM portion. Native tests require the documented macOS tools;
Linux must use browser-only mode. Screenshots/reports go to `artifacts/full-validation/`;
`latest.json` points to the last run. Use a new FULL_REPORT_DIR for native runs; Xcode
refuses to overwrite an existing xcresult bundle. `REPORT.md`, `summary.json`, `run.json`, native logs,
xcresult, source/binary fixtures and pixel-difference heatmaps remain local artifacts.

Strict cross-platform pixels can differ despite correct geometry. The command retains
nonzero comparison results and still writes the report; inspect `comparisons.json`
rather than raising thresholds. Reviewed same-platform static baselines are checked
separately. Changed fixture hashes require explicit baseline review. See
[FULL_FEATURE_TEST_REPORT](FULL_FEATURE_TEST_REPORT.md) for measured limitations.

The generic viewers also accept transient CLI connection/version overrides, useful for
replaying an immutable publication without changing saved debug preferences:

```sh
adb reverse tcp:8091 tcp:8091
adb shell am start -S -W -n demo.remotecompose/.MainActivity --es backend http://127.0.0.1:8091 --es version 1
xcrun simctl launch booted demo.remotecompose.ios --backend http://127.0.0.1:8091 --version 1
```

Use an existing version number from that backend. iOS `--no-auto --interval 2` sets
transient refresh options for lifecycle automation. These options select documents,
not business widgets.

## Native viewport / app bar regression suite

The current native contract measures the available dp/point viewport, not a390×844
aspect-fit rectangle. See [native layout review](NATIVE_LAYOUT_FIX.md). The focused suite is:

```sh
export SMALL_IOS_SIMULATOR=<booted-small-phone-UDID>
export LARGE_IOS_SIMULATOR=<booted-large-phone-UDID>
export SMALL_ANDROID_SERIAL=emulator-5556
export LARGE_ANDROID_SERIAL=emulator-5558
sh scripts/verify-native-layout.sh
```

Use the JDK/SDK/Xcode environment above, run the normal backend on8080, and boot only the
two Android test instances while instrumentation runs. The script publishes immutable
fixtures, records new versions in ignored samples/native-layout-run.json, then runs all
checks and saves actual native screenshots/geometry under artifacts/native-layout/suite-*.
It does not overwrite existing publication versions. End-to-end execution passed on the
recorded two emulator and two Simulator configurations.

For the recorded Android sizes, reuse an installed AVD and start two read-only instances
(all instances sharing that AVD must use read-only; close its ordinary instance first):

```sh
emulator -avd Medium_Phone_API_37.0 -port 5556 -read-only -no-snapshot -no-window -no-audio -skin 720x1600
emulator -avd Medium_Phone_API_37.0 -port 5558 -read-only -no-snapshot -no-window -no-audio -skin 1440x3120
# Run the emulator commands in separate terminals; after each finishes booting:
adb -s emulator-5556 shell wm density 320
adb -s emulator-5558 shell wm density 480
```

`-skin WIDTHxHEIGHT` sets the actual framebuffer. The density override is explicit because
this API37 image retains physical density420. Inspect both wm size and wm density before
running. Read-only instances leave the base AVD data intact. No Android Studio is needed.

On the tested iOS27.2 runtime, the small phone was created and booted through CLI:

```sh
xcrun simctl create 'Remote Compose Small SE' com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation com.apple.CoreSimulator.SimRuntime.iOS-27-2
# Use the returned UDID, or an existing suitable device from simctl list devices:
xcrun simctl boot <small-UDID>
xcrun simctl bootstatus <small-UDID> -b
xcrun simctl boot <large-UDID>
xcrun simctl bootstatus <large-UDID> -b
```

Select an available large device, such as iPhone18ProMax, from your installed runtime.
Old390×844 native pixel goldens are historical. Their comparison helpers now reject
incompatible actual viewport dimensions; use the focused suite for container correctness.
They must not be made green by stretching a screenshot into the old frame.

## Interactive retail demo

See [interactive guide](INTERACTIVE_DEMO.md). With JAVA_HOME configured, build the backend,
then start an isolated service (the8092 data directory is separate from the old8080 demo):

```sh
sh scripts/gradle.sh :pipeline:installDist
PORT=8092 RC_DATA_DIR=data/interactive sh scripts/start-backend.sh
```

Open http://127.0.0.1:8092, use the interactive default (or **Reset to full retail design**), Preview and
Publish. Native debug URLs must also use8092; Android requires `adb reverse tcp:8092 tcp:8092`.
The inspector exposes carousel text/art/timing/order/visibility/actions; raw JSON remains
editable. With an idle Android emulator and booted arm64 iOS Simulator, the full-page suite is:

```sh
IOS_SIMULATOR=<booted-simulator-udid> sh scripts/verify-full-retail.sh
```

Set JAVA_HOME, ANDROID_HOME and DEVELOPER_DIR using the earlier setup instructions. The
suite publishes test documents to the isolated service and writes artifacts/full-retail. Install both native viewers using the earlier instructions
before running this suite. It tests the bundled full page, including all three products.
It does not push the private GitHub remote; see [GitHub setup](GITHUB_SETUP.md).
