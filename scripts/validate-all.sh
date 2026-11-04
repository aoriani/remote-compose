#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
: "${JAVA_HOME:?Set JAVA_HOME to the documented JDK}"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
sh scripts/gradle.sh :pipeline:test :pipeline:installDist --console=plain
sh scripts/node.sh node --test web-editor/model.test.mjs
sh scripts/node.sh node player-smoke/editor-smoke.mjs
sh scripts/node.sh node scripts/generate-validation.mjs
if [ "${FULL_NATIVE:-1}" != 0 ]; then
 sh scripts/gradle.sh -Pandroid :android-player:assembleDebug :android-player:testDebugUnitTest :android-player:lintDebug :android-player:connectedDebugAndroidTest --console=plain
 sh scripts/build-ios.sh
fi
functional_status=0
sh scripts/node.sh node scripts/full-validation.mjs || functional_status=$?
report_dir=$(sh scripts/node.sh node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('artifacts/full-validation/latest.json')).folder)")
visual_status=0
if [ "${FULL_NATIVE:-1}" != 0 ]; then
 sh scripts/node.sh node scripts/compare-validation.mjs "$report_dir" || visual_status=$?
 if [ -f docs/evidence/full-validation/baseline/manifest.json ]; then
  sh scripts/node.sh node scripts/check-visual-baseline.mjs "$report_dir" || visual_status=$?
 fi
fi
sh scripts/node.sh node scripts/report-validation.mjs "$report_dir"
python3 scripts/check-project.py
if [ "$functional_status" != 0 ]; then exit "$functional_status"; fi
# A strict pixel discrepancy remains a nonzero result; reports are still generated.
exit "$visual_status"
