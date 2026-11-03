#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if [ -z "${JAVA_HOME:-}" ]; then
  echo "Set JAVA_HOME to an installed JDK (verified with JDK 25)." >&2
  exit 1
fi
export GRADLE_USER_HOME="$project_root/.gradle"
cd "$project_root"
exec ./gradlew "$@"
