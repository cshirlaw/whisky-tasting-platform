import { NextResponse } from "next/server";
import { loadBottleSummaries } from "@/lib/bottles";

export async function GET() {
  const data = await loadBottleSummaries();
  return NextResponse.json(data, { status: 200 });
}
