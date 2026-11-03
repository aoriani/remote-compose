#!/usr/bin/env python3
"""Fetch pinned macOS CLI tools into the workspace; does not install SDK packages/licenses."""
import hashlib
from pathlib import Path
import platform
import subprocess
from urllib.request import urlopen
import zipfile
ROOT = Path(__file__).resolve().parents[1]
TOOLS = [
    ("cmake.tar.gz", "https://github.com/Kitware/CMake/releases/download/v3.31.6/cmake-3.31.6-macos-universal.tar.gz", "330b9514f5112e5ed4fb08b8b05803b776fd9b539a6ae12927d14dcc0ee2ba8d", "cmake-3.31.6-macos-universal"),
    ("android-cli.zip", "https://dl.google.com/android/repository/commandlinetools-mac-13114758_latest.zip", "5673201e6f3869f418eeed3b5cb6c4be7401502bd0aae1b12a29d164d647a54e", "android-cli/cmdline-tools"),
]
if platform.system() != "Darwin":
    raise SystemExit("This bootstrap is for macOS; install equivalent Android CLI/CMake tools on Linux")
folder = ROOT / ".toolchains"
folder.mkdir(exist_ok=True)
for name, url, expected, destination in TOOLS:
    archive = folder / name
    if not archive.exists():
        with urlopen(url, timeout=60) as response:
            archive.write_bytes(response.read())
    actual = hashlib.sha256(archive.read_bytes()).hexdigest()
    if actual != expected:
        raise SystemExit("Checksum mismatch: " + name)
    if not (folder / destination).exists():
        if name.endswith(".zip"):
            target = folder / "android-cli"
            with zipfile.ZipFile(archive) as z:
                z.extractall(target)
            for p in (target / "cmdline-tools/bin").iterdir():
                p.chmod(p.stat().st_mode | 0o111)
        else:
            subprocess.run(["tar", "-xzf", str(archive), "-C", str(folder)], check=True)
    print("Verified", destination, expected)
