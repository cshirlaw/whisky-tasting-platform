import Link from "next/link";
import { getDavidReidTasting, listDavidReidTastings } from "@/lib/tastings";

export function generateStaticParams() {
  const all = listDavidReidTastings();
  return all.map(({ slug }) => ({ slug }));
}

export default function TastingDetailPage({ params }: { params: { slug: string } }) {
  const found = getDavidReidTasting(params.slug);
  if (!found) {
    return (
      <main>
        <p>
          <Link href="/tastings">Back to Tastings</Link>
        </p>
        <h1>Not found</h1>
      </main>
    );
  }

  const { slug, tasting } = found;

  const assets = tasting.source?.assets ?? [];

  return (
    <main>
      <header>
        <p>
          <Link href="/">Home</Link> · <Link href="/tastings">Tastings</Link>
        </p>

        <h1>{tasting.whisky.name_display}</h1>

        <ul>
          <li>
            <strong>Contributor:</strong> {tasting.contributor.name} ({tasting.contributor.tier})
          </li>
          {tasting.whisky.brand_or_label ? (
            <li>
              <strong>Bottler:</strong> {tasting.whisky.brand_or_label}
            </li>
          ) : null}
          {tasting.whisky.distillery ? (
            <li>
              <strong>Distillery:</strong> {tasting.whisky.distillery}
            </li>
          ) : null}
          {tasting.whisky.region ? (
            <li>
              <strong>Region:</strong> {tasting.whisky.region}
            </li>
          ) : null}
        </ul>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{tasting.tasting.summary ?? "(No summary yet.)"}</p>
      </section>

      <section>
        <h2>Notes</h2>

        <h3>Nose</h3>
        {tasting.tasting.notes.nose?.length ? (
          <ul>{tasting.tasting.notes.nose.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Palate</h3>
        {tasting.tasting.notes.palate?.length ? (
          <ul>{tasting.tasting.notes.palate.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Finish</h3>
        {tasting.tasting.notes.finish?.length ? (
          <ul>{tasting.tasting.notes.finish.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Overall</h3>
        {tasting.tasting.notes.overall?.length ? (
          <ul>{tasting.tasting.notes.overall.map((x, i) => <li key={i}>{x}</li>)}</ul>
        ) : (
          <p>—</p>
        )}
      </section>

      <section>
        <h2>Images</h2>
        {assets.length ? (
          <ul>
            {assets.map((a, i) => (
              <li key={i}>
                <strong>{a.kind}</strong>: {a.path}
                {a.note ? ` (${a.note})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p>(No images added yet.)</p>
        )}
      </section>

      <section>
        <h2>Source</h2>
        <p>Assets folder: {tasting.source?.assets?.length ? "See Images above." : "Not yet."}</p>
        <p>Record slug: {slug}</p>
      </section>

      <hr />
      <p>Built for archive and comparison. Trial content only at this stage.</p>
    </main>
  );
}
