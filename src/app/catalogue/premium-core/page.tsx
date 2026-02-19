import BottleCard from "@/components/BottleCard";
import { loadBottleSummaries } from "@/lib/bottles";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "Catalogue: Premium Core",
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

function pickBottleImage(bottleKey: string, slug: string): string | null {
  const thumbsDir = path.join(process.cwd(), "public", "bottles", "thumbs");
  for (const ext of IMAGE_EXTS) {
    const file = `${bottleKey}.${ext}`;
    const full = path.join(thumbsDir, file);
    if (fs.existsSync(full)) return `/bottles/thumbs/${file}`;
  }

  const baseDir = path.join(process.cwd(), "public", "bottles");
  for (const ext of IMAGE_EXTS) {
    const file = `${bottleKey}.${ext}`;
    const full = path.join(baseDir, file);
    if (fs.existsSync(full)) return `/bottles/${file}`;
  }

  for (const ext of IMAGE_EXTS) {
    const file = `${slug}.${ext}`;
    const full = path.join(baseDir, file);
    if (fs.existsSync(full)) return `/bottles/${file}`;
  }

  return null;
}

type CatalogueItem = {
  key: string;
  slug: string;
  name: string;
  category?: string;
};

function loadPremiumCoreCatalogue(): CatalogueItem[] {
  const p = path.join(process.cwd(), "data", "bottles", "catalogue-premium-core.json");
  const raw = fs.readFileSync(p, "utf8");
  const j = JSON.parse(raw);
  const items = Array.isArray(j?.bottles) ? j.bottles : [];
  return items
    .map((x: any) => ({
      key: String(x?.key || "").trim(),
      slug: String(x?.slug || "").trim(),
      name: String(x?.name || "").trim(),
      category: typeof x?.category === "string" ? x.category : undefined,
    }))
    .filter((x: any) => x.key && x.slug && x.name);
}

export default async function PremiumCoreCataloguePage() {
  const catalogue = loadPremiumCoreCatalogue();
  const wanted = new Set(catalogue.map((b) => b.key));

  const all = await loadBottleSummaries();
  const picked = all.filter((x) => wanted.has(String(x?.bottle?.key || "")));

  const byKey = new Map(picked.map((x) => [String(x.bottle.key), x]));

  const rows = catalogue
    .map((c) => ({ c, summary: byKey.get(c.key) || null }))
    .sort((a, b) => String(a.c.name).localeCompare(String(b.c.name), "en", { sensitivity: "base" }));

  const withTastings = rows.filter((r) => (r.summary?.tastingCount || 0) > 0);
  const withoutTastings = rows.filter((r) => (r.summary?.tastingCount || 0) === 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Bottles</h1>
              <div className="mt-1 text-xs text-neutral-500">Catalogue: Premium Core</div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
                A curated premium-core pool intended for pilot sessions (typically 6–7 bottles selected from this list).
              </p>
            </div>
            <div className="shrink-0 text-sm text-neutral-600">{catalogue.length} bottle(s)</div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">In catalogue</h2>
          <div className="text-sm text-neutral-600">{withTastings.length} with tastings</div>
        </div>

        {withTastings.length === 0 ? (
          <p className="mt-3 text-neutral-700">No tastings found yet for this catalogue.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {withTastings.map(({ c, summary }) => {
              const b = summary!.bottle;
              const metaParts = [c.category || b.category || null, b.abvPercent ? `${b.abvPercent}%` : null].filter(Boolean) as string[];
              return (
                <BottleCard
                  key={c.key}
                  title={c.name}
                  href={`/bottles/${b.slug || c.slug}`}
                  meta={metaParts.join(" · ")}
                  rightTop={summary!.avgOverall1to10 !== null ? `${summary!.avgOverall1to10.toFixed(1)}/10` : "—"}
                  rightBottom={`${summary!.tastingCount} tasting(s)`}
                  imageSrc={pickBottleImage(b.key || c.key, b.slug || c.slug)}
                />
              );
            })}
          </div>
        )}
      </section>

      {withoutTastings.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">Listed (no tastings yet)</h2>
            <div className="text-sm text-neutral-600">{withoutTastings.length} bottle(s)</div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {withoutTastings.map(({ c }) => (
              <div key={c.key} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="text-base font-semibold text-neutral-900">{c.name}</div>
                <div className="mt-1 text-sm text-neutral-600">{c.category || "—"}</div>
                <div className="mt-3 text-sm">
                  <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href={`/bottles/${c.slug}`}>
                    Open bottle page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/bottles">
          Back to Bottles
        </Link>
      </div>
    </main>
  );
}
