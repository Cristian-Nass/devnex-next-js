import { NextRequest } from "next/server";
import {
  deleteSite,
  findOneSite,
  updateSite,
} from "@/lib/sites-service";
import { handle, requireUserId } from "@/lib/route-helpers";
import { BadRequest } from "@/lib/http-errors";
import { UpdateSiteSchema, flattenZodError } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

/**
 * Mirrors:
 *   GET    /api/sites/:id  → SitesController.findOne
 *   PATCH  /api/sites/:id  → SitesController.update
 *   DELETE /api/sites/:id  → SitesController.remove
 */

export async function GET(req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    const { id } = await params;
    return findOneSite(id, userId);
  });
}

export async function PATCH(req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateSiteSchema.safeParse(body);
    if (!parsed.success) throw BadRequest(flattenZodError(parsed.error));
    return updateSite(id, userId, parsed.data);
  });
}

export async function DELETE(req: NextRequest, { params }: Params): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    const { id } = await params;
    return deleteSite(id, userId);
  });
}
