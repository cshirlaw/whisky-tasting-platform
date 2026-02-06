#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "data" / "schemas" / "reviewer.schema.json"
REVIEWERS_DIR = ROOT / "data" / "reviewers"

def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def main():
    if not SCHEMA_PATH.exists():
        print(f"ERROR: missing schema: {SCHEMA_PATH}")
        return 2

    schema = load_json(SCHEMA_PATH)

    if not REVIEWERS_DIR.exists():
        print(f"ERROR: missing reviewers dir: {REVIEWERS_DIR}")
        return 2

    files = sorted([p for p in REVIEWERS_DIR.glob("*.json") if p.name != "index.json"])
    if not files:
        print("ERROR: no reviewer files found (expected at least one .json in data/reviewers)")
        return 2

    ok = 0
    for p in files:
        data = load_json(p)
        try:
            jsonschema.validate(instance=data, schema=schema)
            print(f"OK:   {p}")
            ok += 1
        except jsonschema.ValidationError as e:
            print(f"FAIL: {p}")
            print(e.message)
            return 2

    print(f"Reviewer checks: {ok} file(s)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
