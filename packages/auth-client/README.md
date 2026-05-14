# @netmart/auth-client

Server-side identity helper for sibling SaaS apps (web-builder, wp-builder, ...).

Each app gets the user's cross-subdomain cookie (`netmart_session`) for free
because netmart's backend sets it on `Domain=.netmart.se`. This package
forwards that cookie to `netmart.api/auth/introspect` and returns the safe
user payload.

## Install (workspace consumer)

```jsonc
// web-builder/package.json
{
  "dependencies": {
    "@netmart/auth-client": "file:../packages/auth-client"
  }
}
```

```ts
// web-builder/next.config.ts — Next compiles TS source from the workspace.
export default {
  transpilePackages: ["@netmart/auth-client", "@netmart/builder-core"],
};
```

## Env

```bash
PLATFORM_API_URL=http://localhost:5000/api   # dev
PLATFORM_API_URL=https://api.netmart.se/api  # prod
```

## Usage in a Next route handler

```ts
import { requireUser, UnauthorizedError } from "@netmart/auth-client";

export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return new Response("Unauthorized", { status: 401 });
    throw e;
  }
  return Response.json({ hello: user.email });
}
```

## API

| Export | Purpose |
| --- | --- |
| `requireUser(input, opts?)` | Throws `UnauthorizedError` if not signed in. |
| `getUserOrNull(input, opts?)` | Returns `null` instead of throwing. |
| `introspectSession({ cookie, authorization }, opts?)` | Low-level. |
| `hasRole(user, "admin")` | Convenience role check. |
| `PlatformUser` | Shape returned by `/auth/introspect`. |
| `UnauthorizedError`, `IntrospectConfigError` | Errors. |

`input` may be a `Request`, raw `Headers`, or a plain
`{ cookie, authorization }` — so the helper works in Node, Edge, or Workers
runtimes.
