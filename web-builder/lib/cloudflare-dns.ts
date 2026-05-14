/**
 * Cloudflare DNS helper — direct port of
 * `netmart/backend/src/sites/cloudflare-dns.service.ts` into a stateless
 * module (no DI container needed in Next route handlers).
 *
 * Env vars keep the `_WEB_BUILDER` suffix so existing netmart secrets can
 * be copied across without renaming.
 */

type CfDnsResponse = {
  success: boolean;
  errors?: { code?: number; message?: string }[];
  result?: { id: string };
};

function formatCfErrors(
  errors: { code?: number; message?: string }[] | undefined,
  fallback: string,
): string {
  if (!errors?.length) return fallback;
  return errors
    .map((e) => {
      const code = e.code != null ? `[${e.code}] ` : "";
      return `${code}${e.message ?? "unknown"}`;
    })
    .join("; ");
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function isPublishConfigured(): boolean {
  const zone = process.env.CLOUDFLARE_ZONE_ID_WEB_BUILDER?.trim();
  const token = process.env.CLOUDFLARE_API_TOKEN_WEB_BUILDER?.trim();
  const ip = process.env.SERVER_PUBLIC_IP_WEB_BUILDER?.trim();
  return Boolean(zone && token && ip);
}

export function buildRecordName(slug: string): string {
  const template =
    process.env.CLOUDFLARE_DNS_RECORD_NAME_TEMPLATE_WEB_BUILDER?.trim() ??
    "{slug}-{root_domain_web_builder}";
  const rootDomain = requireEnv("ROOT_DOMAIN_WEB_BUILDER");
  return template.replace("{slug}", slug).replace("{root_domain_web_builder}", rootDomain);
}

export async function createARecord(subdomain: string): Promise<string> {
  const zoneId = requireEnv("CLOUDFLARE_ZONE_ID_WEB_BUILDER");
  const token = requireEnv("CLOUDFLARE_API_TOKEN_WEB_BUILDER");
  const content = requireEnv("SERVER_PUBLIC_IP_WEB_BUILDER");
  // Both `CLOUDFLARE_DNS_PROXIED_WEB_BUILDER` and the legacy unsuffixed
  // `CLOUDFLARE_DNS_PROXIED` are honoured for migration compatibility.
  const proxied =
    (
      process.env.CLOUDFLARE_DNS_PROXIED_WEB_BUILDER ??
      process.env.CLOUDFLARE_DNS_PROXIED ??
      "true"
    )
      .toLowerCase() === "true";

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const body = {
    type: "A" as const,
    name: subdomain,
    content,
    ttl: proxied ? 1 : 300,
    proxied,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: CfDnsResponse;
  try {
    data = (await res.json()) as CfDnsResponse;
  } catch {
    throw new Error(`Cloudflare DNS failed: HTTP ${res.status} ${res.statusText}`);
  }

  if (!res.ok || !data.success || !data.result?.id) {
    const msg = formatCfErrors(data.errors, `${res.status} ${res.statusText}`);
    throw new Error(`Cloudflare DNS failed: ${msg}`);
  }
  return data.result.id;
}

export async function deleteDnsRecord(recordId: string): Promise<void> {
  const zoneId = requireEnv("CLOUDFLARE_ZONE_ID_WEB_BUILDER");
  const token = requireEnv("CLOUDFLARE_API_TOKEN_WEB_BUILDER");

  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  let data: CfDnsResponse;
  try {
    data = (await res.json()) as CfDnsResponse;
  } catch {
    throw new Error(`Cloudflare DNS delete failed: HTTP ${res.status} ${res.statusText}`);
  }

  if (!res.ok || !data.success) {
    const msg = formatCfErrors(data.errors, `${res.status} ${res.statusText}`);
    throw new Error(`Cloudflare DNS delete failed: ${msg}`);
  }
}

export async function deleteDnsRecordSafe(recordId: string): Promise<void> {
  try {
    await deleteDnsRecord(recordId);
  } catch (e) {
    console.warn(
      `[cloudflare-dns] could not delete record ${recordId}:`,
      e instanceof Error ? e.message : e,
    );
  }
}
