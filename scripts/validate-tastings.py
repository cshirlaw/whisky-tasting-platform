import json
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError:
    print("Missing dependency: jsonschema")
    print("Install it with: python3 -m pip install --user jsonschema")
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schema" / "tasting.schema.json"
DATA_DIR = ROOT / "data" / "tastings"

schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
validator = jsonschema.Draft202012Validator(schema)

ok = True
files = sorted(DATA_DIR.rglob("*.json"))

if not files:
    print("No JSON files found under data/tastings/")
    sys.exit(0)

for f in files:
    data = json.loads(f.read_text(encoding="utf-8"))
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        ok = False
        print(f"\nFAIL: {f}")
        for e in errors:
            path = ".".join([str(p) for p in e.path]) or "(root)"
            print(f"  - {path}: {e.message}")
    else:
        print(f"OK:   {f}")

if not ok:
    sys.exit(2)

print("\nAll files passed schema validation.")
