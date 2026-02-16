import Link from "next/link";
import { notFound } from "next/navigation";
import { loadExpertTastingsByContributorId } from "@/lib/expertTastings";
import { loadReviewer } from "@/lib/reviewers";

export const metadata = {
  title: "Vault",
};

function slugFromFilename(filename: string) {
  return String(filename || "").replace(/\.json$/i, "");
}

export default async function VaultPage({
  searchParams,
}: {
  searchParams: { k?: string };
}) {
  const key = String(searchParams?.k || "");
  const expected = String(process.env.VAULT_KEY || "");

  if (!expected) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Vault</h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700 sm:text-base">
            VAULT_KEY is not set. Add VAULT_KEY to your environment (local and Vercel) to enable this page.
          </p>
        </section>
      </main>
    );
  }

  if (!key || key !== expected) notFound();

  const ids = ["private-contributor", "david-reid"];

  const blocks = await Promise.all(
    ids.map(async (id) => {
      const reviewer = await loadReviewer(id);
      const tastings = await loadExpertTastingsByContributorId(id);
      return { id, reviewer, tastings };
    }),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Vault</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 sm:text-base">
          Private view of selected contributors and their tastings.
        </p>
      </section>

      <section className="mt-6 space-y-6">
        {blocks.map(({ id, reviewer, tastings }) => (
          <div key={id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-lg font-semibold text-neutral-900">{reviewer.displayName}</div>
              <div className="text-sm text-neutral-600">{tastings.length} tasting(s)</div>
            </div>

            <div className="mt-2 text-sm">
              <Link
                className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                href={`/reviewers/${id}`}
              >
                Open contributor page
              </Link>
            </div>

            {tastings.length === 0 ? (
              <p className="mt-4 text-neutral-700">No expert tastings found.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {tastings.map((t: any) => {
                  const slug = slugFromFilename(t.filename);
                  return (
                    <li key={t.fileRelPath} className="rounded-xl border border-neutral-200 bg-white p-4">
                      <div className="text-sm font-semibold text-neutral-900">
                        <Link
                          className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                          href={`/tastings/${slug}`}
                        >
                          {t.whiskyLabel ?? slug}
                        </Link>
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        file: <span className="font-mono">{t.fileRelPath}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
