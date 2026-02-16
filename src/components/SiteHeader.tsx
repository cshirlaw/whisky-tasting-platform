"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleCaseFromSlug(seg: string) {
  return seg
    .split("-")
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join(" ");
}

function crumbLabel(seg: string) {
  if (!seg) return "Home";
  if (seg === "bottles") return "Bottles";
  if (seg === "tastings") return "Tastings";
  if (seg === "reviewers") return "Contributors";
  if (seg === "admin") return "Admin";
  if (seg === "consumer-review") return "Consumer Review";
  return titleCaseFromSlug(seg);
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);

  const crumbs: { href: string; label: string }[] = [{ href: "/", label: "Home" }];
  let acc = "";
  for (const p of parts) {
    acc += "/" + p;
    crumbs.push({ href: acc, label: crumbLabel(p) });
  }

  const nav = [
    { href: "/", label: "Home" },
    { href: "/bottles", label: "Bottles" },
    { href: "/tastings", label: "Tastings" },
    { href: "/admin/consumer-review", label: "Admin" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col">
            <Link href="/" className="text-base font-semibold tracking-tight text-neutral-900">
              Blended Scotch Whisky
            </Link>
            <div className="mt-1 text-xs text-neutral-600">
              A quiet reference for retail blends, starting with expert tastings.
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            {nav.map((n) => {
              const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href + "/")) || pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={
                    active
                      ? "rounded-full bg-neutral-900 px-3 py-1 text-white shadow-sm"
                      : "rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                <Link
                  href={c.href}
                  className="hover:underline hover:underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900"
                >
                  {c.label}
                </Link>
                {i < crumbs.length - 1 ? <span className="text-neutral-300">/</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
