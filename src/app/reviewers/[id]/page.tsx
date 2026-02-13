import Link from "next/link";
import { notFound } from "next/navigation";
import { loadReviewer } from "@/lib/reviewers";
import { loadExpertTastingsByContributorId } from "@/lib/expertTastings";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const r = await loadReviewer(params.id);
    return { title: `${r.displayName} — Contributor` };
  } catch {
    return { title: "Contributor" };
  }
}

export default async function ContributorDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let contributor: any;
  try {
    contributor = await loadReviewer(id);
  } catch {
    notFound();
  }

  const tastings = await loadExpertTastingsByContributorId(id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/reviewers">
            ← Back to Contributors
          </Link>
          <span className="text-xs text-neutral-500">
            id: <span className="font-mono">{contributor.id}</span>
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{contributor.displayName}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span>{contributor.type}</span>
          <span className="text-neutral-400">·</span>
          <span>{contributor.country}</span>
          <span className="text-neutral-400">·</span>
          <span>{contributor.language}</span>
        </div>

        {contributor.bio ? <p className="mt-4 text-sm leading-relaxed text-neutral-700 sm:text-base">{contributor.bio}</p> : null}

        {Array.isArray(contributor.links) && contributor.links.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {contributor.links.map((l: any, i: number) => (
              <a
                key={`${contributor.id}-link-${i}`}
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
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Expert tastings</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Tastings linked via <span className="font-mono">contributor.id</span>.
            </p>
          </div>
          <div className="text-sm text-neutral-600">{tastings.length} tasting(s)</div>
        </div>

        {tastings.length === 0 ? (
          <p className="mt-6 text-neutral-700">No expert tastings found for this contributor yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {tastings.map((t: any) => {
              const slug = String(t.filename || "").replace(/\.json$/i, "");
              return (
                <li key={t.fileRelPath} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-base font-semibold text-neutral-900">
                      <Link
                        className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                        href={"/tastings/" + slug}
                      >
                        {t.whiskyLabel ?? t.filename}
                      </Link>
                    </div>
                    <div className="text-xs text-neutral-600">{slug}</div>
                  </div>

                  <div className="mt-2 text-sm text-neutral-600">
                    file: <span className="font-mono">{t.fileRelPath}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
