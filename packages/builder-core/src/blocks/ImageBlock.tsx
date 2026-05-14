interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  [key: string]: unknown;
}

export function ImageBlock({ src, alt = 'Image', caption }: ImageBlockProps) {
  if (!src) {
    return (
      <div
        style={{
          display: 'flex',
          height: 160,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '2px dashed #cbd5e1',
          background: '#f8fafc',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Set image URL in props</span>
      </div>
    );
  }
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <img
        src={String(src)}
        alt={String(alt)}
        style={{ width: '100%', borderRadius: 12, objectFit: 'cover', display: 'block' }}
      />
      {caption && (
        <figcaption style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          {String(caption)}
        </figcaption>
      )}
    </figure>
  );
}
