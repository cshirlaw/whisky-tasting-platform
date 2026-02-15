import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { loadReviewer } from "@/lib/reviewers";
import { loadAllBottleTastings } from "@/lib/bottles";

function isoDateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeString(x: unknown): string | null {
  if (typeof x === "string") {
    const t = x.trim();
    return t ? t : null;
  }
  return null;
}

function safeNumber(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  return null;
}

function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function requireAdmin(req: Request): { ok: true } | { ok: false; res: Response } {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return { ok: false, res: NextResponse.json({ error: "ADMIN_TOKEN not set" }, { status: 500 }) };
  }
  const h = req.headers.get("x-admin-token");
  if (!h || h !== token) {
    return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true };
}

type Normalized = {
  reviewerId: string;
  reviewerName: string | null;
  bottleKey: string;
  bottleNameDisplay: string | null;
  bottleCategory: string | null;
  tastedDate: string;
  served: "Neat" | "With water" | "Highball" | "Cocktail" | "Other";
  overall1to10: number;
  wouldBuyAgain: boolean;
  summary: string | null;
  permission: { status: "approved" | "pending" | "unknown"; note: string | null };
};

function normalizePayload(x: any): { ok: true; v: Normalized } | { ok: false; msg: string } {
  const servedRaw = safeString(x?.served);
  const served =
    servedRaw === "Neat" ||
    servedRaw === "With water" ||
    servedRaw === "Highball" ||
    servedRaw === "Cocktail" ||
    servedRaw === "Other"
      ? (servedRaw as Normalized["served"])
      : "Neat";

  const permissionStatusRaw = safeString(x?.permission?.status);
  const permissionStatus =
    permissionStatusRaw === "approved" || permissionStatusRaw === "pending" || permissionStatusRaw === "unknown"
      ? (permissionStatusRaw as Normalized["permission"]["status"])
      : "unknown";
  const permissionNote = safeString(x?.permission?.note);

  if (safeString(x?.type) === "review" && safeString(x?.tier) === "consumer") {
    const reviewerId = safeString(x?.reviewer_id);
    const bottleKey = safeString(x?.bottle_key);
    const tastedDate = safeString(x?.tasted_date);
    const overall = safeNumber(x?.overall_1_10);
    const rebuy = typeof x?.rebuy === "boolean" ? x.rebuy : false;
    const note = safeString(x?.note);

    if (!reviewerId) return { ok: false, msg: "Missing reviewer_id" };
    if (!bottleKey) return { ok: false, msg: "Missing bottle_key" };
    if (!tastedDate) return { ok: false, msg: "Missing tasted_date" };
    if (overall === null) return { ok: false, msg: "Missing overall_1_10" };

    return {
      ok: true,
      v: {
        reviewerId,
        reviewerName: null,
        bottleKey,
        bottleNameDisplay: null,
        bottleCategory: null,
        tastedDate,
        served,
        overall1to10: clampInt(overall, 1, 10),
        wouldBuyAgain: rebuy,
        summary: note ?? null,
        permission: { status: permissionStatus, note: permissionNote ?? null },
      },
    };
  }

  const reviewerId = safeString(x?.reviewer?.id);
  const reviewerName = safeString(x?.reviewer?.name);
  const bottleKey = safeString(x?.bottle?.key);
  const bottleName = safeString(x?.bottle?.name_display);
  const bottleCategory = safeString(x?.bottle?.category);
  const tastedDate = safeString(x?.tasted_date);
  const overall = safeNumber(x?.overall_1_10);

  if (!reviewerId || !reviewerName) return { ok: false, msg: "Missing reviewer.id or reviewer.name" };
  if (!bottleKey || !bottleName || !bottleCategory) return { ok: false, msg: "Missing bottle fields" };
  if (!tastedDate) return { ok: false, msg: "Missing tasted_date" };
  if (overall === null) return { ok: false, msg: "Missing overall_1_10" };

  const wouldBuyAgain = typeof x?.would_buy_again === "boolean" ? x.would_buy_again : false;
  const summary = safeString(x?.summary);

  return {
    ok: true,
    v: {
      reviewerId,
      reviewerName,
      bottleKey,
      bottleNameDisplay: bottleName,
      bottleCategory,
      tastedDate,
      served,
      overall1to10: clampInt(overall, 1, 10),
      wouldBuyAgain,
      summary: summary ?? null,
      permission: { status: permissionStatus, note: permissionNote ?? null },
    },
  };
}

