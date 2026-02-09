import Link from "next/link";
import { notFound } from "next/navigation";
import { loadBottleDetail } from "@/lib/bottles";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { bottle, tastings } = await loadBottleDetail(params.slug);
  if (!tastings.length) return { title: "Bottle" };
  return { title: `${bottle.name} — Bottle` };
}

export default async function BottleDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { stars?: string };
}) {
  const { bottle, tastings } = await loadBottleDetail(params.slug);
  if (!tastings.length) notFound();

  const starsFilter = searchParams?.stars ? Number(searchParams.stars) : null;
  const stars = starsFilter && Number.isFinite(starsFilter) ? Math.max(1, Math.min(5, starsFilter)) : null;

  const rated = tastings.filter((t) => typeof t.overallStars1to5 === "number" && t.overallStars1to5 !== null);
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rated) {
    const s = r.overallStars1to5 as number;
    if (dist[s] !== undefined) dist[s] += 1;
  }

  const visible = stars ? tastings.filter((t) => t.overallStars1to5 === stars) : tastings;

  const avg10 =
    rated.length === 0
      ? null
      : rated.reduce((a, b) => a + (b.overall1to10 as number), 0) / rated.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{bottle.name}</h1>
        <div className="text-sm text-neutral-600">
          {bottle.category ? <span>{bottle.category} · </span> : null}
          {tastings.length} tasting(s)
          {avg10 !== null ? <span> · avg {avg10.toFixed(1)}/10</span> : null}
        </div>

        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Ratings</div>
          <div className="mt-2 text-sm text-neutral-700">
            Filter by stars:
            <span className="ml-2 flex flex-wrap gap-2">
              <Link className="underline underline-offset-4" href={"/bottles/" + bottle.slug}>
                All
              </Link>
              {[5, 4, 3, 2, 1].map((s) => (
                <Link
                  key={s}
                  className="underline underline-offset-4"
                  href={"/bottles/" + bottle.slug + "?stars=" + s}
                >
                  {s}★ ({dist[s]})
                </Link>
              ))}
            </span>
          </div>
          {stars ? (
            <div className="mt-3 text-xs text-neutral-600">
              Showing only {stars}★ reviews (derived from overall_1_10 where present).
            </div>
          ) : (
            <div className="mt-3 text-xs text-neutral-600">
              Stars are derived from consumer overall_1_10 when present. Expert scores may be blank for now.
            </div>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>

        {visible.length === 0 ? (
          <p className="mt-6 text-neutral-700">No reviews match that filter yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {visible.map((t) => (
              <li key={t.fileRelPath} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-base font-semibold">
                    <Link className="underline underline-offset-4" href={"/tastings/" + t.tastingSlug}>
                      {t.tastingSlug}
                    </Link>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {t.overall1to10 !== null ? <span>{t.overall1to10}/10 · </span> : null}
                    {t.contributorTier ? <span>{t.contributorTier} · </span> : null}
                    {t.contributorId ? (
                      <Link className="underline underline-offset-4" href={"/reviewers/" + t.contributorId}>
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
        <Link className="underline underline-offset-4" href="/bottles">
          Back to Bottles
        </Link>
      </div>
    </main>
  );
}
