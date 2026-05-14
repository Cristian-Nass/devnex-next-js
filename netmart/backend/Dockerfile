# Production Nest API — build context must stay the **monorepo root**
# (`compose.yml` uses `context: .`) so npm workspaces resolve like locally.
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci

COPY backend ./backend

# prisma generate reads prisma.config.ts; env() requires DATABASE_URL (no TCP connect).
ENV DATABASE_URL="postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public"
RUN npm run build -w backend

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

EXPOSE 3001

CMD ["sh", "-lc", "cd backend && npx prisma migrate deploy && node dist/main.js"]
