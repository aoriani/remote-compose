#!/usr/bin/env python3
"""Fetch exact source pins; never overwrite dirty or differently pinned checkouts."""
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def git(directory, *args, capture=False):
    return subprocess.run(["git", "-C", str(directory), *args], check=True,
                          text=True, stdout=subprocess.PIPE if capture else None).stdout


def main():
    lock = json.loads((ROOT / "upstream-lock.json").read_text())
    parent = ROOT / "upstream"
    parent.mkdir(exist_ok=True)
    for key, folder in [("androidx", "androidx"), ("experiments", "experiments")]:
        entry = lock[key]
        revision = entry["revision"]
        if not revision or len(revision) != 40:
            raise SystemExit("Choose a full upstream revision first: " + key)
        destination = parent / folder
        if destination.exists():
            if not (destination / ".git").exists():
                raise SystemExit("Refusing non-repository directory: " + str(destination))
            actual = git(destination, "rev-parse", "HEAD", capture=True).strip()
            if actual != revision:
                raise SystemExit("Refusing to replace different checkout: " + str(destination))
            dirty = git(destination, "status", "--porcelain", capture=True).strip()
            if dirty:
                raise SystemExit("Refusing modified upstream: " + str(destination) + "\n" + dirty)
        else:
            if "--check" in sys.argv:
                raise SystemExit("Missing upstream; run python3 scripts/fetch-upstreams.py")
            command = ["git", "clone", "--depth=1", "--filter=blob:none", "--no-checkout",
                       entry["repository"], str(destination)]
            subprocess.run(command, check=True)
            if key == "androidx":
                git(destination, "sparse-checkout", "init", "--cone")
                git(destination, "sparse-checkout", "set", "compose/remote", ".agents")
            git(destination, "fetch", "--depth=1", "origin", revision)
            git(destination, "checkout", "--detach", revision)
        print(key + " " + revision)


if __name__ == "__main__":
    main()
