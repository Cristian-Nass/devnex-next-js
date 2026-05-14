/**
 * Minimal ambient declaration so this package type-checks in isolation
 * without depending on `@types/node`. Consumers (Next.js apps) already
 * provide a full `process` global.
 */
declare const process: {
  env: Record<string, string | undefined>;
};
