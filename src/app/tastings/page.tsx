import Link from "next/link";
import { listAllTastings } from "../../lib/tastings";

function tierLabel(tier: string, sourcePlatform?: string | null) {
  if (tier === "expert") return sourcePlatform ? `Expert (${sourcePlatform})` : "Expert";
  if (tier === "consumer") return "Consumer";
  return "Other";
}

function tierRank(tier: string) {
  if (tier === "expert") return 0;
  if (tier === "consumer") return 1;
  return 2;
}

function sortItems(items: Array<{ slug: string; tasting: any; origin: string }>) {
  return items.sort((a, b) => {
    const ta = a.tasting?.contributor?.tier || "other";
    const tb = b.tasting?.contributor?.tier || "other";
    const ra = tierRank(ta);
    const rb = tierRank(tb);
    if (ra !== rb) return ra - rb;

    const na = (a.tasting?.whisky?.name_display || "").toLowerCase();
    const nb = (b.tasting?.whisky?.name_display || "").toLowerCase();
    return na.localeCompare(nb);
  });
}

function Section({
  title,
  items
}: {
  title: string;
  items: Array<{ slug: string; tasting: any; origin: string }>;
}) {
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>{title}</h2>

      {items.length === 0 ? (
        <p>(None yet.)</p>
      ) : (
        <ul>
          {items.map(({ slug, tasting }) => {
            const name = tasting?.whisky?.name_display || "Untitled tasting";
            const contributorName = tasting?.contributor?.name || "Unknown";
            const tier = tasting?.contributor?.tier || "other";
            const sourcePlatform = tasting?.contributor?.source_platform || null;

            return (
              <li key={slug} style={{ marginBottom: "0.75rem" }}>
                <div>
                  <Link href={`/tastings/${slug}`}>{name}</Link>
                </div>

                <div style={{ marginTop: "0.15rem" }}>
                  {contributorName}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.1rem 0.45rem",
                      border: "1px solid #ccc",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      marginLeft: "0.5rem"
                    }}
                  >
                    {tierLabel(tier, sourcePlatform)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function TastingsPage() {
  const all = sortItems(listAllTastings());

  const experts = all.filter((x) => (x.tasting?.contributor?.tier || "other") === "expert");
  const consumers = all.filter((x) => (x.tasting?.contributor?.tier || "other") === "consumer");
  const other = all.filter((x) => {
    const t = x.tasting?.contributor?.tier || "other";
    return t !== "expert" && t !== "consumer";
  });

  return (
    <main>
      <h1>Whisky Tasting Platform</h1>

      <nav style={{ marginBottom: "1rem" }}>
        <Link href="/">Home</Link>
      </nav>

      <h1>Tastings</h1>

      <Section title="Experts" items={experts} />
      <Section title="Consumers" items={consumers} />

      {other.length > 0 ? <Section title="Other" items={other} /> : null}

      <hr style={{ marginTop: "2rem" }} />
      <p>Built for archive and comparison. Trial content only at this stage.</p>
    </main>
  );
}
