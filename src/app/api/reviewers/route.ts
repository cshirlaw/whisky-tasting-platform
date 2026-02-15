import { NextResponse } from "next/server";
import { reviewers } from "@/lib/reviewers";

export async function GET() {
  return NextResponse.json(reviewers, { status: 200 });
}
