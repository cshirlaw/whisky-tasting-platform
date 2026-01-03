import Link from "next/link";
import { listDavidReidTastings, getDavidReidTasting } from "../../../lib/tastings";

export function generateStaticParams() {
  const all = listDavidReidTastings();
  return all.map((t) => ({ slug: t.slug }));
}

export default function TastingPage({ params }: { params: { slug: string } }) {
  const record = getDavidReidTasting(params.slug);

  if (!record) {
    return (
      <main>
        <p>
          <Link href="/tastings">Back to tastings</Link>
        </p>
        <h1>Not found</h1>
      </main>
    );
  }

  const { slug, tasting } = record;
  const assets = tasting.source?.assets ?? [];

  return (
    <main style={{ maxWidth: "900px", padding: "1.5rem" }}>
      <header>
        <p>
          <Link href="/">Home</Link> · <Link href="/tastings">Tastings</Link>
        </p>

        <h1>{tasting.whisky.name_display}</h1>

        <ul>
          <li>
            <strong>Contributor:</strong> {tasting.contributor.name} (
            {tasting.contributor.tier})
          </li>
          {tasting.whisky.brand_or_label && (
            <li>
              <strong>Bottler:</strong> {tasting.whisky.brand_or_label}
            </li>
          )}
          {tasting.whisky.distillery && (
            <li>
              <strong>Distillery:</strong> {tasting.whisky.distillery}
            </li>
          )}
          {tasting.whisky.region && (
            <li>
              <strong>Region:</strong> {tasting.whisky.region}
            </li>
          )}
        </ul>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{tasting.tasting.summary || "(No summary yet.)"}</p>
      </section>

      <section>
        <h2>Notes</h2>

        <h3>Nose</h3>
        {tasting.tasting.notes.nose.length ? (
          <ul>{tasting.tasting.notes.nose.map((n, i) => <li key={i}>{n}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Palate</h3>
        {tasting.tasting.notes.palate.length ? (
          <ul>{tasting.tasting.notes.palate.map((n, i) => <li key={i}>{n}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Finish</h3>
        {tasting.tasting.notes.finish.length ? (
          <ul>{tasting.tasting.notes.finish.map((n, i) => <li key={i}>{n}</li>)}</ul>
        ) : (
          <p>—</p>
        )}

        <h3>Overall</h3>
        {tasting.tasting.notes.overall.length ? (
          <ul>{tasting.tasting.notes.overall.map((n, i) => <li key={i}>{n}</li>)}</ul>
        ) : (
          <p>—</p>
        )}
      </section>

      <section>
        <h2>Images</h2>

{tasting.source.assets && tasting.source.assets.length > 0 ? (
  <div style={{ display: "grid", gap: "1rem", maxWidth: "720px" }}>
    {tasting.source.assets.map((asset, i) => (
      <figure key={i} style={{ margin: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.path}
          alt={asset.note || asset.kind}
          style={{ width: "100%", height: "auto", border: "1px solid #ddd" }}
        />
        <figcaption style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.25rem" }}>
          {(asset.note || asset.kind).toString()}
        </figcaption>
      </figure>
    ))}
  </div>
) : (
  <p>(No images added yet.)</p>
)}

<h2>Source</h2>
        <p>Record slug: {slug}</p>
      </section>

      <hr />
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Built for archive and comparison. Trial content only at this stage.
      </p>
    </main>
  );
}
