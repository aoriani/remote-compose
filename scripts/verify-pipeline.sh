#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
python3 scripts/fetch-upstreams.py
sh scripts/gradle.sh :pipeline:test :pipeline:installDist --console=plain
mkdir -p artifacts
pipeline/build/install/pipeline/bin/pipeline samples/minimal-canvas.json artifacts/minimal-canvas.rc
sh scripts/node.sh npm ci --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm run bundle --prefix upstream/experiments/players/typescript
sh scripts/node.sh npm ci --prefix player-smoke
sh scripts/node.sh npm test --prefix player-smoke
python3 scripts/check-project.py
