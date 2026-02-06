import Link from "next/link";
import { loadAllReviewers } from "@/lib/reviewers";

export const metadata = {
  title: "Reviewers",
};

export default async function ReviewersPage() {
  const reviewers = await loadAllReviewers();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Reviewers</h1>
      <p className="mt-2 text-neutral-600">
        Expert reviewers and contributors whose tastings are structured in the platform.
      </p>

      <ul className="mt-8 space-y-3">
        {reviewers.map((r) => (
          <li key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <Link className="text-lg font-semibold underline underline-offset-4" href={`/reviewers/${r.id}`}>
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

            {r.bio ? <p className="mt-3 text-neutral-700">{r.bio}</p> : null}

            {Array.isArray(r.links) && r.links.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.links.map((l, i) => (
                  <a
                    key={`${r.id}-link-${i}`}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm underline underline-offset-4"
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
    </main>
  );
}
