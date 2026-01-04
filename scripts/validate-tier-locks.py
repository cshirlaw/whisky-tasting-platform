import os, sys, json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data", "tastings")

bad = False
checked = 0

for dirpath, _, filenames in os.walk(DATA):
    for fn in filenames:
        if not fn.lower().endswith(".json"):
            continue
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, ROOT).replace("\\", "/")
        try:
            with open(full, "r", encoding="utf-8") as f:
                j = json.load(f)
        except Exception as e:
            print("FAIL:", rel)
            print("  JSON parse error:", str(e))
            bad = True
            continue

        tier = (((j.get("contributor") or {}).get("tier")) or "").strip().lower()

        expected = None
        if "/data/tastings/experts/" in ("/" + rel):
            expected = "expert"
        elif "/data/tastings/consumers/" in ("/" + rel):
            expected = "consumer"

        if expected:
            checked += 1
            if tier != expected:
                print("FAIL:", rel)
                print("  contributor.tier =", repr(tier), "expected", repr(expected))
                bad = True

print("Tier-lock checks:", checked, "file(s)")
sys.exit(1 if bad else 0)
