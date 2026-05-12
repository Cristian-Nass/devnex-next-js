import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
      const code = e.code != null ? `[${e.code}] ` : '';
      return `${code}${e.message ?? 'unknown'}`;
    })
    .join('; ');
}

@Injectable()
export class CloudflareDnsService {
  private readonly logger = new Logger(CloudflareDnsService.name);

  constructor(private readonly config: ConfigService) { }

  isPublishConfigured(): boolean {
    const zone = this.config.get<string>('CLOUDFLARE_ZONE_ID_WEB_BUILDER')?.trim();
    const token = this.config.get<string>('CLOUDFLARE_API_TOKEN_WEB_BUILDER')?.trim();
    const ip = this.config.get<string>('SERVER_PUBLIC_IP_WEB_BUILDER')?.trim();
    return Boolean(zone && token && ip);
  }

  buildRecordName(slug: string): string {
    const template =
      this.config.get<string>('CLOUDFLARE_DNS_RECORD_NAME_TEMPLATE_WEB_BUILDER')?.trim() ??
      '{slug}-{root_domain_web_builder}';
    return template.replace('{slug}', slug).replace('{root_domain_web_builder}', this.config.getOrThrow<string>('ROOT_DOMAIN_WEB_BUILDER').trim());
  }

  async createARecord(subdomain: string): Promise<string> {
    const zoneId = this.config.getOrThrow<string>('CLOUDFLARE_ZONE_ID_WEB_BUILDER').trim();
    const token = this.config.getOrThrow<string>('CLOUDFLARE_API_TOKEN_WEB_BUILDER').trim();
    const content = this.config.getOrThrow<string>('SERVER_PUBLIC_IP_WEB_BUILDER').trim();
    const proxied =
      this.config.get<string>('CLOUDFLARE_DNS_PROXIED_WEB_BUILDER', 'true').toLowerCase() ===
      'true';

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
    const body = {
      type: 'A' as const,
      name: subdomain,
      content,
      ttl: proxied ? 1 : 300,
      proxied,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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

  async deleteDnsRecord(recordId: string): Promise<void> {
    const zoneId = this.config.getOrThrow<string>('CLOUDFLARE_ZONE_ID_WEB_BUILDER').trim();
    const token = this.config.getOrThrow<string>('CLOUDFLARE_API_TOKEN_WEB_BUILDER').trim();

    const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;
    const res = await fetch(url, {
      method: 'DELETE',
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

  async deleteDnsRecordSafe(recordId: string): Promise<void> {
    try {
      await this.deleteDnsRecord(recordId);
    } catch (e) {
      this.logger.warn(
        `Could not delete Cloudflare DNS record ${recordId}: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
