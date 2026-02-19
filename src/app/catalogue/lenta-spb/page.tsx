import BottleCard from "@/components/BottleCard";
import CatalogueToggle from "@/components/CatalogueToggle";
import { loadBottleSummaries } from "@/lib/bottles";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "Catalogue: Lenta SPB",
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

const LENTA_SPB_KEYS = [
  "aberfort",
  "ballantines",
  "bells",
  "chivas-regal-12yo",
  "dewars",
  "dewars-12yo",
  "famous-grouse",
  "grants",
  "highland-mist",
  "johnnie-walker-red-label",
  "langs",
  "orson"
];

export default async function CatalogueLentaSpbPage() {
  const items = await loadBottleSummaries();

  const lenta = items
    .filter((x) => LENTA_SPB_KEYS.includes(x?.bottle?.key || ""))
    .sort((a, b) => String(a.bottle.name || "").localeCompare(String(b.bottle.name || ""), "en", { sensitivity: "base" }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Bottles – Lenta SPB</h1>
              <div className="mt-1 text-xs text-neutral-500">Catalogue: Lenta SPB</div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
                A specific retail set based on the Lenta supermarket shelf photos (St Petersburg).
              </p>
            </div>
            <div className="shrink-0 text-sm text-neutral-600">{lenta.length} bottle(s)</div>
          </div>

          <div className="mt-4">
            <CatalogueToggle current="lenta-spb" />
          </div>

          <div className="mt-4 text-sm">
            <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/bottles">
              Back to Global Core
            </Link>
          </div>
        </div>
      </section>

      {lenta.length === 0 ? (
        <p className="mt-6 text-neutral-700">No bottles found for this catalogue.</p>
      ) : (
        <section className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {lenta.map((b) => {
              const metaParts = [b.bottle.category || null, b.bottle.abvPercent ? `${b.bottle.abvPercent}%` : null].filter(Boolean) as string[];

              return (
                <BottleCard
                  key={b.bottle.slug}
                  title={b.bottle.name}
                  href={`/bottles/${b.bottle.slug}`}
                  meta={metaParts.join(" · ")}
                  rightTop={b.avgOverall1to10 !== null ? `${b.avgOverall1to10.toFixed(1)}/10` : "—"}
                  rightBottom={`${b.tastingCount} tasting(s)`}
                  imageSrc={pickBottleImage(b.bottle.key, b.bottle.slug)}
                />
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
