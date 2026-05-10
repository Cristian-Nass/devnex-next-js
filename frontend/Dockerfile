# Production web (Next.js standalone). Built from npm workspace root.
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

RUN npm ci

COPY frontend ./frontend

ARG NEXT_PUBLIC_SITE_URL=
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build -w frontend

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static /app/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public /app/frontend/public

USER nextjs
WORKDIR /app/frontend

EXPOSE 3000
CMD ["node", "server.js"]
