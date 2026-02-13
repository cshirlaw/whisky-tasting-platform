import Link from "next/link";
import fs from "fs";
import path from "path";
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

  if (!record) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm text-neutral-700">
            Not found.{" "}
            <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/tastings">
              Back to tastings
            </Link>
          </p>
        </section>
      </main>
    );
  }

  const { tasting } = record;

  const cleanedText = record?.tasting?.source?.original_text || null;
  const assetsToShow = (record?.tasting?.source?.assets || []).filter((a) => {
    if (cleanedText && typeof a.path === "string" && a.path.includes("post-text")) return false;
    return true;
  });

  const consumerScoring = (record.tasting as any)?.consumer_scoring || null;
  const status = (tasting as any)?.editorial?.status || "draft";
  const contributorId = (tasting.contributor as any)?.id || null;

  let otherByContributor: any[] = [];
  if (contributorId) {
    try {
      const { getExpertTastingsByReviewerId } = require("../../../lib/expertTastings");
      otherByContributor = getExpertTastingsByReviewerId(contributorId).filter((t: any) => t.slug !== params.slug);
    } catch {
      otherByContributor = [];
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/tastings">
            ← Back to Tastings
          </Link>

          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 shadow-sm">
            {editorialLabel(status)}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
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

          {tasting.contributor?.tier ? <span className="text-neutral-400">·</span> : null}
          {tasting.contributor?.tier ? <span className="text-neutral-600">{tasting.contributor.tier}</span> : null}

          {(tasting.contributor as any)?.source_platform ? <span className="text-neutral-400">·</span> : null}
          {(tasting.contributor as any)?.source_platform ? (
            <span className="text-neutral-600">{String((tasting.contributor as any)?.source_platform)}</span>
          ) : null}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Expert tastings only at this stage. This page is for internal reference.
        </p>
      </section>

      {otherByContributor.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">More by this contributor</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {otherByContributor.slice(0, 8).map((t: any) => (
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
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Summary</h2>
        <div className="mt-3 text-sm leading-relaxed text-neutral-700">
          {tasting.tasting?.summary ? <p>{tasting.tasting.summary}</p> : <p className="text-neutral-600">(No summary yet.)</p>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Notes</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Nose</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.nose || []).length ? (
                (tasting.tasting?.notes?.nose || []).map((x, i) => <li key={i}>{x}</li>)
              ) : (
                <li className="text-neutral-500">(None)</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Palate</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.palate || []).length ? (
                (tasting.tasting?.notes?.palate || []).map((x, i) => <li key={i}>{x}</li>)
              ) : (
                <li className="text-neutral-500">(None)</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Finish</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.finish || []).length ? (
                (tasting.tasting?.notes?.finish || []).map((x, i) => <li key={i}>{x}</li>)
              ) : (
                <li className="text-neutral-500">(None)</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold text-neutral-900">Overall</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {(tasting.tasting?.notes?.overall || []).length ? (
                (tasting.tasting?.notes?.overall || []).map((x, i) => <li key={i}>{x}</li>)
              ) : (
                <li className="text-neutral-500">(None)</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Consumer scoring</h2>

        <div className="mt-3 text-sm text-neutral-700">
          {consumerScoring ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-600">Overall</div>
                  <div className="mt-1 text-base font-semibold text-neutral-900">{consumerScoring.overall_1_10}/10</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-600">Served</div>
                  <div className="mt-1 text-sm text-neutral-800">{consumerScoring.served}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-600">Would buy again</div>
                  <div className="mt-1 text-sm text-neutral-800">
                    {consumerScoring.rebuy != null ? (consumerScoring.rebuy ? "Yes" : "No") : "—"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-600">(No consumer scoring yet.)</p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Source text (cleaned)</h2>

        <div className="mt-3">
          {record?.tasting?.source?.original_text ? (
            <pre className="whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
{record.tasting.source.original_text}
            </pre>
          ) : (
            <p className="text-sm text-neutral-600">
              <em>No cleaned source text available.</em>
            </p>
          )}
        </div>

        <h2 className="mt-6 text-lg font-semibold tracking-tight text-neutral-900">Images</h2>

        {assetsToShow && assetsToShow.length > 0 ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetsToShow.map((asset: any, i: number) => {
              const ocrPath = asset?.path ? ocrPathForAsset(String(asset.path)) : null;
              const ocrText = ocrPath ? readPublicText(ocrPath) : null;

              return (
                <figure key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.path} alt={asset.note || asset.kind || "image"} className="h-auto w-full" />
                  <figcaption className="border-t border-neutral-200 p-3 text-xs text-neutral-600">
                    <div className="font-semibold text-neutral-800">{asset.kind || "asset"}</div>
                    {asset.note ? <div className="mt-1">{asset.note}</div> : null}
                    {ocrText ? <div className="mt-2 whitespace-pre-wrap text-neutral-700">{ocrText}</div> : null}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-600">(No images added yet.)</p>
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
