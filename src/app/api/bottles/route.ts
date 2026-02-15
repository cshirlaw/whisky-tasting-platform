import { NextResponse } from "next/server";
import { bottles } from "@/lib/bottles";

export async function GET() {
  return NextResponse.json(bottles, { status: 200 });
}
