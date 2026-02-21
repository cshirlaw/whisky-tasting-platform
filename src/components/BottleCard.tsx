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
    <div className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:border-neutral-300 hover:shadow-md focus-within:ring-2 focus-within:ring-neutral-900/10 sm:p-5">
      <div className="flex items-start gap-4">
        {imageSrc ? (
          <div className="shrink-0">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition group-hover:border-neutral-300">
              <div className="flex h-[90px] w-[72px] items-center justify-center">
                <Image
                  src={imageSrc}
                  alt={title}
                  width={72}
                  height={90}
                  className="h-full w-full object-contain"
                  priority={false}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-snug text-neutral-900">
              <Link
                className="outline-none underline underline-offset-4 decoration-neutral-300 transition hover:decoration-neutral-900 focus-visible:decoration-neutral-900"
                href={href}
              >
                {title}
              </Link>
            </h2>
            {meta ? <p className="mt-1 text-sm leading-snug text-neutral-600">{meta}</p> : null}
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
