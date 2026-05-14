interface CardBlockProps {
  title?: string;
  body?: string;
  imageUrl?: string;
  bgColor?: string;
  fontColor?: string;
  [key: string]: unknown;
}

export function CardBlock({
  title = 'Card Title',
  body = 'Card content goes here.',
  imageUrl,
  bgColor = '#ffffff',
  fontColor = '#0f172a',
}: CardBlockProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: 20,
        background: String(bgColor),
        color: String(fontColor),
        boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
      }}
    >
      {imageUrl && (
        <img
          src={String(imageUrl)}
          alt={String(title)}
          style={{ height: 160, width: '100%', borderRadius: 8, objectFit: 'cover' }}
        />
      )}
      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{String(title)}</h3>
      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.6, fontSize: '0.875rem' }}>
        {String(body)}
      </p>
    </div>
  );
}
