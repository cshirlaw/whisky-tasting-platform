import { NextResponse } from "next/server";
import { tastings } from "@/lib/tastings";

export async function GET() {
  return NextResponse.json(tastings, { status: 200 });
}
