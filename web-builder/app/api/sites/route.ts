import { NextRequest } from "next/server";
import {
  createSite,
  findAllSites,
} from "@/lib/sites-service";
import { handle, requireUserId } from "@/lib/route-helpers";
import { BadRequest } from "@/lib/http-errors";
import { CreateSiteSchema, flattenZodError } from "@/lib/validators";

/**
 * Mirrors:
 *   GET  /api/sites  → SitesController.findAll
 *   POST /api/sites  → SitesController.create
 */

export async function GET(req: NextRequest): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    return findAllSites(userId);
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  return handle(async () => {
    const userId = await requireUserId(req);
    const body = await req.json();
    const parsed = CreateSiteSchema.safeParse(body);
    if (!parsed.success) throw BadRequest(flattenZodError(parsed.error));
    return createSite(userId, parsed.data);
  });
}
