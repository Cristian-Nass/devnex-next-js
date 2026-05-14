# @netmart/builder-core

Shared block components, page renderer, and JSON types used by:

- **web-builder** — the editor that produces `Site.data` JSON
- **web-viewer** — the public renderer that displays it on `{slug}.publish.netmart.se` or a custom domain

Single source of truth: any new block type goes here so the editor and viewer
stay in sync automatically.

## Install (workspace consumer)

```jsonc
// web-builder/package.json
{
  "dependencies": {
    "@netmart/builder-core": "file:../packages/builder-core"
  }
}
```

```ts
// web-builder/next.config.ts — Next compiles TS source from the workspace.
export default {
  transpilePackages: ["@netmart/builder-core", "@netmart/auth-client"],
};
```

## Imports

```ts
// Runtime — for both editor and viewer
import { PageRenderer, BlockRenderer, BLOCK_REGISTRY } from "@netmart/builder-core";
import type { Page, SiteData, SitePayload } from "@netmart/builder-core";

// Editor-only metadata (defaults, prop schema, labels, icons)
import {
  BLOCK_DEFAULTS,
  BLOCK_LABELS,
  BLOCK_ICONS,
  BLOCK_PROP_SCHEMA,
} from "@netmart/builder-core/editor";
import type { PropField, Site, SiteSummary, ProvisioningType } from "@netmart/builder-core/editor";
```

## Adding a new block type

1. Add `XyzBlock.tsx` under `src/blocks/`.
2. Register it in `src/blocks/registry.tsx` (`BLOCK_REGISTRY`).
3. Add `'xyz'` to `BlockType` in `src/types.ts`.
4. Add defaults / label / icon / prop schema in `src/editor-types.ts`.
