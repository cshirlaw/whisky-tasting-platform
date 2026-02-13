import { promises as fs } from "fs";
import path from "path";

export type BottleKey = {
  key: string;
  slug: string;
  name: string;
  category?: string;
  ageYears?: number | null;
  abvPercent?: number | null;
  brandOrLabel?: string;
};

export type BottleTasting = {
  tastingSlug: string;
  fileRelPath: string;
  filename: string;
  bottleName: string;
  bottleSlug: string;
  bottleKey: string;
  category?: string;
  contributorId?: string;
  contributorName?: string;
  contributorTier?: string;
  overall1to10?: number | null;
  overallStars1to5?: number | null;
};

function repoRootPath(...parts: string[]) {
  return path.join(process.cwd(), ...parts);
}

async function listJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(d: string) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".json")) {
        out.push(full);
      }
    }
  }

  await walk(dir);
  return out.sort();
}

function safeString(x: unknown): string | undefined {
  if (typeof x === "string" && x.trim()) return x.trim();
  return undefined;
}

function safeNumber(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  return null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function stripAgeWords(name: string, ageYears?: number): string {
  let out = String(name || "")
    .replace(/\b\d{1,3}\s*(?:yo|y\/o)\b/gi, "")
    .replace(/\b\d{1,3}\s*(?:yr|yrs)\b/gi, "")
    .replace(/\b\d{1,3}\s*(?:year|years)\s*(?:old)?\b/gi, "")
    .replace(/\b\d{1,3}\s*-\s*(?:year|years)\s*-\s*old\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (typeof ageYears === "number" && Number.isFinite(ageYears)) {
    const a = Math.round(ageYears);
    const reAge = new RegExp(`\\b${a}\\b(?=\\s*$|\\s*[\\)\\]\\}\\-–—,:;]|$)`, "g");
    out = out.replace(reAge, "").replace(/\s{2,}/g, " ").trim();
  }

  return out;
}

function formatAgeTitle(baseName: string, ageYears: number): string {
  const a = Math.round(ageYears);
  return `${baseName} ${a} Year Old`;
}

function bottleFromWhisky(whisky: any): { key: string; slug: string; name: string } {
  const rawName =
    safeString(whisky?.name_display) ||
    safeString(whisky?.brand_or_label) ||
    safeString(whisky?.bottling_notes_label) ||
    "Unknown Bottle";

  const age = safeNumber(whisky?.age_years);

  const baseName = stripGenericTypeWords(stripAgeWords(rawName, age ?? undefined));
  const base = slugify(baseName || rawName);

  const key = age ? `${base}-${Math.round(age)}yo` : base;
  const slug = age ? `${base}-${Math.round(age)}-year-old` : base;
  const name = age ? formatAgeTitle(baseName || rawName, age) : (baseName || rawName);

  return { key, slug, name };
}

function stripGenericTypeWords(name: string): string {
  return String(name || "")
    .replace(/\bBlended\s+Scotch\s+Whisky\b/gi, "")
    .replace(/\bBlended\s+Malt\s+Scotch\s+Whisky\b/gi, "")
    .replace(/\bSingle\s+Malt\s+Scotch\s+Whisky\b/gi, "")
    .replace(/\bScotch\s+Whisky\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function tastingSlugFromFilename(filename: string): string {
  return String(filename || "").replace(/\.json$/i, "");
}

function starsFrom1to10(v: number): number {
  const clamped = Math.max(1, Math.min(10, v));
  return Math.max(1, Math.min(5, Math.round(clamped / 2)));
}

function preferredBottleSlug(tastings: BottleTasting[]): string {
  const yearOld = tastings
    .map((t) => (typeof t.bottleSlug === "string" ? t.bottleSlug : ""))
    .filter((x) => x.endsWith("-year-old"));

  if (yearOld.length > 0) {
    yearOld.sort((a, b) => a.length - b.length || a.localeCompare(b));
    return yearOld[0];
  }

  return tastings[0]?.bottleSlug || tastings[0]?.bottleKey || "unknown-bottle";
}

export async function loadAllBottleTastings(): Promise<BottleTasting[]> {
  const baseDir = repoRootPath("data", "tastings");
  const CONSUMER_TEMPLATES_DIR = repoRootPath("data", "tastings", "consumers", "templates");
  const files = await listJsonFiles(baseDir);

  const items: BottleTasting[] = [];
  for (const full of files) {
    if (full.startsWith(CONSUMER_TEMPLATES_DIR + path.sep)) continue;
    const raw = await fs.readFile(full, "utf-8");
    const j = JSON.parse(raw);

    const whisky = j?.whisky || {};
    const { key: bottleKey, slug: bottleSlug, name: bottleName } = bottleFromWhisky(whisky);

    const contributor = j?.contributor || {};
    const contributorId = safeString(contributor?.id);
    const contributorName = safeString(contributor?.name);
    const contributorTier = safeString(contributor?.tier);

    const overall1to10 = safeNumber(j?.tasting?.score?.overall_1_10);
    const overallStars1to5 = overall1to10 ? starsFrom1to10(overall1to10) : null;

    const fileRelPath = path.relative(process.cwd(), full);
    const filename = path.basename(full);
    const tastingSlug = tastingSlugFromFilename(filename);

    items.push({
      tastingSlug,
      fileRelPath,
      filename,
      bottleName,
      bottleSlug,
      bottleKey,
      category: safeString(whisky?.category),
      contributorId,
      contributorName,
      contributorTier,
      overall1to10,
      overallStars1to5,
    });
  }

  return items;
}

export type BottleSummary = {
  bottle: BottleKey;
  tastingCount: number;
  ratedCount: number;
  avgOverall1to10: number | null;
  distStars1to5: Record<number, number>;
};

export async function loadBottleSummaries(): Promise<BottleSummary[]> {
  const all = await loadAllBottleTastings();
  const byKey = new Map<string, BottleTasting[]>();

  for (const t of all) {
    const arr = byKey.get(t.bottleKey) || [];
    arr.push(t);
    byKey.set(t.bottleKey, arr);
  }

  const out: BottleSummary[] = [];
  for (const [key, arr] of byKey.entries()) {
    const first = arr[0];

    const rated = arr.filter((x) => typeof x.overall1to10 === "number" && x.overall1to10 !== null);
    const ratedCount = rated.length;

    const avgOverall1to10 =
      ratedCount === 0 ? null : rated.reduce((a, b) => a + (b.overall1to10 as number), 0) / ratedCount;

    const distStars1to5: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rated) {
      const s = r.overallStars1to5;
      if (s && distStars1to5[s] !== undefined) distStars1to5[s] += 1;
    }

    const slug = preferredBottleSlug(arr);

    const bottle: BottleKey = {
      key,
      slug,
      name: first?.bottleName || slug,
      category: first?.category,
    };

    out.push({
      bottle,
      tastingCount: arr.length,
      ratedCount,
      avgOverall1to10,
      distStars1to5,
    });
  }

  out.sort(
    (a, b) =>
      b.ratedCount - a.ratedCount ||
      b.tastingCount - a.tastingCount ||
      a.bottle.name.localeCompare(b.bottle.name),
  );
  return out;
}

export async function loadBottleDetail(slug: string): Promise<{ bottle: BottleKey; tastings: BottleTasting[] }> {
  const all = await loadAllBottleTastings();

  const byKey = new Map<string, BottleTasting[]>();
  for (const t of all) {
    const arr = byKey.get(t.bottleKey) || [];
    arr.push(t);
    byKey.set(t.bottleKey, arr);
  }

  let key: string | null = null;

  if (byKey.has(slug)) key = slug;

  if (!key) {
    for (const [k, arr] of byKey.entries()) {
      if (arr.some((t) => t.bottleSlug === slug)) {
        key = k;
        break;
      }
    }
  }

  if (!key) {
    return { bottle: { key: slug, slug, name: slug }, tastings: [] };
  }

  const tastings = byKey.get(key) || [];
  if (tastings.length === 0) {
    return { bottle: { key, slug, name: slug }, tastings: [] };
  }

  const first = tastings[0];
  const preferredSlug = preferredBottleSlug(tastings);

  return {
    bottle: {
      key,
      slug: preferredSlug,
      name: first.bottleName,
      category: first.category,
    },
    tastings: tastings.sort((a, b) => a.tastingSlug.localeCompare(b.tastingSlug)),
  };
}
