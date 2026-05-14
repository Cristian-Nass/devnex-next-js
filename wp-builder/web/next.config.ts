import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // Walks up to the workspace root so the standalone tracer includes the
  // sibling `packages/*` workspaces (`@netmart/auth-client`).
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
  // TS-source workspace package — Next compiles it on the fly.
  transpilePackages: ["@netmart/auth-client"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
