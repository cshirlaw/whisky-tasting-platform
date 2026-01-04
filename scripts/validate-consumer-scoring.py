import os, json, sys

ROOT = os.path.abspath(os.getcwd())
CONSUMERS = os.path.join(ROOT, "data", "tastings", "consumers")
EXPERTS = os.path.join(ROOT, "data", "tastings", "experts")

def iter_json_files(base):
  for dirpath, _, filenames in os.walk(base):
    for fn in filenames:
      if fn.lower().endswith(".json"):
        yield os.path.join(dirpath, fn)

def fail(path, msg):
  print(f"FAIL: {path}\n  {msg}")
  sys.exit(1)

def ok(msg):
  print(msg)

def read_json(path):
  with open(path, "r", encoding="utf-8") as f:
    return json.load(f)

def is_int(x):
  return isinstance(x, int) and not isinstance(x, bool)

def check_consumer(path):
  j = read_json(path)
  tier = (((j.get("contributor") or {}).get("tier")) or "")
  if tier != "consumer":
    fail(path, f"consumer folder requires contributor.tier='consumer' (got {tier!r})")
  t = j.get("tasting") or {}
  cs = t.get("consumer_scoring")
  if not isinstance(cs, dict):
    fail(path, "consumer folder requires tasting.consumer_scoring object")
  overall = cs.get("overall_1_10", None)
  if not is_int(overall) or overall < 1 or overall > 10:
    fail(path, "tasting.consumer_scoring.overall_1_10 must be an integer 1..10")

def check_expert(path):
  j = read_json(path)
  tier = (((j.get("contributor") or {}).get("tier")) or "")
  if tier == "consumer":
    fail(path, "experts folder must not contain contributor.tier='consumer'")
  t = j.get("tasting") or {}
  if "consumer_scoring" in t:
    fail(path, "experts folder must not contain tasting.consumer_scoring")

def main():
  if os.path.isdir(CONSUMERS):
    for p in iter_json_files(CONSUMERS):
      check_consumer(p)
  if os.path.isdir(EXPERTS):
    for p in iter_json_files(EXPERTS):
      check_expert(p)
  ok("Consumer scoring checks: OK")

if __name__ == "__main__":
  main()
