import Link from "next/link";
import { listAllTastings, getTastingByKey } from "../../../lib/tastings";

export function generateStaticParams() {
  const all = listAllTastings();
  return all.map((t) => ({ slug: t.key }));
}

export default function TastingPage({ params }: { params: { slug: string } }) {
  const record = getTastingByKey(decodeURIComponent(params.slug));

  if (!record) {
    return (
      <main style={{ maxWidth: "900px", padding: "1.5rem" }}>
        <p>
          <Link href="/tastings">Back to tastings</Link>
        </p>
        <h1>Not found</h1>
      </main>
    );
  }

  const { tasting } = record;
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
            <strong>Contributor:</strong> {tasting.contributor.name} ({tasting.contributor.tier})
          </li>
          {tasting.whisky.brand_or_label && (
            <li>
              <strong>Brand / label:</strong> {tasting.whisky.brand_or_label}
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
        <h2>Images</h2>

        {assets.length ? (
          <div style={{ display: "grid", gap: "1rem", maxWidth: "720px" }}>
            {assets.map((asset, i) => (
              <figure key={i} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
          src={asset.path}
          alt={asset.note || asset.kind}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            border: "1px solid #ddd",
            objectFit: "contain",
            maxWidth: (asset.path.includes("post-text") || asset.path.includes("post_text")) ? "600px"
              : (asset.path.includes("bottle-front") || asset.path.includes("bottle-back") || asset.path.includes("/bottle.")) ? "420px"
              : "600px",
            maxHeight: (asset.path.includes("post-text") || asset.path.includes("post_text")) ? "520px"
              : (asset.path.includes("bottle-front") || asset.path.includes("bottle-back") || asset.path.includes("/bottle.")) ? "640px"
              : "900px",
            margin: "0 auto",
          }}
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

      <hr />
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Built for archive and comparison. Trial content only at this stage.
      </p>
    </main>
  );
}
