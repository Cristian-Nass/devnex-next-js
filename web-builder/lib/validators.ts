import { z } from "zod";

/**
 * zod replacements for the class-validator DTOs that lived in
 * `netmart/backend/src/sites/dto/`. Field-level constraints are identical so
 * existing client payloads continue to validate.
 */

const SLUG_RE = /^[a-z0-9-]+$/;
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export const CreateSiteSchema = z
  .object({
    name: z.string().min(1).max(100),
    slug: z
      .string()
      .min(1)
      .max(60)
      .regex(SLUG_RE, "Slug must contain only lowercase letters, numbers, and hyphens"),
    provisioningType: z.enum(["SUBDOMAIN", "CUSTOM_DOMAIN"]),
    metaTitle: z.string().max(120).optional(),
    metaDescription: z.string().max(500).optional(),
    gtmContainerId: z.string().max(32).optional(),
    customDomain: z.string().max(253).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provisioningType === "CUSTOM_DOMAIN") {
      if (!data.customDomain || !DOMAIN_RE.test(data.customDomain)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customDomain"],
          message: "Enter a valid domain (e.g. www.example.com)",
        });
      }
    }
  });

export const UpdateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  published: z.boolean().optional(),
  provisioningType: z.enum(["SUBDOMAIN", "CUSTOM_DOMAIN"]).optional(),
  metaTitle: z.string().max(120).optional(),
  metaDescription: z.string().max(500).optional(),
  gtmContainerId: z.string().max(32).optional(),
  customDomain: z.string().max(253).optional(),
});

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;
export type UpdateSiteInput = z.infer<typeof UpdateSiteSchema>;

/**
 * Translates a zod error into a 400-style `{ message }` payload. Keeps the
 * response shape stable with what Nest's `ValidationPipe` produced.
 */
export function flattenZodError(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid request body";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}
