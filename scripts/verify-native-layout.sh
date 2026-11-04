#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
: "${JAVA_HOME:?Set JAVA_HOME to the documented JDK}"
: "${SMALL_IOS_SIMULATOR:?Set SMALL_IOS_SIMULATOR to a booted small phone UDID}"
: "${LARGE_IOS_SIMULATOR:?Set LARGE_IOS_SIMULATOR to a booted large phone UDID}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
small_android="${SMALL_ANDROID_SERIAL:-emulator-5556}"
large_android="${LARGE_ANDROID_SERIAL:-emulator-5558}"
run_dir="artifacts/native-layout/suite-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$run_dir"
sh scripts/gradle.sh :pipeline:test :pipeline:installDist -Pandroid :android-player:assembleDebug :android-player:assembleDebugAndroidTest :android-player:testDebugUnitTest :android-player:lintDebug --console=plain > "$run_dir/build-checks.log" 2>&1
# Requires the normal local backend (GETTING_STARTED). Publication is immutable.
sh scripts/node.sh node scripts/publish-viewport.mjs > "$run_dir/publications.log"
cp samples/native-layout-run.json "$run_dir/publications.json"
sh scripts/gradle.sh -Pandroid :android-player:connectedDebugAndroidTest --console=plain > "$run_dir/android-tests.log" 2>&1
sh scripts/node.sh node scripts/native-layout-capture.mjs android "$small_android" "$run_dir/android-small"
sh scripts/node.sh node scripts/native-layout-capture.mjs android "$large_android" "$run_dir/android-large"
sh scripts/build-ios.sh > "$run_dir/ios-build.log" 2>&1
for size in small large; do
 if [ "$size" = small ]; then device="$SMALL_IOS_SIMULATOR"; else device="$LARGE_IOS_SIMULATOR"; fi
 xcrun simctl install "$device" ios-player/build/RemoteCompose.app
 xcodebuild test -project ios-player/UITests.xcodeproj -scheme DemoUITests -only-testing:DemoUITests/DemoUITests/testNativeViewport -destination "platform=iOS Simulator,id=$device" -derivedDataPath ios-player/build/uitests -resultBundlePath "$run_dir/ios-$size.xcresult" CODE_SIGNING_ALLOWED=NO > "$run_dir/ios-$size-tests.log" 2>&1
 sh scripts/node.sh node scripts/native-layout-capture.mjs ios "$run_dir/ios-$size.xcresult" "$run_dir/ios-$size"
done
sh scripts/node.sh node --test web-editor/model.test.mjs > "$run_dir/model-tests.log"
python3 scripts/check-project.py
printf '%s\n' "Native viewport checks passed. Actual screens and geometry: $run_dir"
