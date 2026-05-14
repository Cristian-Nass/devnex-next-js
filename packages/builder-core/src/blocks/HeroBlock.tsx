interface HeroBlockProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgColor?: string;
  textColor?: string;
  [key: string]: unknown;
}

export function HeroBlock({
  heading = 'Welcome',
  subheading = 'Your subtitle here',
  ctaLabel = 'Get started',
  ctaHref = '#',
  bgColor = '#1e293b',
  textColor = '#ffffff',
}: HeroBlockProps) {
  return (
    <div
      style={{
        backgroundColor: String(bgColor),
        color: String(textColor),
        borderRadius: 12,
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: 200,
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {String(heading)}
      </h1>
      <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem', maxWidth: 560 }}>
        {String(subheading)}
      </p>
      {ctaLabel && (
        <a
          href={String(ctaHref)}
          style={{
            marginTop: 8,
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: 8,
            background: '#ffffff',
            color: '#0f172a',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {String(ctaLabel)}
        </a>
      )}
    </div>
  );
}
