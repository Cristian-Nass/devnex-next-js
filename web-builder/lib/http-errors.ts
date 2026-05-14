/**
 * Thin HTTP error layer for route handlers — replaces Nest's exception
 * classes (`BadRequestException`, etc.) that the source code used to throw.
 * Each helper produces an `HttpError` carrying the status code, and
 * `toResponse(err)` turns any caught error into a `Response`.
 */
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export const BadRequest = (message: string) => new HttpError(400, message);
export const Unauthorized = (message = "Unauthorized") => new HttpError(401, message);
export const Forbidden = (message = "Forbidden") => new HttpError(403, message);
export const NotFound = (message = "Not Found") => new HttpError(404, message);
export const Conflict = (message: string) => new HttpError(409, message);
export const BadGateway = (message: string) => new HttpError(502, message);

export function toResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ message: err.message }, { status: err.statusCode });
  }
  console.error("Unhandled API error:", err);
  return Response.json({ message: "Internal Server Error" }, { status: 500 });
}
