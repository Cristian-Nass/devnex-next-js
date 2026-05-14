# syntax=docker/dockerfile:1.7
#
# Production image for the web-builder editor.
#
# Build context is the MONOREPO ROOT (D:\Programing\netmart) so the build can
# see the sibling `packages/*` workspaces (@netmart/auth-client and
# @netmart/builder-core) that web-builder consumes via `transpilePackages`.
#
#   docker build -f web-builder/Dockerfile -t netmart/web-builder:latest .
#
# Or (preferred) via the standalone docker-compose:
#
#   cd web-builder && docker compose up -d --build
#
# Notes:
# - `next.config.ts` has `output: "standalone"` and `outputFileTracingRoot:
#   path.join(__dirname, "..")`, so Next emits a minimal node_modules tree
#   under `.next/standalone/` that already includes the workspace packages.
# - The image is built from the workspace root specifically so that emission
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

# Some workspaces (web-viewer) exist in the root `workspaces` list. Copying
# their manifests too keeps `npm ci` from complaining about a missing
# workspace; their source isn't included so they won't be built.
COPY web-viewer/package.json web-viewer/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspaces --include-workspace-root=false

# ───────────── builder ─────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/packages/auth-client/node_modules ./packages/auth-client/node_modules
COPY --from=deps /repo/packages/builder-core/node_modules ./packages/builder-core/node_modules
COPY --from=deps /repo/web-builder/node_modules ./web-builder/node_modules

# Now copy source. .dockerignore in each workspace keeps this slim.
COPY packages ./packages
COPY web-builder ./web-builder
COPY package.json ./

ARG NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE=
ARG NEXT_PUBLIC_PLATFORM_FRONTEND_URL=
ENV NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE=${NEXT_PUBLIC_PLATFORM_SUBDOMAIN_BASE} \
    NEXT_PUBLIC_PLATFORM_FRONTEND_URL=${NEXT_PUBLIC_PLATFORM_FRONTEND_URL} \
    NEXT_TELEMETRY_DISABLED=1

# Run build using npm workspace filter so prisma generate + next build only
# touch web-builder. Workspace deps are already linked from the deps stage.
RUN npm run build --workspace=web-builder

# ───────────── runner ─────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# The standalone bundle Next emits already contains a pruned node_modules
# with only the runtime closure (including the linked workspace packages).
COPY --from=builder --chown=nextjs:nodejs /repo/web-builder/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/web-builder/.next/static ./web-builder/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/web-builder/public ./web-builder/public
# Prisma migrations needed for `prisma migrate deploy` at boot in entrypoint.sh
# (or run via init container in compose). Schema is needed because the
# Prisma runtime engine resolves it at startup.
COPY --from=builder --chown=nextjs:nodejs /repo/web-builder/prisma ./web-builder/prisma

USER nextjs
WORKDIR /app/web-builder

EXPOSE 3001
CMD ["node", "server.js"]
