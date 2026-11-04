#!/bin/sh
# Full editor acceptance with a private temporary backend/publication store.
set -eu
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME to the documented JDK}"
sh scripts/verify-demo.sh
sh scripts/node.sh node player-smoke/editor-acceptance.mjs
python3 scripts/check-project.py
