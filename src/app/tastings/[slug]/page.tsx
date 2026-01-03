import Link from "next/link";
import fs from "fs";
import path from "path";
import { getTastingBySlug } from "../../../lib/tastings";

function ocrPathForAsset(assetPath: string) {
  // assetPath like: /sources/linkedin/.../post-text.jpg
  // ocr file like:  /sources/linkedin/.../post-text.ocr.txt
  if (!assetPath) return null;
  const noExt = assetPath.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  return noExt + ".ocr.txt";
}

function readPublicText(publicPathFromRoot: string) {
  try {
    const abs = path.join(process.cwd(), "public", publicPathFromRoot.replace(/^\//, ""));
    if (!fs.existsSync(abs)) return null;
    const raw = fs.readFileSync(abs, "utf8");
    return raw && raw.trim() ? raw : null;
  } catch {
    return null;
  }
}

function editorialLabel(status?: string | null) {
  if (status === "approved") return "Approved";
  if (status === "reviewed") return "Reviewed";
  return "Draft";
}

export default function TastingPage({ params }: { params: { slug: string } }) {
  const record = getTastingBySlug(params.slug);

  const cleanedText = record?.tasting?.source?.original_text || null;
  const assetsToShow = (record?.tasting?.source?.assets || []).filter((a) => {
    // If we have cleaned text, hide the LinkedIn text screenshot(s)
    if (cleanedText && typeof a.path === "string" && a.path.includes("post-text")) return false;
    return true;
  });

  if (!record) {
    return (
      <main style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1rem" }}>
        <p>
          Not found. <Link href="/tastings">Back to tastings</Link>
        </p>
      </main>
    );
  }

  const { tasting } = record;
  const status = tasting.editorial?.status || "draft";

  return (
    <main style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1rem" }}>
      <p style={{ marginTop: 0 }}>
        <Link href="/tastings">← Back</Link>
      </p>

      <header style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ marginBottom: "0.35rem" }}>{tasting.whisky?.name_display}</h1>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", color: "#555" }}>
          <span>{tasting.contributor?.name}</span>
          <span style={{ padding: "0.12rem 0.5rem", border: "1px solid #ddd", borderRadius: 999, fontSize: "0.78rem" }}>
            {editorialLabel(status)}
          </span>
        </div>
      </header>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Summary</h2>
        {tasting.tasting?.summary ? <p>{tasting.tasting.summary}</p> : <p>(No summary yet.)</p>}
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Notes</h2>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <strong>Nose</strong>
            <ul>{(tasting.tasting?.notes?.nose || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div>
            <strong>Palate</strong>
            <ul>{(tasting.tasting?.notes?.palate || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div>
            <strong>Finish</strong>
            <ul>{(tasting.tasting?.notes?.finish || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div>
            <strong>Overall</strong>
            <ul>{(tasting.tasting?.notes?.overall || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>

<h2>Source text (cleaned)</h2>
{record?.tasting?.source?.original_text ? (
  <pre style={{
    whiteSpace: "pre-wrap",
    border: "1px solid #ddd",
    padding: "0.75rem",
    borderRadius: "6px",
    maxWidth: "900px"
  }}>
    {record.tasting.source.original_text}
  </pre>
) : (
  <p><em>No cleaned source text available.</em></p>
)}

        <h2 style={{ marginBottom: "0.5rem" }}>Images</h2>

        {tasting.source?.assets && tasting.source.assets.length > 0 ? (
          <div style={{ display: "grid", gap: "1rem", maxWidth: "520px" }}>
            {tasting.source.assets.map((asset, i) => (
              <figure key={i} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.path}
                  alt={asset.note || asset.kind}
                  style={{ width: "100%", height: "auto", border: "1px solid #ddd" }}
                />
                <figcaption style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.25rem" }}>
                  {asset.kind}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p>(No images added yet.)</p>
        )}
      </section>

      <hr />
      <p style={{ color: "#666" }}>Built for archive and comparison. Trial content only at this stage.</p>
    </main>
  );
}