function makeFilename(bottleKey: string, tastedDate: string, seq: number) {
  const safeDate = tastedDate.replace(/[^0-9-]/g, "").slice(0, 10) || isoDateOnly(new Date());
  const n = String(seq).padStart(3, "0");
  return `${bottleKey}-consumer-${safeDate}-${n}.json`;
}

async function nextSequence(dir: string, bottleKey: string, tastedDate: string) {
  const safeDate = tastedDate.replace(/[^0-9-]/g, "").slice(0, 10) || isoDateOnly(new Date());
  const prefix = `${bottleKey}-consumer-${safeDate}-`;
  try {
    const files = await fs.readdir(dir);
    const nums = files
      .filter((f) => f.startsWith(prefix) && f.toLowerCase().endsWith(".json"))
      .map((f) => {
        const m = f.match(/-(\d{3})\.json$/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => Number.isFinite(n) && n > 0);
    const max = nums.length ? Math.max(...nums) : 0;
    return max + 1;
  } catch {
    return 1;
  }
}

async function resolveReviewerName(reviewerId: string): Promise<string> {
  try {
    const r: any = await loadReviewer(reviewerId);
    const n = safeString(r?.name);
    if (n) return n;
  } catch {}
  return reviewerId;
}

async function resolveBottleMeta(bottleKey: string): Promise<{ name_display: string; category: string }> {
  try {
    const all = await loadAllBottleTastings();
    const hit = all.find((t) => t?.bottleKey === bottleKey);
    const name = safeString(hit?.bottleName);
    const cat = safeString(hit?.category);
    if (name && cat) return { name_display: name, category: cat };
    if (name) return { name_display: name, category: cat ?? "Blended Scotch Whisky" };
  } catch {}
  return { name_display: bottleKey, category: "Blended Scotch Whisky" };
}

export async function POST(req: Request) {
  const gate = requireAdmin(req);
  if (!gate.ok) return gate.res;

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const norm = normalizePayload(payload);
  if (!norm.ok) return NextResponse.json({ error: norm.msg }, { status: 400 });

  const v = norm.v;

  const reviewerName = v.reviewerName ?? (await resolveReviewerName(v.reviewerId));
  const bottleMeta =
    v.bottleNameDisplay && v.bottleCategory
      ? { name_display: v.bottleNameDisplay, category: v.bottleCategory }
      : await resolveBottleMeta(v.bottleKey);

  const ROOT = process.cwd();
  const outDir = path.join(ROOT, "data", "tastings", "consumers", v.reviewerId);
  await fs.mkdir(outDir, { recursive: true });

  const seq = await nextSequence(outDir, v.bottleKey, v.tastedDate);
  const filename = makeFilename(v.bottleKey, v.tastedDate, seq);
  const fullPath = path.join(outDir, filename);

  const tasting = {
    id: `${v.reviewerId}:${filename.replace(/\.json$/i, "")}`,
    type: "tasting",
    version: "1.0",
    contributor: {
      id: v.reviewerId,
      name: reviewerName,
      tier: "consumer",
      source_platform: null,
    },
    dates: { post_date: null, tasted_date: v.tastedDate, note: null },
    whisky: {
      name_display: bottleMeta.name_display,
      category: bottleMeta.category,
      style: bottleMeta.category,
      region: null,
      distillery: null,
      brand_or_label: null,
      series: null,
      age_years: null,
      abv_percent: null,
      cask_type: null,
      cask_number: null,
      bottle_count: null,
      bottling_notes_label: null,
    },
    tasting: {
      summary: v.summary ?? null,
      notes: { nose: [], palate: [], finish: [], overall: [] },
      score: null,
      comparisons: [],
    },
    consumer_scoring: {
      overall_1_10: v.overall1to10,
      served: v.served ?? "Neat",
      would_buy_again: v.wouldBuyAgain ?? false,
    },
    source: {
      platform: null,
      post_url: null,
      original_text: null,
      assets: [],
      permission: { status: v.permission.status, note: v.permission.note },
    },
    tags: null,
  };

  await fs.writeFile(fullPath, JSON.stringify(tasting, null, 2) + "\n", "utf8");

  return NextResponse.json(
    {
      ok: true,
      written: path.relative(ROOT, fullPath),
      slug: `consumer:${encodeURIComponent(reviewerName)}:${filename.replace(/\.json$/i, "")}`,
    },
    { status: 201 },
  );
}
