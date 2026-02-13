import Link from "next/link";
import { loadAllReviewers } from "@/lib/reviewers";

export const metadata = {
  title: "Contributors",
};

export default async function ContributorsPage() {
  const reviewers = await loadAllReviewers();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Contributors</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
          Expert contributors whose tastings are structured in the platform.
        </p>
      </section>

      <section className="mt-6">
        <ul className="space-y-3">
          {reviewers.map((r) => (
            <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <Link
                    className="text-lg font-semibold underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                    href={`/reviewers/${r.id}`}
                  >
                    {r.displayName}
                  </Link>
                  <div className="mt-1 text-sm text-neutral-600">
                    {r.type} · {r.country} · {r.language}
                  </div>
                </div>
                <div className="text-sm text-neutral-500">
                  id: <span className="font-mono">{r.id}</span>
                </div>
              </div>

              {r.bio ? <p className="mt-3 text-sm leading-relaxed text-neutral-700 sm:text-base">{r.bio}</p> : null}

              {Array.isArray(r.links) && r.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.links.map((l, i) => (
                    <a
                      key={`${r.id}-link-${i}`}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
