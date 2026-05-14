import { NextRequest } from "next/server";
import { findPublicSitePayloadByHost } from "@/lib/sites-service";
import { handle } from "@/lib/route-helpers";

type Params = { params: Promise<{ hostname: string }> };

/**
 * Mirrors GET /api/sites/public/by-host/:hostname →
 * SitesController.findPublicByHost. This is the hot path that web-viewer
 * calls on every request to render published sites. No auth required.
 *
 * The route segment value is URL-encoded by Next; we decode before passing
 * to the resolver so dots and hyphens round-trip correctly.
 */
export async function GET(_req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const { hostname } = await params;
    return findPublicSitePayloadByHost(decodeURIComponent(hostname));
  });
}
