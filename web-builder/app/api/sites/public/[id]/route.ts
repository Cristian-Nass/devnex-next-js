import { NextRequest } from "next/server";
import { findPublicSiteById } from "@/lib/sites-service";
import { handle } from "@/lib/route-helpers";

type Params = { params: Promise<{ id: string }> };

/**
 * Mirrors GET /api/sites/public/:id → SitesController.findPublic.
 * No auth required (public read).
 */
export async function GET(_req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    return findPublicSiteById(id);
  });
}
