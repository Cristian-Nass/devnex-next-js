import type { Metadata } from 'next';
import { getSitePayload } from '@/lib/fetch-site';
import { GtmScript } from '@/components/GtmScript';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSitePayload();
  if (!site) {
    return { title: 'Site' };
  }
  return {
    title: site.head.title,
    description: site.head.description,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSitePayload();
  const primary = site?.data.theme.primaryColor ?? '#0d9488';
  const font = site?.data.theme.fontFamily ?? 'system-ui';

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: font, color: '#0f172a', background: '#f8fafc' }}>
        {site?.head.gtmContainerId ? <GtmScript id={site.head.gtmContainerId} /> : null}
        <div style={{ borderTop: `4px solid ${primary}`, minHeight: '100vh' }}>{children}</div>
      </body>
    </html>
  );
}
