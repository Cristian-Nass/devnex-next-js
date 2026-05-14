import { NextRequest } from "next/server";
import { publishSubdomain } from "@/lib/sites-service";
import { handle, requireUserId } from "@/lib/route-helpers";

type Params = { params: Promise<{ id: string }> };

/**
 * Mirrors POST /api/sites/:id/publish → SitesController.publishSubdomain.
 * Creates the Cloudflare DNS A record and flips `published = true`.
 */
export async function POST(req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    const { id } = await params;
    return publishSubdomain(id, userId);
  });
}
