import fs from "fs";
import path from "path";

type BottlerRow = { id: string; name: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJsonFile(p: string) {
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw);
}

// Supports either:
// { bottlers: [{id,name,...}] }  OR  { items: [{id,name,...}] }
export function loadBottlers(): BottlerRow[] {
  const p = path.join(process.cwd(), "data", "lookups", "bottlers.json");
  if (!fs.existsSync(p)) return [];

  const j = readJsonFile(p);

  const arr =
    (Array.isArray(j?.bottlers) && j.bottlers) ||
    (Array.isArray(j?.items) && j.items) ||
    [];

  return arr
    .map((x: any) => ({
      id: String(x.id ?? "").trim(),
      name: String(x.name ?? "").trim()
    }))
    .filter((x: BottlerRow) => x.id && x.name);
}

export function resolveBottlerName(input: string | null | undefined): string | null {
  if (!input) return null;

  const s = String(input).trim();
  if (!s) return null;

  const bottlers = loadBottlers();
  if (!bottlers.length) return s;

  const key = slugify(s);

  // match by id
  const byId = bottlers.find((b) => b.id === key || b.id === s);
  if (byId) return byId.name;

  // match by name slug
  const byName = bottlers.find((b) => slugify(b.name) === key);
  if (byName) return byName.name;

  // fall back to raw string
  return s;
}
