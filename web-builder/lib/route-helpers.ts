import {
  UnauthorizedError,
  IntrospectConfigError,
  requireUser as authRequireUser,
  type PlatformUser,
} from "@netmart/auth-client";
import { toResponse, Unauthorized } from "./http-errors";

/**
 * Route-handler conveniences:
 *
 *   - `handle(fn)` wraps a thunk in standard try/catch + JSON response.
 *   - `requireUserId(req)` returns the authenticated user's id or throws an
 *     `Unauthorized` HttpError that `handle()` catches.
 */

export async function handle(
  fn: () => Promise<unknown>,
  init?: ResponseInit,
): Promise<Response> {
  try {
    const result = await fn();
    if (result instanceof Response) return result;
    if (result === undefined || result === null) {
      return new Response(null, { status: 204 });
    }
    return Response.json(result, init);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof IntrospectConfigError) {
      console.error("[auth] PLATFORM_API_URL misconfigured:", err.message);
      return Response.json({ message: "Auth service misconfigured" }, { status: 500 });
    }
    return toResponse(err);
  }
}

export async function requireUserId(req: Request): Promise<string> {
  const user = await requireAuthUser(req);
  return user.id;
}

export async function requireAuthUser(req: Request): Promise<PlatformUser> {
  try {
    return await authRequireUser(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) throw Unauthorized();
    throw err;
  }
}
