import Link from "next/link";

type Item = { key: string; label: string; href: string };

const ITEMS: Item[] = [
  { key: "global-core", label: "Global Core", href: "/bottles" },
  { key: "premium-core", label: "Premium Core", href: "/catalogue/premium-core" },
  { key: "lenta-spb", label: "Lenta SPB", href: "/catalogue/lenta-spb" },
];

export default function CatalogueToggle({ current }: { current: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {ITEMS.map((it) => {
        const active = it.key === current;
        const base =
          "inline-flex items-center rounded-full border px-3 py-1 text-sm transition";
        const cls = active
          ? `${base} border-neutral-900 bg-neutral-900 text-white`
          : `${base} border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900`;
        return (
          <Link key={it.key} href={it.href} className={cls}>
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
