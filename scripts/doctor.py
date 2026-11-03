#!/usr/bin/env python3
"""Report prerequisites without installs, network calls, or machine configuration changes."""
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def run(command, env=None):
    try:
        result = subprocess.run(command, capture_output=True, text=True,
                                timeout=20, env=env, cwd=ROOT)
        return {"ok": result.returncode == 0,
                "exitCode": result.returncode,
                "output": (result.stdout + result.stderr).strip()[:2500]}
    except (OSError, subprocess.TimeoutExpired) as error:
        return {"ok": False, "error": str(error)}


def find_executable(name, candidates=()):
    options = [shutil.which(name)] + [str(p) for p in candidates]
    return next((p for p in options if p and Path(p).is_file()
                 and os.access(p, os.X_OK)), None)


def main():
    home = Path.home()
    java_home = os.environ.get("JAVA_HOME")
    java = find_executable("java", [])
    java_candidates = ([Path(java_home) / "bin/java"] if java_home else [])
    # macOS's /usr/bin/java may be only a launcher with no selected runtime.
    if java and not run([java, "-version"])["ok"]:
        java = None
    java_candidates += [
        Path("/Applications/Android Studio Preview.app/Contents/jbr/Contents/Home/bin/java"),
        Path("/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/java"),
    ]
    if not java:
        java = next((str(p) for p in java_candidates if p.is_file()
                     and run([str(p), "-version"])["ok"]), None)

    sdk_candidates = [os.environ.get("ANDROID_HOME"), os.environ.get("ANDROID_SDK_ROOT"),
                      str(home / "Library/Android/sdk"), str(home / "Android/Sdk")]
    sdk = next((Path(p) for p in sdk_candidates if p and Path(p).is_dir()), None)
    tools = {}
    local_node_bins = sorted((ROOT / ".toolchains").glob("node-v22.14.0-*/bin"))
    tool_env = dict(os.environ)
    if local_node_bins:
        tool_env["PATH"] = str(local_node_bins[0]) + os.pathsep + tool_env.get("PATH", "")
    for name in ["git", "node", "npm", "cmake", "kotlinc", "gradle"]:
        candidates = [directory / name for directory in local_node_bins] if name in ("node", "npm") else []
        executable = find_executable(name, candidates)
        tools[name] = {"path": executable}
        if executable:
            tools[name].update(run([executable, "--version"] if name != "kotlinc"
                                   else [executable, "-version"], tool_env))
    tools["java"] = {"path": java}
    if java:
        tools["java"].update(run([java, "-version"]))
    for name, relative in [("adb", "platform-tools/adb"),
                           ("emulator", "emulator/emulator"),
                           ("sdkmanager", "cmdline-tools/latest/bin/sdkmanager"),
                           ("avdmanager", "cmdline-tools/latest/bin/avdmanager")]:
        candidates = [sdk / relative] if sdk else []
        tools[name] = {"path": find_executable(name, candidates)}

    xcode = {"requiredHost": "Darwin", "available": False}
    if platform.system() == "Darwin":
        developer = Path(os.environ.get("DEVELOPER_DIR",
                                       "/Applications/Xcode.app/Contents/Developer"))
        env = dict(os.environ, DEVELOPER_DIR=str(developer))
        version = run(["xcodebuild", "-version"], env)
        ios_sdk = run(["xcrun", "--sdk", "iphonesimulator", "--show-sdk-path"], env)
        xcode = {"developerDirectory": str(developer), "version": version,
                 "simulatorSdk": ios_sdk,
                 "available": version["ok"] and ios_sdk["ok"]}

    lock = json.loads((ROOT / "upstream-lock.json").read_text())
    pins_ready = all(lock[name]["revision"] for name in ("androidx", "experiments"))
    missing = [name for name in ("java", "node", "npm", "cmake", "git",
                                 "adb", "emulator", "sdkmanager", "avdmanager")
               if not tools[name].get("path") or tools[name].get("ok") is False]
    if not (ROOT / ".git").exists():
        missing.append("project Git repository")
    if not pins_ready:
        missing.append("compatible upstream revision pins")
    if not xcode["available"]:
        missing.append("Xcode and iOS simulator SDK (macOS required)")
    report = {
        "scope": "prerequisites only; does not establish build or player compatibility",
        "platform": platform.system(),
        "gitStatus": run(["git", "status", "--short", "--branch"]),
        "tools": tools,
        "androidSdk": {
            "path": str(sdk) if sdk else None,
            "platforms": sorted(p.name for p in (sdk / "platforms").iterdir())
            if sdk and (sdk / "platforms").is_dir() else [],
            "buildTools": sorted(p.name for p in (sdk / "build-tools").iterdir())
            if sdk and (sdk / "build-tools").is_dir() else [],
        },
        "xcode": xcode,
        "pinsReady": pins_ready,
        "missing": missing,
    }
    print(json.dumps(report, indent=2))
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
