import { listDavidReidTastings } from "@/lib/tastings";

export default function TastingsPage() {
  const items = listDavidReidTastings();

  return (
    <main className="prose max-w-none">
      <h1>Tastings</h1>
      <p>Trial content (David Reid) used to prove structure.</p>

      <ul>
        {items.map(({ slug, tasting }) => (
          <li key={slug}>
            <a href={`/tastings/${slug}`}>{tasting.whisky.name_display}</a>
            <div className="text-sm text-slate-600">
              {tasting.contributor.name}
              {tasting.whisky.region ? ` · ${tasting.whisky.region}` : ""}
              {tasting.whisky.age_years !== null && tasting.whisky.age_years !== undefined
                ? ` · ${tasting.whisky.age_years}yo`
                : ""}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
