import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const mod =
    (await import("@/lib/data/tastings").catch(() => null)) ||
    (await import("@/data/tastings").catch(() => null)) ||
    (await import("@/lib/tastings").catch(() => null));

  if (!mod) {
    return NextResponse.json(
      { error: "Tastings data module not found. Expected one of: @/lib/data/tastings, @/data/tastings, @/lib/tastings" },
      { status: 500 }
    );
  }

  const data =
    (mod as any).tastings ??
    (mod as any).default ??
    (mod as any).getTastings?.() ??
    (mod as any).getAllTastings?.() ??
    null;

  if (!data) {
    return NextResponse.json(
      { error: "Tastings data export not found (expected 'tastings' or default export or getTastings())." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
