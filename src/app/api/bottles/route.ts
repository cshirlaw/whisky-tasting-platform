import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const mod =
    (await import("@/lib/data/bottles").catch(() => null)) ||
    (await import("@/data/bottles").catch(() => null)) ||
    (await import("@/lib/bottles").catch(() => null));

  if (!mod) {
    return NextResponse.json(
      { error: "Bottles data module not found. Expected one of: @/lib/data/bottles, @/data/bottles, @/lib/bottles" },
      { status: 500 }
    );
  }

  const data =
    (mod as any).bottles ??
    (mod as any).default ??
    (mod as any).getBottles?.() ??
    (mod as any).getAllBottles?.() ??
    null;

  if (!data) {
    return NextResponse.json(
      { error: "Bottles data export not found (expected 'bottles' or default export or getBottles())." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
