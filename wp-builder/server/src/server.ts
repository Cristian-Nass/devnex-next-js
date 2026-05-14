import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./config.js";
import { sitesRoutes } from "./routes/sites.js";
import { authenticate, type PlatformUser } from "./lib/platform-auth.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    /** Populated by `app.authenticate` (see `lib/platform-auth.ts`). */
    user: PlatformUser;
  }
}

export async function buildServer() {
  const app = Fastify({ logger: true });

  // Cross-origin from the wp-builder Next.js dashboard. Credentials must be
  // allowed so the browser sends the `netmart_session` cookie that
  // `app.authenticate` validates against netmart's `/auth/introspect`.
  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  // The cookie plugin still parses incoming `Cookie` headers (we don't
  // _set_ any cookies anymore — netmart owns the session cookie).
  await app.register(cookie);

  app.decorate("authenticate", authenticate);

  app.get("/api/public/meta", async () => ({ rootDomain: env.ROOT_DOMAIN }));
  app.get("/api/health", async () => ({ ok: true }));

  app.register(
    async (api) => {
      await api.register(sitesRoutes, { prefix: "/sites" });
    },
    { prefix: "/api" },
  );

  return app;
}
