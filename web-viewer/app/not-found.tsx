import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ maxWidth: 560, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Page or site not found</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        No published site was found for this address. Check that the site is published and that{' '}
        <code>ROOT_DOMAIN_WEB_BUILDER</code> and <code>SITE_API_URL</code> are configured correctly.
      </p>
      <Link href="/" style={{ color: '#0f172a', fontWeight: 600 }}>
        Home
      </Link>
    </main>
  );
}
