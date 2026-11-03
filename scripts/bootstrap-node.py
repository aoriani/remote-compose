#!/usr/bin/env python3
"""Install the pinned official Node archive under this workspace after SHA-256 checking."""
import hashlib
from pathlib import Path
import platform
import subprocess
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
VERSION = "22.14.0"
ARCHIVES = {
    ("Darwin", "arm64"): ("darwin-arm64", "e9404633bc02a5162c5c573b1e2490f5fb44648345d64a958b17e325729a5e42"),
    ("Darwin", "x86_64"): ("darwin-x64", "6698587713ab565a94a360e091df9f6d91c8fadda6d00f0cf6526e9b40bed250"),
    ("Linux", "aarch64"): ("linux-arm64", "8cf30ff7250f9463b53c18f89c6c606dfda70378215b2c905d0a9a8b08bd45e0"),
    ("Linux", "x86_64"): ("linux-x64", "9d942932535988091034dc94cc5f42b6dc8784d6366df3a36c4c9ccb3996f0c2"),
}


def main():
    selected = ARCHIVES.get((platform.system(), platform.machine()))
    if not selected:
        raise SystemExit("Unsupported bootstrap host; install Node " + VERSION + " manually")
    flavor, expected = selected
    folder = ROOT / ".toolchains"
    folder.mkdir(exist_ok=True)
    target = folder / ("node-v" + VERSION + "-" + flavor)
    archive = folder / (target.name + ".tar.gz")
    if not archive.exists():
        with urlopen("https://nodejs.org/dist/v" + VERSION + "/" + archive.name, timeout=60) as response:
            archive.write_bytes(response.read())
    actual = hashlib.sha256(archive.read_bytes()).hexdigest()
    if actual != expected:
        raise SystemExit("Node archive checksum mismatch: " + str(archive))
    if not target.exists():
        subprocess.run(["tar", "-xzf", str(archive), "-C", str(folder)], check=True)
    subprocess.run([str(target / "bin/node"), "--version"], check=True)
    print("Verified official Node archive: " + expected)


if __name__ == "__main__":
    main()
