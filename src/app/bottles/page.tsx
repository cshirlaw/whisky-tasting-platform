import BottleCard from "@/components/BottleCard";
import { loadBottleSummaries } from "@/lib/bottles";

export const metadata = {
  title: "Bottles",
};

export default async function BottlesIndexPage() {
  const items = await loadBottleSummaries();

  return (
    <main>
      <h1 className="text-xl font-semibold">Bottles</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-neutral-700">No bottles found yet.</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {items.map((b) => {
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
