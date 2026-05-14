interface CtaBlockProps {
  label?: string;
  href?: string;
  variant?: string;
  bgColor?: string;
  [key: string]: unknown;
}

const variantStyles: Record<string, { background: string; color: string; border?: string }> = {
  primary: { background: '#0f172a', color: '#ffffff' },
  secondary: { background: '#f1f5f9', color: '#0f172a' },
  outline: { background: 'transparent', color: '#0f172a', border: '1px solid #e2e8f0' },
};

export function CtaBlock({
  label = 'Click Here',
  href = '#',
  variant = 'primary',
  bgColor = 'transparent',
}: CtaBlockProps) {
  const style = variantStyles[String(variant)] ?? variantStyles.primary;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: String(bgColor),
        borderRadius: 12,
      }}
    >
      <a
        href={String(href)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textDecoration: 'none',
          ...style,
        }}
      >
        {String(label)}
      </a>
    </div>
  );
}
