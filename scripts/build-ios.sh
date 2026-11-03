#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
python3 scripts/fetch-upstreams.py --check
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
cmake_bin="${CMAKE_BIN:-$project_root/.toolchains/cmake-3.31.6-macos-universal/CMake.app/Contents/bin/cmake}"
"$cmake_bin" -S ios-player -B ios-player/build/native -DCMAKE_SYSTEM_NAME=iOS -DCMAKE_OSX_SYSROOT=iphonesimulator -DCMAKE_OSX_ARCHITECTURES=arm64 -DCMAKE_OSX_DEPLOYMENT_TARGET=18.5 -DCMAKE_BUILD_TYPE=Release
"$cmake_bin" --build ios-player/build/native --target rcbridge -j 6
app_dir="$project_root/ios-player/build/RemoteCompose.app"
mkdir -p "$app_dir"
sdk_path=$(xcrun --sdk iphonesimulator --show-sdk-path)
skia_lib=$(find ios-player/build/native/_deps/skia-src/out -name libskia.a | head -1)
skia_dir=$(dirname "$skia_lib")
set --
for library in skshaper skunicode_icu skunicode_core harfbuzz icu; do
  if [ -f "$skia_dir/lib$library.a" ]; then set -- "$@" "$skia_dir/lib$library.a"; fi
done
xcrun --sdk iphonesimulator swiftc -swift-version 5 -parse-as-library -target arm64-apple-ios18.5-simulator -sdk "$sdk_path" -import-objc-header ios-player/Bridge/RCMetalRenderer.h ios-player/Player.swift ios-player/build/native/librcbridge.a ios-player/build/native/rcskia/librcskia.a ios-player/build/native/rccore/librccore.a "$@" "$skia_lib" -lc++ -lz -framework SwiftUI -framework MetalKit -framework Metal -framework UIKit -framework Foundation -framework CoreGraphics -framework CoreText -framework ImageIO -framework QuartzCore -framework MobileCoreServices -o "$app_dir/RemoteCompose"
cat > "$app_dir/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>demo.remotecompose.ios</string><key>CFBundleName</key><string>RemoteCompose</string><key>CFBundleExecutable</key><string>RemoteCompose</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleShortVersionString</key><string>0.1</string><key>CFBundleVersion</key><string>1</string><key>MinimumOSVersion</key><string>18.5</string><key>UIDeviceFamily</key><array><integer>1</integer><integer>2</integer></array><key>UILaunchScreen</key><dict/><key>NSAppTransportSecurity</key><dict><key>NSAllowsArbitraryLoads</key><true/></dict></dict></plist>
PLIST
codesign --force --sign - "$app_dir"
printf '%s\n' "$app_dir"
