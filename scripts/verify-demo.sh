#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
sh scripts/gradle.sh :pipeline:test :pipeline:installDist --console=plain
sh scripts/node.sh node --test web-editor/model.test.mjs
sh scripts/node.sh node player-smoke/editor-smoke.mjs
python3 scripts/check-project.py
