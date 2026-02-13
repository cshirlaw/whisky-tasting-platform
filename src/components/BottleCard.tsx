import Image from "next/image";
import Link from "next/link";

export default function BottleCard({
  title,
  href,
  meta,
  rightTop,
  rightBottom,
  imageSrc,
}: {
  title: string;
  href: string;
  meta?: string;
  rightTop?: string;
  rightBottom?: string;
  imageSrc?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start gap-4">
        {imageSrc ? (
          <div className="shrink-0">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <Image
                src={imageSrc}
                alt={title}
                width={72}
                height={90}
                className="h-auto w-[72px]"
                priority={false}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-snug text-neutral-900">
              <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href={href}>
                {title}
              </Link>
            </h2>
            {meta ? <p className="mt-1 text-sm text-neutral-600">{meta}</p> : null}
          </div>

          {rightTop || rightBottom ? (
            <div className="shrink-0 text-right">
              {rightTop ? <div className="text-sm font-semibold text-neutral-900">{rightTop}</div> : null}
              {rightBottom ? <div className="mt-0.5 text-xs text-neutral-600">{rightBottom}</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
