import BottleCard from "@/components/BottleCard";
import { loadBottleSummaries } from "@/lib/bottles";

export const metadata = {
  title: "Bottles",
};

export default async function BottlesIndexPage() {
  const items = await loadBottleSummaries();

  const sorted = [...items].sort((a, b) =>
    String(a.bottle.name || "").localeCompare(String(b.bottle.name || ""), "en", { sensitivity: "base" }),
  );

  return (
    <main>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-semibold">Bottles</h1>
        <div className="text-sm text-neutral-600">{sorted.length} bottle(s)</div>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-6 text-neutral-700">No bottles found yet.</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {sorted.map((b) => {
            const metaParts = [
              b.bottle.category || null,
              b.bottle.abvPercent ? `${b.bottle.abvPercent}%` : null,
            ].filter(Boolean) as string[];

            return (
              <BottleCard
                key={b.bottle.slug}
                title={b.bottle.name}
                href={`/bottles/${b.bottle.slug}`}
                meta={metaParts.join(" · ")}
                rightTop={b.avgOverall1to10 !== null ? `${b.avgOverall1to10.toFixed(1)}/10` : "—"}
                rightBottom={`${b.tastingCount} review(s)`}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
