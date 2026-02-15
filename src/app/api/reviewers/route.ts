import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const mod =
    (await import("@/lib/data/reviewers").catch(() => null)) ||
    (await import("@/data/reviewers").catch(() => null)) ||
    (await import("@/lib/reviewers").catch(() => null));

  if (!mod) {
    return NextResponse.json(
      { error: "Reviewers data module not found. Expected one of: @/lib/data/reviewers, @/data/reviewers, @/lib/reviewers" },
      { status: 500 }
    );
  }

  const data =
    (mod as any).reviewers ??
    (mod as any).contributors ??
    (mod as any).default ??
    (mod as any).getReviewers?.() ??
    (mod as any).getAllReviewers?.() ??
    null;

  if (!data) {
    return NextResponse.json(
      { error: "Reviewers data export not found (expected 'reviewers'/'contributors' or default export or getReviewers())." },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
