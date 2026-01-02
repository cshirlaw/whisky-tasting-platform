import fs from "fs";
import path from "path";

export type Tasting = {
  id: string;
  type: "tasting";
  version: string;
  contributor: { name: string; tier: "expert" | "consumer" | "other"; source_platform?: string | null };
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
const DAVID_DIR = path.join(ROOT, "data", "tastings", "experts", "david-reid");

function stripJsonSuffix(name: string) {
  return name.replace(/\.json$/i, "");
}

export function listDavidReidTastings(): Array<{ slug: string; tasting: Tasting }> {
  if (!fs.existsSync(DAVID_DIR)) return [];

  const files = fs
    .readdirSync(DAVID_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const slug = stripJsonSuffix(file);
    const fullPath = path.join(DAVID_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const tasting = JSON.parse(raw) as Tasting;
    return { slug, tasting };
  });
}

export function getDavidReidTasting(slug: string): { slug: string; tasting: Tasting } | null {
  const cleanSlug = stripJsonSuffix(slug);
  const fullPath = path.join(DAVID_DIR, `${cleanSlug}.json`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf-8");
  const tasting = JSON.parse(raw) as Tasting;
  return { slug: cleanSlug, tasting };
}
