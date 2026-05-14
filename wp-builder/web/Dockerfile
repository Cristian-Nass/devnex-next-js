# syntax=docker/dockerfile:1.7
#
# Production image for the wp-builder Next.js dashboard.
#
# Build context is the MONOREPO ROOT (D:\Programing\netmart) so the build
# can see the sibling `packages/auth-client` workspace consumed via
# `transpilePackages`. Mirrors web-builder/Dockerfile — see that file for
# the rationale comments.
#
#   docker build -f wp-builder/web/Dockerfile -t netmart/wp-builder-web:latest .
#
# Or via the standalone docker-compose:
#
#   cd wp-builder && docker compose up -d --build web
#
# Notes:
# - `next.config.ts` has `output: "standalone"` and
#   `outputFileTracingRoot: path.join(__dirname, "..", "..")`, so Next emits
#   a minimal node_modules tree under `.next/standalone/` that already
#   includes the workspace package.
# - The image is built from the workspace root specifically so the trace
#   works at build time; the runner only copies `.next/standalone/`.

ARG NODE_VERSION=22-alpine

# ───────────── deps ─────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /repo

# Install only what is needed to resolve the workspace graph: root + every
# workspace package.json. Copying just manifests keeps the layer cache warm
# across source-only edits.
COPY package.json package-lock.json* ./
COPY packages/auth-client/package.json packages/auth-client/
COPY packages/builder-core/package.json packages/builder-core/
COPY web-builder/package.json web-builder/
COPY web-viewer/package.json web-viewer/
COPY wp-builder/web/package.json wp-builder/web/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspaces --include-workspace-root=false

# ───────────── builder ─────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/auth-client/node_modules ./packages/auth-client/node_modules
COPY --from=deps /repo/wp-builder/web/node_modules ./wp-builder/web/node_modules

# Now copy source. .dockerignore in each workspace keeps this slim.
COPY packages ./packages
COPY wp-builder/web ./wp-builder/web
COPY package.json ./

ARG NEXT_PUBLIC_PLATFORM_FRONTEND_URL=
ARG NEXT_PUBLIC_WP_BUILDER_API_URL=
ENV NEXT_PUBLIC_PLATFORM_FRONTEND_URL=${NEXT_PUBLIC_PLATFORM_FRONTEND_URL} \
    NEXT_PUBLIC_WP_BUILDER_API_URL=${NEXT_PUBLIC_WP_BUILDER_API_URL} \
    NEXT_TELEMETRY_DISABLED=1

# Run build using npm workspace filter so next build only touches wp-builder/web.
# Workspace deps are already linked from the deps stage.
RUN npm run build --workspace=wp-builder-web

# ───────────── runner ─────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3003 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# The standalone bundle Next emits already contains a pruned node_modules
# with only the runtime closure (including the linked workspace package).
COPY --from=builder --chown=nextjs:nodejs /repo/wp-builder/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/wp-builder/web/.next/static ./wp-builder/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/wp-builder/web/public ./wp-builder/web/public

USER nextjs
WORKDIR /app/wp-builder/web

EXPOSE 3003
CMD ["node", "server.js"]
