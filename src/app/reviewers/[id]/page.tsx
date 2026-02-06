import { notFound } from "next/navigation";
import { loadReviewer } from "@/lib/reviewers";
import { loadExpertTastingsByContributorId } from "@/lib/expertTastings";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const r = await loadReviewer(params.id);
    return { title: `${r.displayName} — Reviewer` };
  } catch {
    return { title: "Reviewer" };
  }
}

export default async function ReviewerDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;

  let reviewer;
  try {
    reviewer = await loadReviewer(id);
  } catch {
    notFound();
  }

  const tastings = await loadExpertTastingsByContributorId(id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{reviewer.displayName}</h1>
        <div className="text-sm text-neutral-600">
          {reviewer.type} · {reviewer.country} · {reviewer.language} · <span className="font-mono">{reviewer.id}</span>
        </div>
        {reviewer.bio ? <p className="mt-2 text-neutral-700">{reviewer.bio}</p> : null}
      </div>

      {Array.isArray(reviewer.links) && reviewer.links.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {reviewer.links.map((l, i) => (
            <a
              key={`${reviewer.id}-link-${i}`}
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

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Expert tastings</h2>
        <p className="mt-2 text-neutral-600">
          Tastings linked via <span className="font-mono">contributor.id</span>.
        </p>

        {tastings.length === 0 ? (
          <p className="mt-6 text-neutral-700">No expert tastings found for this reviewer yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {tastings.map((t) => (
              <li key={t.fileRelPath} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="text-base font-semibold">{t.whiskyLabel ?? t.filename}</div>
                <div className="mt-1 text-sm text-neutral-600">
                  file: <span className="font-mono">{t.fileRelPath}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
