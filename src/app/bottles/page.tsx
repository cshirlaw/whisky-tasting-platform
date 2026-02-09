import Link from "next/link";
import { loadBottleSummaries } from "@/lib/bottles";

export const metadata = {
  title: "Bottles — Whisky Tasting Platform",
};

export default async function BottlesIndexPage() {
  const items = await loadBottleSummaries();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Bottles</h1>
      <p className="mt-2 text-sm text-neutral-600">
        One page per bottle, aggregating tastings across reviewers and consumers.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-neutral-700">No bottles found yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((b) => (
            <li key={b.bottle.slug} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-base font-semibold">
                  <Link className="underline underline-offset-4" href={"/bottles/" + b.bottle.slug}>
                    {b.bottle.name}
                  </Link>
                </div>
                <div className="text-xs text-neutral-600">
                  {b.bottle.category ? <span>{b.bottle.category} · </span> : null}
                  {b.tastingCount} tasting(s)
                  {b.ratedCount ? <span> · {b.ratedCount} rated</span> : null}
                  {b.avgOverall1to10 !== null ? <span> · avg {b.avgOverall1to10.toFixed(1)}/10</span> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
