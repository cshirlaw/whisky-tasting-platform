import Link from "next/link";
import { listAllTastings } from "../../lib/tastings";

function tierLabel(tier: string, platform?: string | null) {
  if (tier === "expert") return platform ? `Expert (${platform})` : "Expert";
  if (tier === "consumer") return "Consumer";
  return "Other";
}

function tierRank(tier: string) {
  if (tier === "expert") return 0;
  if (tier === "consumer") return 1;
  return 2;
}

function editorialLabel(status?: string | null) {
  if (status === "approved") return "Approved";
  if (status === "reviewed") return "Reviewed";
  return "Draft";
}

export default function TastingsPage() {
  const items = listAllTastings();

  items.sort((a, b) => {
    const ta = a.tasting?.contributor?.tier || "other";
    const tb = b.tasting?.contributor?.tier || "other";
    const ra = tierRank(ta);
    const rb = tierRank(tb);
    if (ra !== rb) return ra - rb;

    const na = (a.tasting?.whisky?.name_display || "").toLowerCase();
    const nb = (b.tasting?.whisky?.name_display || "").toLowerCase();
    return na.localeCompare(nb);
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Tastings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
          Expert tastings only at this stage. This section is for internal reference.
        </p>
      </section>

      <section className="mt-6">
        <ul className="space-y-3">
          {items.map(({ slug, tasting }) => {
            const href = `/tastings/${encodeURIComponent(slug)}`;
            const tier = tasting.contributor?.tier || "other";
            const platform = tasting.contributor?.source_platform || null;
            const status = (tasting as any)?.editorial?.status || "draft";

            return (
              <li key={slug} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-base font-semibold text-neutral-900">
                    <Link
                      href={href}
                      className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                    >
                      {tasting.whisky?.name_display || slug}
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-neutral-900 shadow-sm">
                      {tierLabel(tier, platform)}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-700 shadow-sm">
                      {editorialLabel(status)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-neutral-600">
                  {tasting.contributor?.name || "Unknown contributor"}
                </div>
              </li>
            );
          })}
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
