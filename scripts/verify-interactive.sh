#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME to the documented JDK}"
: "${ANDROID_HOME:?Set ANDROID_HOME to the SDK}"
: "${IOS_SIMULATOR:?Set IOS_SIMULATOR to a booted arm64 Simulator UDID}"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export RC_TEST_URL="${RC_TEST_URL:-http://127.0.0.1:8092}"
# Native tests deliberately use localhost8092. Keep this isolated from demo8080.
[ "$RC_TEST_URL" = http://127.0.0.1:8092 ] || { echo 'Native suite requires backend8092' >&2; exit 1; }
sh scripts/gradle.sh -Pandroid :pipeline:test :pipeline:installDist :android-player:assembleDebug :android-player:testDebugUnitTest :android-player:lintDebug --console=plain
sh scripts/node.sh node --test web-editor/model.test.mjs
sh scripts/node.sh node player-smoke/editor-smoke.mjs
sh scripts/node.sh node player-smoke/interactive-smoke.mjs
sh scripts/node.sh node player-smoke/carousel-editor.mjs
sh scripts/node.sh node player-smoke/interactive-stress.mjs
sh scripts/node.sh node player-smoke/action-resource-repro.mjs
sh scripts/node.sh node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('artifacts/interactive/browser-proof.json'));fs.writeFileSync('samples/interactive-run.json',JSON.stringify({cases:p.records},null,2))"
"$ANDROID_HOME/platform-tools/adb" reverse tcp:8092 tcp:8092
sh scripts/gradle.sh -Pandroid :android-player:connectedDebugAndroidTest --console=plain
"$ANDROID_HOME/platform-tools/adb" pull /sdcard/Download/rc-interactive artifacts/interactive/android
sh scripts/build-ios.sh
xcrun simctl install "$IOS_SIMULATOR" ios-player/build/RemoteCompose.app
result="artifacts/interactive/ios-$(date +%Y%m%d-%H%M%S).xcresult"
xcodebuild test -project ios-player/UITests.xcodeproj -scheme DemoUITests -only-testing:DemoUITests/DemoUITests/testInteractiveRetail -only-testing:DemoUITests/DemoUITests/testInteractiveVisualState -destination "platform=iOS Simulator,id=$IOS_SIMULATOR" -derivedDataPath ios-player/build/uitests -resultBundlePath "$result" CODE_SIGNING_ALLOWED=NO
sh scripts/node.sh node scripts/report-interactive.mjs "$result"
python3 scripts/check-project.py
printf '%s\n' "Interactive evidence: artifacts/interactive; iOS result: $result"
