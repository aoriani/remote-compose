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
