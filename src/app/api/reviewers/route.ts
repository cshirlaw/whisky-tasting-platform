import { NextResponse } from "next/server";
import { loadAllReviewers } from "@/lib/reviewers";

export async function GET() {
  const data = await loadAllReviewers();
  return NextResponse.json(data, { status: 200 });
}
