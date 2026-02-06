import { promises as fs } from "fs";
import path from "path";

export type ReviewerLink = {
  label: string;
  url: string;
};

export type Reviewer = {
  id: string;
  type: string;
  country: string;
  language: string;
  displayName: string;
  sortName: string;
  bio: string;
  links: ReviewerLink[];
};

type ReviewersIndexEntry = { id: string; order: number };
type ReviewersIndex = { reviewers: ReviewersIndexEntry[] };

function repoRootPath(...parts: string[]) {
  return path.join(process.cwd(), ...parts);
}

export async function loadReviewersIndex(): Promise<ReviewersIndex> {
  const p = repoRootPath("data", "reviewers", "index.json");
  const raw = await fs.readFile(p, "utf-8");
  return JSON.parse(raw) as ReviewersIndex;
}

export async function loadReviewer(id: string): Promise<Reviewer> {
  const p = repoRootPath("data", "reviewers", `${id}.json`);
  const raw = await fs.readFile(p, "utf-8");
  const j = JSON.parse(raw) as Reviewer;
  return j;
}

export async function loadAllReviewers(): Promise<Reviewer[]> {
  const idx = await loadReviewersIndex();
  const ordered = [...idx.reviewers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const reviewers: Reviewer[] = [];
  for (const entry of ordered) {
    reviewers.push(await loadReviewer(entry.id));
  }
  return reviewers;
}
