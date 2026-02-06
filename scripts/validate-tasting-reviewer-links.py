#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TASTINGS_DIR = ROOT / "data" / "tastings"
REVIEWERS_INDEX = ROOT / "data" / "reviewers" / "index.json"
REVIEWERS_DIR = ROOT / "data" / "reviewers"

def load_json(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))

def main() -> int:
    if not REVIEWERS_INDEX.exists():
        print(f"Missing reviewers index: {REVIEWERS_INDEX}")
        return 2

    idx = load_json(REVIEWERS_INDEX)
    reviewer_ids = idx.get("reviewers", [])
    if not isinstance(reviewer_ids, list):
        print(f"Invalid reviewers index: {REVIEWERS_INDEX} (reviewers must be an array)")
        return 2

    reviewers = {}

    def norm_id(x):
        if isinstance(x, str):
            return x.strip()
        if isinstance(x, dict):
            v = x.get("id")
            if isinstance(v, str):
                return v.strip()
        return ""

    for entry in reviewer_ids:
        rid = norm_id(entry)
        if not rid:
            print(f"Invalid reviewer id in index: {entry!r}")
            return 2
        p = REVIEWERS_DIR / f"{rid}.json"
        if not p.exists():
            print(f"Missing reviewer file for id '{rid}': {p}")
            return 2
        reviewers[rid] = load_json(p)

    files = sorted((TASTINGS_DIR / "experts").rglob("*.json"))
    if not files:
        print("No tasting JSON files found under data/tastings/")
        return 0

    ok = True
    checked = 0

    for f in files:
        data = load_json(f)
        c = data.get("contributor")
        if not isinstance(c, dict):
            continue

        cid = c.get("id")
        if cid is None:
            continue

        checked += 1
        file_ok = True

        if not isinstance(cid, str) or not cid.strip():
            file_ok = False
            ok = False
            print(f"\nFAIL: {f}")
            print("  - contributor.id: must be a non-empty string")

        elif cid not in reviewers:
            file_ok = False
            ok = False
            print(f"\nFAIL: {f}")
            print(f"  - contributor.id: '{cid}' not found in data/reviewers/index.json")

        else:
            r = reviewers[cid]

            cname = c.get("name")
            if isinstance(cname, str) and cname.strip():
                rname = r.get("displayName")
                if isinstance(rname, str) and rname.strip() and cname.strip() != rname.strip():
                    file_ok = False
                    ok = False
                    print(f"\nFAIL: {f}")
                    print(f"  - contributor.name: '{cname}' does not match reviewer.displayName '{rname}' for id '{cid}'")

            ctier = c.get("tier")
            if isinstance(ctier, str) and ctier.strip():
                rtype = r.get("type")
                if isinstance(rtype, str) and rtype.strip() and ctier.strip() != rtype.strip():
                    file_ok = False
                    ok = False
                    print(f"\nFAIL: {f}")
                    print(f"  - contributor.tier: '{ctier}' does not match reviewer.type '{rtype}' for id '{cid}'")

        if file_ok:
            print(f"OK:   {f}")

    if not ok:
        return 2

    print(f"\nTasting->reviewer link checks: {checked} file(s)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
