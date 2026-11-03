#!/usr/bin/env python3
"""Check handoff structure and local links; never claim protocol validation."""
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_DOCS = [
    "GETTING_STARTED", "ARCHITECTURE", "JSON_FORMAT", "DEVELOPMENT_GUIDE",
    "DEBUGGING", "DEMO_GUIDE", "RESEARCH", "COMPATIBILITY", "FUTURE_ARCHITECTURE",
    "CONTEXT", "PROGRESS", "DECISIONS",
]


def main():
    errors = []
    required = ["README.md", "AGENTS.md", "upstream-lock.json"] + [
        "docs/" + name + ".md" for name in REQUIRED_DOCS]
    for relative in required:
        if not (ROOT / relative).is_file():
            errors.append("Missing " + relative)
    markdown = [ROOT / "README.md", ROOT / "AGENTS.md"]
    markdown += sorted((ROOT / "docs").glob("*.md"))
    markdown += sorted((ROOT / "samples").glob("*.md"))
    for path in markdown:
        if not path.exists():
            continue
        for target in re.findall(r"\]\(([^)]+)\)", path.read_text()):
            target = target.strip("<>")
            if "://" in target or target.startswith("#"):
                continue
            destination = path.parent / unquote(target.split("#", 1)[0])
            if not destination.exists():
                errors.append("Broken link in " + str(path.relative_to(ROOT)) + ": " + target)
    for path in [ROOT / "upstream-lock.json"] + sorted((ROOT / "samples").glob("*.json")):
        try:
            json.loads(path.read_text())
        except (ValueError, OSError) as error:
            errors.append(str(error))
    try:
        lock = json.loads((ROOT / "upstream-lock.json").read_text())
        for name in ["androidx", "experiments"]:
            revision = lock[name]["revision"]
            if revision is not None and not re.fullmatch(r"[0-9a-f]{40}", revision):
                errors.append(name + " revision must be null or a full commit SHA")
        if lock["status"] == "research-only-not-compatible-pins" and any(
                lock["verification"].values()):
            errors.append("Research-only status conflicts with claimed runtime verification")
    except (KeyError, ValueError, OSError) as error:
        errors.append("Invalid research lock: " + str(error))
    for error in errors:
        print("ERROR: " + error, file=sys.stderr)
    if errors:
        return 1
    print("PASS: required handoff files, local Markdown links, JSON syntax, and lock consistency")
    print("NOT CHECKED: JSON compilation, binary validity, rendering, mobile builds, or events")
    return 0


if __name__ == "__main__":
    sys.exit(main())
