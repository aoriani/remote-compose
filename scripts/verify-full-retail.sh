#!/bin/sh
# Existing viewers and isolated backend8092 must already be installed/running; see GETTING_STARTED.
set -eu
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME}"
: "${ANDROID_HOME:?Set ANDROID_HOME}"
: "${IOS_SIMULATOR:?Set booted iOS Simulator UDID}"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export RC_TEST_URL=http://127.0.0.1:8092
mkdir -p artifacts/full-retail
sh scripts/node.sh node --test web-editor/model.test.mjs
sh scripts/node.sh node player-smoke/editor-smoke.mjs
sh scripts/node.sh node player-smoke/default-design.mjs
sh scripts/node.sh node player-smoke/full-retail.mjs
"$ANDROID_HOME/platform-tools/adb" reverse tcp:8092 tcp:8092
sh scripts/gradle.sh -Pandroid :pipeline:test :android-player:testDebugUnitTest :android-player:lintDebug :android-player:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=demo.remotecompose.FullRetailTest#fullPageInteractions --console=plain
"$ANDROID_HOME/platform-tools/adb" pull /sdcard/Download/rc-interactive artifacts/full-retail/android-latest
result="artifacts/full-retail/ios-$(date +%Y%m%d-%H%M%S).xcresult"
xcodebuild test -project ios-player/UITests.xcodeproj -scheme DemoUITests -only-testing:DemoUITests/DemoUITests/testFullRetailPage -destination "platform=iOS Simulator,id=$IOS_SIMULATOR" -derivedDataPath ios-player/build/uitests -resultBundlePath "$result" CODE_SIGNING_ALLOWED=NO
xcrun xcresulttool export attachments --path "$result" --output-path "${result%.xcresult}-attachments"
python3 scripts/check-project.py
printf 'Full-page evidence: artifacts/full-retail; iOS result: %s\n' "$result"
