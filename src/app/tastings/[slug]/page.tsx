import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getTastingBySlug } from "../../../lib/tastings";

function ocrPathForAsset(assetPath: string) {
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
  if (!record) notFound();

  const { tasting } = record;

  const cleanedText = record?.tasting?.source?.original_text || null;
  const assetsToShow = (record?.tasting?.source?.assets || []).filter((a) => {
    if (cleanedText && typeof a.path === "string" && a.path.includes("post-text")) return false;
    return true;
  });

  const consumerScoring = (record.tasting as any)?.consumer_scoring || null;
  const status = (tasting as any)?.editorial?.status || "draft";

  const contributorId = (tasting.contributor as any)?.id || null;
  let other: any[] = [];
  if (contributorId) {
    try {
      const { getExpertTastingsByReviewerId } = require("../../../lib/expertTastings");
      other = getExpertTastingsByReviewerId(contributorId).filter((t: any) => t.slug !== params.slug);
    } catch {
      other = [];
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/tastings">
          Back to Tastings
        </Link>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          {tasting.whisky?.name_display || params.slug}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-700">
          {contributorId ? (
            <Link
              href={"/reviewers/" + contributorId}
              className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
            >
              {tasting.contributor?.name || contributorId}
            </Link>
          ) : (
            <span>{tasting.contributor?.name || "Unknown contributor"}</span>
          )}

          <span className="text-neutral-300">/</span>

          <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
            {editorialLabel(status)}
          </span>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
          Expert tastings only at this stage. This page is for internal reference.
        </p>
      </section>

      {other.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">More by this contributor</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {other.slice(0, 8).map((t: any) => (
              <li key={t.slug}>
                <Link
                  href={"/tastings/" + t.slug}
                  className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                >
                  {t.whiskyNameDisplay || t.slug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Summary</h2>
        <div className="mt-3 text-sm leading-relaxed text-neutral-700">
          {tasting.tasting?.summary ? <p>{tasting.tasting.summary}</p> : <p>(No summary yet.)</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Notes</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Nose</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.nose || []).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Palate</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.palate || []).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Finish</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.finish || []).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Overall</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.overall || []).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Consumer scoring</h2>

        <div className="mt-3 text-sm text-neutral-700">
          {consumerScoring ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-neutral-900">Overall:</span> {consumerScoring.overall_1_10}/10
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">Served:</span> {consumerScoring.served}
                </div>
                {consumerScoring.rebuy != null ? (
                  <div>
                    <span className="font-semibold text-neutral-900">Would buy again:</span>{" "}
                    {consumerScoring.rebuy ? "Yes" : "No"}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p>(No consumer scoring yet.)</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Source text</h2>

        <div className="mt-3">
          {record?.tasting?.source?.original_text ? (
            <pre className="whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
{record.tasting.source.original_text}
            </pre>
          ) : (
            <p className="text-sm text-neutral-700">
              <em>No cleaned source text available.</em>
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">Images</h2>

        {assetsToShow && assetsToShow.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {assetsToShow.map((asset, i) => {
              const ocr = asset?.path ? ocrPathForAsset(asset.path) : null;
              const ocrText = ocr ? readPublicText(ocr) : null;

              return (
                <figure key={i} className="m-0">
                  <img
                    src={asset.path}
                    alt={asset.note || asset.kind}
                    className="w-full rounded-2xl border border-neutral-200 bg-white"
                  />
                  <figcaption className="mt-2 text-xs text-neutral-600">
                    {asset.kind}
                    {asset.note ? <span className="text-neutral-400"> · </span> : null}
                    {asset.note ? <span>{asset.note}</span> : null}
                  </figcaption>

                  {ocrText ? (
                    <details className="mt-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                      <summary className="cursor-pointer text-sm font-semibold text-neutral-900">OCR text</summary>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-neutral-800">{ocrText}</pre>
                    </details>
                  ) : null}
                </figure>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-700">(No images added yet.)</p>
        )}
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/tastings">
          Back to Tastings
        </Link>
      </div>
    </main>
  );
}
