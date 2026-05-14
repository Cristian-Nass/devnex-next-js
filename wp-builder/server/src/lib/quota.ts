/**
 * Disk usage tracking via `du`.
 *
 * No kernel quota system required — the API container just runs `du -sb`
 * on each site directory every few minutes and stores the result in the DB.
 * The dashboard shows a usage bar and highlights sites that exceed their limit.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Returns the total disk usage in bytes for a directory.
 * Returns null if the directory does not exist yet.
 */
export async function getDiskUsageBytes(siteRoot: string): Promise<bigint | null> {
  try {
    const { stdout } = await execFileAsync("du", ["-sb", siteRoot], { timeout: 30_000 });
    const bytes = stdout.split("\t")[0].trim();
    return BigInt(bytes);
  } catch {
    return null;
  }
}
