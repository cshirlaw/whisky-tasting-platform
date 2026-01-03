import Link from "next/link";
import { listDavidReidTastings } from "@/lib/tastings";

export default function TastingsPage() {
  const items = listDavidReidTastings();

  return (
    <main>
      <header>
        <p>
          <Link href="/">Home</Link>
        </p>
        <h1>Tastings</h1>
        <p>Trial content (David Reid) used to prove structure.</p>
      </header>

      <ul>
        {items.map(({ slug, tasting }) => (
          <li key={slug}>
            <Link href={`/tastings/${slug}`}>{tasting.whisky.name_display}</Link>
            <div>
              {tasting.contributor.name}
              {tasting.whisky.region ? ` · ${tasting.whisky.region}` : ""}
              {tasting.whisky.age_years ? ` · ${tasting.whisky.age_years}yo` : ""}
            </div>
          </li>
        ))}
      </ul>

      <hr />
      <p>Built for archive and comparison. Trial content only at this stage.</p>
    </main>
  );
}
