#!/bin/sh
set -eu
project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
case "$(uname -s):$(uname -m)" in
  Darwin:arm64) node_flavor=darwin-arm64 ;;
  Darwin:x86_64) node_flavor=darwin-x64 ;;
  Linux:aarch64) node_flavor=linux-arm64 ;;
  Linux:x86_64) node_flavor=linux-x64 ;;
  *) echo "Unsupported local Node bootstrap host" >&2; exit 1 ;;
esac
node_bin="$project_root/.toolchains/node-v22.14.0-$node_flavor/bin"
if [ ! -x "$node_bin/node" ]; then
  echo "Run python3 scripts/bootstrap-node.py first" >&2
  exit 1
fi
export PATH="$node_bin:$PATH"
export npm_config_cache="$project_root/.cache/npm"
exec "$@"
