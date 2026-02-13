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
    <main style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Tastings</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Expert tastings only at this stage. This section is for internal reference.
      </p>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1.25rem" }}>
        {items.map(({ slug, tasting }) => {
          const href = `/tastings/${encodeURIComponent(slug)}`;
          const tier = tasting.contributor?.tier || "other";
          const platform = tasting.contributor?.source_platform || null;
          const status = (tasting as any)?.editorial?.status || "draft";

          return (
            <li key={slug} style={{ padding: "0.9rem 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "baseline" }}>
                <Link href={href} style={{ fontSize: "1.05rem", textDecoration: "none" }}>
                  {tasting.whisky?.name_display || slug}
                </Link>

                <span style={{ padding: "0.12rem 0.5rem", border: "1px solid #ccc", borderRadius: 999, fontSize: "0.78rem" }}>
                  {tierLabel(tier, platform)}
                </span>

                <span style={{ padding: "0.12rem 0.5rem", border: "1px solid #ddd", borderRadius: 999, fontSize: "0.78rem", color: "#444" }}>
                  {editorialLabel(status)}
                </span>
              </div>

              <div style={{ color: "#666", fontSize: "0.92rem", marginTop: "0.35rem" }}>
                {tasting.contributor?.name || "Unknown contributor"}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
