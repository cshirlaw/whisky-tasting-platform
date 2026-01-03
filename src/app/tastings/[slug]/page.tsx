import Link from "next/link";
import { listAllTastings, getTastingBySlug } from "../../../lib/tastings";

export function generateStaticParams() {
  const all = listAllTastings();
  return all.map((t) => ({ slug: t.slug }));
}

function paraify(text: string) {
  const parts = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.map((p, i) => (
    <p key={i} style={{ marginTop: i === 0 ? 0 : "0.75rem" }}>
      {p}
    </p>
  ));
}

export default function TastingPage({ params }: { params: { slug: string } }) {
  const record = getTastingBySlug(params.slug);

  if (!record) {
    return (
      <main>
        <h1>Not found</h1>
        <p>This tasting could not be located.</p>
        <p>
          <Link href="/tastings">Back to Tastings</Link>
        </p>
      </main>
    );
  }

  const { tasting } = record;
  const name = tasting?.whisky?.name_display || "Untitled tasting";
  const contributorName = tasting?.contributor?.name || "Unknown";
  const tier = tasting?.contributor?.tier || "other";
  const sourcePlatform = tasting?.contributor?.source_platform || null;

  const originalText = (tasting?.source?.original_text || "").trim();
  const assets = Array.isArray(tasting?.source?.assets) ? tasting.source.assets : [];

  const badgeText =
    tier === "expert" ? (sourcePlatform ? `Expert (${sourcePlatform})` : "Expert") : tier === "consumer" ? "Consumer" : "Other";

  return (
    <main>
      <nav style={{ marginBottom: "1rem" }}>
        <Link href="/tastings">← Back to Tastings</Link>
      </nav>

      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>{name}</h1>
        <div>
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
            {badgeText}
          </span>
        </div>
      </header>

      <section style={{ marginTop: "1rem" }}>
        <h2>Notes</h2>

        {tasting?.tasting?.summary ? <p>{tasting.tasting.summary}</p> : <p>(No summary yet.)</p>}

        <div style={{ marginTop: "1rem" }}>
          <h3>Nose</h3>
          <ul>{(tasting?.tasting?.notes?.nose || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>

          <h3>Palate</h3>
          <ul>{(tasting?.tasting?.notes?.palate || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>

          <h3>Finish</h3>
          <ul>{(tasting?.tasting?.notes?.finish || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>

          <h3>Overall</h3>
          <ul>{(tasting?.tasting?.notes?.overall || []).map((x: string, i: number) => <li key={i}>{x}</li>)}</ul>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Source text (OCR)</h2>

        {originalText ? (
          <div style={{ border: "1px solid #ddd", padding: "0.75rem", maxWidth: "820px" }}>
            <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>{paraify(originalText)}</div>
          </div>
        ) : (
          <p>(No OCR text added yet.)</p>
        )}
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Evidence</h2>

        <details>
          <summary>View original screenshots</summary>

          {assets.length > 0 ? (
            <div style={{ display: "grid", gap: "1rem", maxWidth: "820px", marginTop: "1rem" }}>
              {assets.map((asset: any, i: number) => (
                <figure key={i} style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.path}
                    alt={asset.note || asset.kind}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: "520px",
                      border: "1px solid #ddd",
                      display: "block"
                    }}
                  />
                  {asset.note ? (
                    <figcaption style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.35rem" }}>{asset.note}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: "1rem" }}>(No images added yet.)</p>
          )}
        </details>
      </section>

      <hr style={{ marginTop: "2rem" }} />
      <p>Built for archive and comparison. Trial content only at this stage.</p>
    </main>
  );
}
