import Link from "next/link";

function pillClass(active: boolean) {
  return [
    "inline-flex items-center rounded-full border px-3 py-1 text-sm",
    active
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300",
  ].join(" ");
}

export default function StarFilter({
  baseHref,
  activeStars,
  counts,
}: {
  baseHref: string;
  activeStars: number | null;
  counts: Record<number, number>;
}) {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="flex flex-wrap gap-2">
      <Link className={pillClass(activeStars === null)} href={baseHref}>
        All ({stars.reduce((a, s) => a + (counts[s] ?? 0), 0)})
      </Link>

      {stars.map((s) => (
        <Link
          key={s}
          className={pillClass(activeStars === s)}
          href={`${baseHref}?stars=${s}`}
        >
          {s}★ ({counts[s] ?? 0})
        </Link>
      ))}
    </div>
  );
}
