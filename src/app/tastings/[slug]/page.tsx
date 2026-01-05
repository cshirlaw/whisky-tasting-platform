import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";

function findTastingFile(slug: string) {
  const [typePart, rest] = slug.split(":", 2);
  if (!typePart || !rest) return null;

  const [sourcePart, ...idParts] = rest.split(":");
  const idSlug = idParts.join(":");
  if (!sourcePart || !idSlug) return null;

  const type = typePart.toLowerCase();
  const source = sourcePart.toLowerCase();

  const base =
    type === "expert"
      ? path.join(process.cwd(), "data", "tastings", "experts", source)
      : type === "consumer"
        ? path.join(process.cwd(), "data", "tastings", "consumers", source)
        : null;

  if (!base) return null;

  const file = path.join(base, `${idSlug}.json`);
  return fs.existsSync(file) ? file : null;
}

function readJson(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function assetUrlToPublicPath(assetPath: string) {
  if (!assetPath || typeof assetPath !== "string") return null;
  const p = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return path.join(process.cwd(), "public", p);
}

function findFirstImageUrl(record: any) {
  const assets = record?.source?.assets;
  if (!Array.isArray(assets)) return null;

  const img = assets.find(
    (a: any) =>
      a &&
      typeof a === "object" &&
      (a.kind === "image" || !a.kind) &&
      typeof a.path === "string"
  );

  if (!img?.path) return null;

  const publicPath = assetUrlToPublicPath(img.path);
  if (!publicPath) return null;
  if (!fs.existsSync(publicPath)) return null;

  return img.path;
}

function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function hasConsumerScoring(tastingObj: any) {
  return isObject(tastingObj) && isObject((tastingObj as any).consumer_scoring);
}

export default async function TastingPage({ params }: { params: { slug: string } }) {
  const file = findTastingFile(safeDecodeSlug(params.slug));
  if (!file) notFound();

  const record = readJson(file);

  const title = record?.whisky?.name_display || record?.whisky?.name || record?.id || "Tasting";
  const imgUrl = findFirstImageUrl(record);

  const tastingObj = record?.tasting;
  const showConsumer = hasConsumerScoring(tastingObj);
  const consumer = showConsumer ? (tastingObj as any).consumer_scoring : null;

  return (
    <main style={{ maxWidth: 860, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.75rem" }}>{title}</h1>

      {imgUrl ? (
        <div style={{ margin: "1rem 0 1.25rem 0" }}>
          <img
            src={imgUrl}
            alt={`${title} bottle`}
            style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid #e5e5e5" }}
          />
        </div>
      ) : null}

      <section style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Tasting</h2>

        {record?.tasting?.summary ? <p style={{ margin: "0 0 0.75rem 0" }}>{record.tasting.summary}</p> : null}

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {record?.tasting?.notes?.nose?.length ? (
            <div>
              <strong>Nose</strong>
              <ul style={{ margin: "0.35rem 0 0 1.1rem" }}>
                {record.tasting.notes.nose.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {record?.tasting?.notes?.palate?.length ? (
            <div>
              <strong>Palate</strong>
              <ul style={{ margin: "0.35rem 0 0 1.1rem" }}>
                {record.tasting.notes.palate.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {record?.tasting?.notes?.finish?.length ? (
            <div>
              <strong>Finish</strong>
              <ul style={{ margin: "0.35rem 0 0 1.1rem" }}>
                {record.tasting.notes.finish.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {record?.tasting?.notes?.overall?.length ? (
            <div>
              <strong>Overall</strong>
              <ul style={{ margin: "0.35rem 0 0 1.1rem" }}>
                {record.tasting.notes.overall.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ margin: "1.25rem 0" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Consumer scoring</h2>

        {showConsumer ? (
          <div style={{ border: "1px solid #ddd", padding: "0.75rem", borderRadius: 8, background: "#fafafa" }}>
            {typeof consumer.overall_1_10 === "number" ? (
              <p style={{ margin: "0 0 0.35rem 0" }}>
                <strong>Overall:</strong> {consumer.overall_1_10}/10
              </p>
            ) : null}

            {typeof consumer.value_1_10 === "number" ? (
              <p style={{ margin: "0 0 0.35rem 0" }}>
                <strong>Value:</strong> {consumer.value_1_10}/10
              </p>
            ) : null}

            {typeof consumer.would_buy_again === "boolean" ? (
              <p style={{ margin: "0 0 0.35rem 0" }}>
                <strong>Would buy again:</strong> {consumer.would_buy_again ? "Yes" : "No"}
              </p>
            ) : null}

            {typeof consumer.blind === "boolean" ? (
              <p style={{ margin: "0 0 0.35rem 0" }}>
                <strong>Blind:</strong> {consumer.blind ? "Yes" : "No"}
              </p>
            ) : null}

            {consumer.served ? (
              <p style={{ margin: "0 0 0.35rem 0" }}>
                <strong>Served:</strong> {consumer.served}
              </p>
            ) : null}

            {consumer.notes_free_text ? (
              <p style={{ margin: "0", whiteSpace: "pre-wrap" }}>
                <strong>Notes:</strong> {consumer.notes_free_text}
              </p>
            ) : null}
          </div>
        ) : (
          <p>(No consumer scoring yet.)</p>
        )}
      </section>
    </main>
  );
}
