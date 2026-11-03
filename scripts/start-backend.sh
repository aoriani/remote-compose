#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$project_root"
if [ ! -x pipeline/build/install/pipeline/bin/pipeline ]; then
  echo 'Build first: sh scripts/gradle.sh :pipeline:installDist' >&2
  exit 1
fi
exec pipeline/build/install/pipeline/bin/pipeline serve "${PORT:-8080}" "${RC_DATA_DIR:-data/documents}"
