import fs from "fs";
import path from "path";

export type Tasting = {
  id: string;
  type: "tasting";
  version: string;
  contributor: {
    name: string;
    tier: "expert" | "consumer" | "other";
    source_platform?: string | null;
  };
  dates: { post_date: string | null; tasted_date: string | null; note?: string | null };
  whisky: {
    name_display: string;
    category: string;
    style: string;
    region?: string | null;
    distillery?: string | null;
    brand_or_label?: string | null;
    series?: string | null;
    age_years?: number | null;
    abv_percent?: number | null;
    cask_type?: string | null;
    cask_number?: string | null;
    bottle_count?: number | null;
    bottling_notes_label?: string | null;
  };
  tasting: {
    summary: string | null;
    notes: { nose: string[]; palate: string[]; finish: string[]; overall: string[] };
    score: number | null;
    comparisons: string[];
  };
  context?: any;
  source: {
    platform: string | null;
    post_url: string | null;
    original_text: string | null;
    assets: Array<{ kind: string; path: string; note?: string | null }>;
    permission: { status: "approved" | "pending" | "unknown"; note?: string | null };
  };
  tags?: string[] | null;
};

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "data", "tastings");
const EXPERTS_ROOT = path.join(DATA_ROOT, "experts");
const CONSUMERS_ROOT = path.join(DATA_ROOT, "consumers");

function stripJsonSuffix(name: string) {
  return name.replace(/\.json$/i, "");
}

function safeReadJson(fullPath: string): Tasting | null {
  try {
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw) as Tasting;
  } catch {
    return null;
  }
}

function makeGlobalSlug(t: Tasting, fileSlug: string) {
  const tier = t?.contributor?.tier || "other";
  const name = t?.contributor?.name || "Unknown";
  return `${tier}:${name}:${fileSlug}`;
}

function parseGlobalSlug(slug: string): { tier?: string; name?: string; fileSlug: string } {
  const parts = slug.split(":");
  if (parts.length >= 3) {
    const tier = parts[0];
    const name = parts.slice(1, parts.length - 1).join(":");
    const fileSlug = parts[parts.length - 1];
    return { tier, name, fileSlug };
  }
  return { fileSlug: slug };
}

export function listAllTastings(): Array<{ slug: string; tasting: Tasting; origin: string }> {
  const out: Array<{ slug: string; tasting: Tasting; origin: string }> = [];

  if (!fs.existsSync(EXPERTS_ROOT) && !fs.existsSync(CONSUMERS_ROOT)) return out;

  const expertDirs = fs
    .readdirSync(EXPERTS_ROOT)
    .map((d) => path.join(EXPERTS_ROOT, d))
    .filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory())
    .sort((a, b) => a.localeCompare(b));

  const consumerDirs = fs.existsSync(CONSUMERS_ROOT)
    ? fs
        .readdirSync(CONSUMERS_ROOT)
        .map((d) => path.join(CONSUMERS_ROOT, d))
        .filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory())
        .sort((a, b) => a.localeCompare(b))
    : [];

  for (const dir of expertDirs) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const fileSlug = stripJsonSuffix(file);
      const fullPath = path.join(dir, file);
      const tasting = safeReadJson(fullPath);
      if (!tasting) continue;

      out.push({
        slug: makeGlobalSlug(tasting, fileSlug),
        tasting,
        origin: dir
      });
    }
  }

  for (const dir of consumerDirs) {
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.json')).sort();
    for (const file of files) {
      const fileSlug = file.replace(/\.json$/i, '');
      const fullPath = path.join(dir, file);
      const tasting = safeReadJson(fullPath);
      if (!tasting) continue;
      out.push({ slug: makeGlobalSlug(tasting, fileSlug), tasting, origin: dir });
    }
  }

  return out;
}

export function getTastingBySlug(slug: string): { slug: string; tasting: Tasting; origin: string } | null {
  let decoded = slug;
try { decoded = decodeURIComponent(slug); } catch { decoded = slug; }
  const { name, fileSlug } = parseGlobalSlug(decoded);

  // First: if it is a global slug, try to find an exact match by contributor name + filename
  if (name && fs.existsSync(EXPERTS_ROOT)) {
    const expertDirs = fs
      .readdirSync(EXPERTS_ROOT)
      .map((d) => path.join(EXPERTS_ROOT, d))
      .filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

    for (const dir of expertDirs) {
      const fullPath = path.join(dir, `${fileSlug}.json`);
      if (!fs.existsSync(fullPath)) continue;

      const tasting = safeReadJson(fullPath);
      if (!tasting) continue;
      if ((tasting.contributor?.name || "") === name) {
        return { slug: decoded, tasting, origin: dir };
      }
    }
  }

  // Fallback: if someone hits /tastings/<fileSlug> directly, try to find it anywhere under experts
  if (fs.existsSync(EXPERTS_ROOT)) {
    const expertDirs = fs
      .readdirSync(EXPERTS_ROOT)
      .map((d) => path.join(EXPERTS_ROOT, d))
      .filter((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

    for (const dir of expertDirs) {
      const fullPath = path.join(dir, `${fileSlug}.json`);
      if (!fs.existsSync(fullPath)) continue;

      const tasting = safeReadJson(fullPath);
      if (!tasting) continue;

      return { slug: makeGlobalSlug(tasting, fileSlug), tasting, origin: dir };
    }
  }

  if (fs.existsSync(CONSUMERS_ROOT)) {
    const dirs = fs.readdirSync(CONSUMERS_ROOT).map(d => path.join(CONSUMERS_ROOT, d)).filter(p => fs.statSync(p).isDirectory());
    for (const dir of dirs) {
      const fullPath = path.join(dir, `${fileSlug}.json`);
      if (!fs.existsSync(fullPath)) continue;
      const tasting = safeReadJson(fullPath);
      if (tasting) return { slug: makeGlobalSlug(tasting, fileSlug), tasting, origin: dir };
    }
  }

  return null;
}

/* Backward-compatible wrappers (keep old code working if referenced elsewhere) */
const DAVID_DIR = path.join(EXPERTS_ROOT, "david-reid");

export function listDavidReidTastings(): Array<{ slug: string; tasting: Tasting }> {
  if (!fs.existsSync(DAVID_DIR)) return [];

  const files = fs
    .readdirSync(DAVID_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files
    .map((file) => {
      const fileSlug = stripJsonSuffix(file);
      const fullPath = path.join(DAVID_DIR, file);
      const tasting = safeReadJson(fullPath);
      if (!tasting) return null;
      return { slug: fileSlug, tasting };
    })
    .filter(Boolean) as Array<{ slug: string; tasting: Tasting }>;
}

export function getDavidReidTasting(slug: string): { slug: string; tasting: Tasting } | null {
  const cleanSlug = stripJsonSuffix(slug);
  const fullPath = path.join(DAVID_DIR, `${cleanSlug}.json`);
  if (!fs.existsSync(fullPath)) return null;

  const tasting = safeReadJson(fullPath);
  if (!tasting) return null;
  return { slug: cleanSlug, tasting };
}
