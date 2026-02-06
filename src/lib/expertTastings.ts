import { promises as fs } from "fs";
import path from "path";

export type ExpertTasting = {
  fileRelPath: string;
  filename: string;
  contributorId?: string;
  contributorName?: string;
  contributorTier?: string;
  whiskyLabel?: string;
};

function repoRootPath(...parts: string[]) {
  return path.join(process.cwd(), ...parts);
}

async function listJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(d: string) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".json")) {
        out.push(full);
      }
    }
  }

  await walk(dir);
  return out.sort();
}

function safeString(x: unknown): string | undefined {
  if (typeof x === "string" && x.trim()) return x.trim();
  return undefined;
}

function deriveWhiskyLabel(j: any): string | undefined {
  const a =
    safeString(j?.whisky?.name) ||
    safeString(j?.whisky?.display_name) ||
    safeString(j?.whisky?.bottle_name) ||
    safeString(j?.whisky?.title) ||
    safeString(j?.whisky?.id);

  if (a) return a;

  const b =
    safeString(j?.whisky_name) ||
    safeString(j?.title) ||
    safeString(j?.name);

  return b;
}

export async function loadExpertTastings(): Promise<ExpertTasting[]> {
  const baseDir = repoRootPath("data", "tastings", "experts");
  const files = await listJsonFiles(baseDir);

  const items: ExpertTasting[] = [];
  for (const full of files) {
    const raw = await fs.readFile(full, "utf-8");
    const j = JSON.parse(raw);

    const contributor = j?.contributor;
    const contributorId = safeString(contributor?.id);
    const contributorName = safeString(contributor?.name);
    const contributorTier = safeString(contributor?.tier);

    const fileRelPath = path.relative(process.cwd(), full);
    const filename = path.basename(full);

    items.push({
      fileRelPath,
      filename,
      contributorId,
      contributorName,
      contributorTier,
      whiskyLabel: deriveWhiskyLabel(j),
    });
  }

  return items;
}

export async function loadExpertTastingsByContributorId(id: string): Promise<ExpertTasting[]> {
  const all = await loadExpertTastings();
  return all.filter((t) => t.contributorId === id);
}
