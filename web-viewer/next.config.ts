import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root — needed so Turbopack can resolve the hoisted `next`
// package via npm workspaces. Without it Turbopack errors with
// "We couldn't find the Next.js package (next/package.json) from
// the project directory".
const monorepoRoot = path.join(rootDir, '..');

const nextConfig: NextConfig = {
  output: 'standalone',
  /** Keeps `.next/standalone` flat when this app lives inside a larger repo with another lockfile. */
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
