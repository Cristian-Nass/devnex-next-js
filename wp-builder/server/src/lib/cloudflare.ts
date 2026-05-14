import { env } from "../config.js";

type CfDnsResponse = {
  success: boolean;
  errors?: { message: string }[];
  result?: { id: string };
};

export async function createARecord(subdomain: string): Promise<string> {
  const url = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`;
  const body = {
    type: "A",
    name: subdomain,
    content: env.SERVER_PUBLIC_IP,
    // Cloudflare requires ttl=1 (Auto) for proxied records; ignored anyway but avoids validation errors.
    ttl: env.CLOUDFLARE_DNS_PROXIED ? 1 : 300,
    proxied: env.CLOUDFLARE_DNS_PROXIED,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && !res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Cloudflare DNS failed: HTTP ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as CfDnsResponse;
  if (!data.success || !data.result?.id) {
    const msg = data.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`Cloudflare DNS failed: ${msg}`);
  }
  return data.result.id;
}

export async function deleteDnsRecord(recordId: string): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
  });

  if (!res.ok && !res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`Cloudflare DNS delete failed: HTTP ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as CfDnsResponse;
  if (!data.success) {
    const msg = data.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`Cloudflare DNS delete failed: ${msg}`);
  }
}
