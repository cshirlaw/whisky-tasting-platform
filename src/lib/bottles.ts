import { promises as fs } from "fs";
import path from "path";

export type BottleKey = {
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

function bottleSlugFromWhisky(whisky: any): { slug: string; name: string } {
  const name =
    safeString(whisky?.name_display) ||
    safeString(whisky?.brand_or_label) ||
    safeString(whisky?.bottling_notes_label) ||
    "unknown-bottle";

  const age = safeNumber(whisky?.age_years);
  const base = slugify(name);
  const slug = age ? `${base}-${Math.round(age)}yo` : base;

  return { slug, name };
}

function tastingSlugFromFilename(filename: string): string {
  return String(filename || "").replace(/\.json$/i, "");
}

function starsFrom1to10(v: number): number {
  const clamped = Math.max(1, Math.min(10, v));
  return Math.max(1, Math.min(5, Math.round(clamped / 2)));
}

export async function loadAllBottleTastings(): Promise<BottleTasting[]> {
  const baseDir = repoRootPath("data", "tastings");
  const files = await listJsonFiles(baseDir);

  const items: BottleTasting[] = [];
  for (const full of files) {
    const raw = await fs.readFile(full, "utf-8");
    const j = JSON.parse(raw);

    const whisky = j?.whisky || {};
    const { slug: bottleSlug, name: bottleName } = bottleSlugFromWhisky(whisky);

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
  const bySlug = new Map<string, BottleTasting[]>();

  for (const t of all) {
    const arr = bySlug.get(t.bottleSlug) || [];
    arr.push(t);
    bySlug.set(t.bottleSlug, arr);
  }

  const out: BottleSummary[] = [];
  for (const [slug, arr] of bySlug.entries()) {
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

    const bottle: BottleKey = {
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

  out.sort((a, b) => (b.ratedCount - a.ratedCount) || (b.tastingCount - a.tastingCount) || a.bottle.name.localeCompare(b.bottle.name));
  return out;
}

export async function loadBottleDetail(slug: string): Promise<{ bottle: BottleKey; tastings: BottleTasting[] }> {
  const all = await loadAllBottleTastings();
  const tastings = all.filter((t) => t.bottleSlug === slug);

  if (tastings.length === 0) {
    return { bottle: { slug, name: slug }, tastings: [] };
  }

  const first = tastings[0];
  return {
    bottle: {
      slug,
      name: first.bottleName,
      category: first.category,
    },
    tastings: tastings.sort((a, b) => a.tastingSlug.localeCompare(b.tastingSlug)),
  };
}
