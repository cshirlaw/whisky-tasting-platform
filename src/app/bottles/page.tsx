import BottleCard from "@/components/BottleCard";
import { loadBottleSummaries } from "@/lib/bottles";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

export const metadata = {
  title: "Bottles",
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

function pickBottleImage(slug: string): string | null {
  const baseDir = path.join(process.cwd(), "public", "bottles");
  for (const ext of IMAGE_EXTS) {
    const file = `${slug}.${ext}`;
    const full = path.join(baseDir, file);
    if (fs.existsSync(full)) return `/bottles/${file}`;
  }
  return null;
}

export default async function BottlesIndexPage() {
  const items = await loadBottleSummaries();

  const sorted = [...items].sort((a, b) =>
    String(a.bottle.name || "").localeCompare(String(b.bottle.name || ""), "en", { sensitivity: "base" }),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Bottles</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
              Standard blended Scotch whiskies commonly found in retail, shown with expert tastings.
            </p>
          </div>
          <div className="shrink-0 text-sm text-neutral-600">{sorted.length} bottle(s)</div>
        </div>
      </section>

      {sorted.length === 0 ? (
        <p className="mt-6 text-neutral-700">No bottles found yet.</p>
      ) : (
        <section className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {sorted.map((b) => {
              const metaParts = [b.bottle.category || null, b.bottle.abvPercent ? `${b.bottle.abvPercent}%` : null].filter(
                Boolean,
              ) as string[];

              return (
                <BottleCard
                  key={b.bottle.slug}
                  title={b.bottle.name}
                  href={`/bottles/${b.bottle.slug}`}
                  meta={metaParts.join(" · ")}
                  rightTop={b.avgOverall1to10 !== null ? `${b.avgOverall1to10.toFixed(1)}/10` : "—"}
                  rightBottom={`${b.tastingCount} tasting(s)`}
                  imageSrc={pickBottleImage(b.bottle.slug)}
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
