import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import StarFilter from "@/components/StarFilter";
import { loadBottleDetail, type BottleTasting } from "@/lib/bottles";
import fs from "fs";
import path from "path";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { bottle, tastings } = await loadBottleDetail(params.slug);
  if (!tastings.length) return { title: "Bottle" };
  return { title: `${bottle.name} — Bottle` };
}

function starsTextFrom10(v: number): { stars: string; stars5: number } {
  const clamped10 = Math.max(1, Math.min(10, v));
  const s5 = Math.max(1, Math.min(5, Math.round(clamped10 / 2)));
  const filled = "★".repeat(s5);
  const empty = "☆".repeat(5 - s5);
  return { stars: filled + empty, stars5: s5 };
}

function tierOf(t: BottleTasting): "expert" | "consumer" | "other" {
  const raw = String(t?.contributorTier || "").toLowerCase();
  if (raw.includes("expert")) return "expert";
  if (raw.includes("consumer")) return "consumer";
  return "other";
}

function findBottleImageSrc(slug: string, bottleKey?: string | null): string | null {
  const thumbsDir = path.join(process.cwd(), "public", "bottles", "thumbs");
  const baseDir = path.join(process.cwd(), "public", "bottles");
  const exts = ["jpg", "jpeg", "png", "webp", "avif"];

  const variants = new Set<string>();
  const add = (v?: string | null) => {
    if (!v) return;
    const x = String(v).trim();
    if (x) variants.add(x);
  };

  add(slug);
  add(bottleKey);

  // Common mismatch: "-10-year-old" (slug) vs "-10yo" (filename)
  add(slug.replace(/-(\d+)-year-old\b/g, "-$1yo"));
  add(slug.replace(/-year-old\b/g, "-yo"));

  const keys = Array.from(variants);

  for (const key of keys) {
    for (const ext of exts) {
      const f = `${key}.${ext}`;

      const fullThumb = path.join(thumbsDir, f);
      if (fs.existsSync(fullThumb)) return `/bottles/thumbs/${f}`;

      const fullBase = path.join(baseDir, f);
      if (fs.existsSync(fullBase)) return `/bottles/${f}`;
    }
  }

  return null;
}



export default async function BottleDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { stars?: string };
}) {
  const { bottle, tastings } = await loadBottleDetail(params.slug);
  const starsFilter = searchParams?.stars ? Number(searchParams.stars) : null;
  const stars = starsFilter && Number.isFinite(starsFilter) ? Math.max(1, Math.min(5, starsFilter)) : null;

  const rated = tastings.filter((t) => typeof t.overallStars1to5 === "number" && t.overallStars1to5 !== null);

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rated) {
    const s = r.overallStars1to5 as number;
    if (dist[s] !== undefined) dist[s] += 1;
  }

  const visible = stars ? tastings.filter((t) => t.overallStars1to5 === stars) : tastings;

  const tierRank = (t: BottleTasting) => {
    const k = tierOf(t);
    if (k === "expert") return 0;
    if (k === "consumer") return 1;
    return 2;
  };

  const visibleSorted = visible
    .map((t, i) => ({ t, i }))
    .sort((a, b) => tierRank(a.t) - tierRank(b.t) || a.i - b.i)
    .map((x) => x.t);

  const expertRated10 = tastings
    .filter((t) => tierOf(t) === "expert")
    .map((t) => t.overall1to10)
    .filter((v): v is number => typeof v === "number" && v !== null);

  const consumerRated10 = tastings
    .filter((t) => tierOf(t) === "consumer")
    .map((t) => t.overall1to10)
    .filter((v): v is number => typeof v === "number" && v !== null);

  const expertAvg10 =
    expertRated10.length === 0 ? null : expertRated10.reduce((a, b) => a + b, 0) / expertRated10.length;

  const consumerAvg10 =
    consumerRated10.length === 0 ? null : consumerRated10.reduce((a, b) => a + b, 0) / consumerRated10.length;

  const expertStars = expertAvg10 === null ? null : starsTextFrom10(expertAvg10);
  const consumerStars = consumerAvg10 === null ? null : starsTextFrom10(consumerAvg10);

  const bottleKey = (bottle as any)?.bottleKey ?? (bottle as any)?.bottle_key ?? (bottle as any)?.key ?? null;
  const imgSrc = findBottleImageSrc(bottle.slug, bottleKey);
return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
          <div className="w-full">
            {imgSrc ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                <Image
                  src={imgSrc}
                  alt={bottle.name}
                  width={800}
                  height={1000}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                No image yet
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{bottle.name}</h1>
              <div className="mt-1 text-sm text-neutral-600">
                {bottle.category ? <span>{bottle.category} · </span> : null}
                {tastings.length ? `${tastings.length} tasting(s)` : "0 tastings yet · Be the first to review."}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {expertStars ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs font-semibold text-neutral-600">Expert view</div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <div className="text-lg font-semibold text-neutral-900">{expertStars.stars}</div>
                    <div className="text-sm font-semibold text-neutral-900">{expertAvg10!.toFixed(1)}/10</div>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">{expertRated10.length} expert tasting(s)</div>
                </div>
              ) : null}

              {consumerStars ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs font-semibold text-neutral-600">Consumer view</div>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <div className="text-base font-semibold text-neutral-800">{consumerStars.stars}</div>
                    <div className="text-sm font-semibold text-neutral-800">{consumerAvg10!.toFixed(1)}/10</div>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">{consumerRated10.length} consumer tasting(s)</div>
                </div>
              ) : null}
            </div>

            <div className="text-xs text-neutral-600">
              Stars are whole-star equivalents derived from overall_1_10 where present.
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-sm font-semibold">Ratings</div>
        <div className="mt-3">
          <StarFilter baseHref={"/bottles/" + bottle.slug} activeStars={stars} counts={dist} />
        </div>
        {stars ? (
          <div className="mt-3 text-xs text-neutral-600">
            Showing only {stars}★ tastings (derived from overall_1_10 where present).
          </div>
        ) : (
          <div className="mt-3 text-xs text-neutral-600">
            Filter shows stars derived from consumer overall_1_10 when present. Expert scores may be blank for now.
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Tastings</h2>

        {visibleSorted.length === 0 ? (
          <p className="mt-6 text-neutral-700">No tastings match that filter yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {visibleSorted.map((t) => (
              <li key={t.fileRelPath} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-base font-semibold text-neutral-900">
                    <Link
                      className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                      href={"/tastings/" + t.tastingSlug}
                    >
                      {t.tastingSlug}
                    </Link>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {t.overall1to10 !== null ? <span>{t.overall1to10}/10 · </span> : null}
                    {t.contributorTier ? <span>{t.contributorTier} · </span> : null}
                    {t.contributorId ? (
                      <Link
                        className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                        href={"/reviewers/" + t.contributorId}
                      >
                        {t.contributorName || t.contributorId}
                      </Link>
                    ) : (
                      <span>{t.contributorName || "Contributor"}</span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-sm text-neutral-600">
                  file: <span className="font-mono">{t.fileRelPath}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/bottles">
          Back to Bottles
        </Link>
      </div>
    </main>
  );
}
