/**
 * Public configuration shared by client and server. The variables here are
 * inlined into the client bundle by Next.js (must be `NEXT_PUBLIC_*`).
 *
 * `NEXT_PUBLIC_WP_BUILDER_API_URL` points at the Fastify control plane
 * (e.g. `http://localhost:3001` in dev, `https://wp-api.netmart.se` in
 * prod). The browser sends every request `credentials: "include"` so the
 * `netmart_session` cookie travels along.
 */
export const WP_BUILDER_API_URL =
  process.env.NEXT_PUBLIC_WP_BUILDER_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:3001";
