import { NextResponse } from "next/server";
import { listAllTastings } from "@/lib/tastings";

export async function GET() {
  const data = listAllTastings().map(({ slug, tasting }) => ({ slug, tasting }));
  return NextResponse.json(data, { status: 200 });
}
