import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function compose(
  project: string,
  composeFile: string,
  envFile: string,
  composeArgs: string[],
  opts?: { profiles?: string[]; timeoutMs?: number },
): Promise<{ stdout: string; stderr: string }> {
  const profileArgs = opts?.profiles?.flatMap((p) => ["--profile", p]) ?? [];
  const args = ["compose", "-p", project, "-f", composeFile, "--env-file", envFile, ...profileArgs, ...composeArgs];
  return execFileAsync("docker", args, {
    maxBuffer: 10 * 1024 * 1024,
    timeout: opts?.timeoutMs,
  });
}

export async function composeUp(project: string, composeFile: string, envFile: string): Promise<void> {
  // Allow up to 10 min for image pulls on first run.
  await compose(project, composeFile, envFile, ["up", "-d"], { timeoutMs: 600_000 });
}

export async function composeDown(
  project: string,
  composeFile: string,
  envFile: string,
  opts?: { swallowErrors?: boolean; removeVolumes?: boolean },
): Promise<void> {
  const subArgs = opts?.removeVolumes ? ["down", "--volumes"] : ["down"];
  try {
    await compose(project, composeFile, envFile, subArgs, { timeoutMs: 60_000 });
  } catch (e) {
    if (opts?.swallowErrors) return;
    let detail = e instanceof Error ? e.message : String(e);
    if (typeof e === "object" && e !== null && "stderr" in e) {
      const std = (e as { stderr?: Buffer }).stderr;
      const tail = Buffer.isBuffer(std) ? std.toString().trim() : "";
      if (tail) detail = `${detail}\n${tail}`;
    }
    throw new Error(`docker compose down failed (${project}): ${detail}`);
  }
}

export async function waitForWordPressFiles(
  project: string,
  composeFile: string,
  envFile: string,
  timeoutMs = 180_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await compose(
        project,
        composeFile,
        envFile,
        ["exec", "-T", "wordpress", "test", "-f", "/var/www/html/wp-includes/version.php"],
        { timeoutMs: 10_000 },
      );
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Timed out waiting for WordPress core files in volume.");
}

/** Ensures Apache (www-data) can write uploads/plugins under bind-mounted wp-content. */
export async function composeChownWpContent(
  project: string,
  composeFile: string,
  envFile: string,
): Promise<void> {
  await compose(
    project,
    composeFile,
    envFile,
    ["exec", "-T", "--user", "0", "wordpress", "chown", "-R", "www-data:www-data", "/var/www/html/wp-content"],
    { timeoutMs: 30_000 },
  );
}

export async function wpCoreInstall(opts: {
  project: string;
  composeFile: string;
  envFile: string;
  url: string;
  title: string;
  adminUser: string;
  adminPassword: string;
  adminEmail: string;
}): Promise<void> {
  await compose(
    opts.project,
    opts.composeFile,
    opts.envFile,
    [
      "run",
      "--rm",
      "--no-deps",
      "wpcli",
      "wp",
      "core",
      "install",
      `--url=${opts.url}`,
      `--title=${opts.title}`,
      `--admin_user=${opts.adminUser}`,
      `--admin_password=${opts.adminPassword}`,
      `--admin_email=${opts.adminEmail}`,
      "--skip-email",
    ],
    { profiles: ["cli"], timeoutMs: 120_000 },
  );
}
