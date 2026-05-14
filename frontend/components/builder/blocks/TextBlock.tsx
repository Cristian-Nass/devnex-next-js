interface TextBlockProps {
  content?: string;
  align?: string;
  bgColor?: string;
  [key: string]: unknown;
}

export function TextBlock({
  content = 'Write your content here...',
  align = 'left',
  bgColor = 'transparent',
}: TextBlockProps) {
  return (
    <div
      style={{
        padding: 16,
        textAlign: align as 'left' | 'center' | 'right',
        backgroundColor: String(bgColor),
        borderRadius: 12,
      }}
    >
      <p
        style={{
          margin: 0,
          lineHeight: 1.65,
          fontSize: '1rem',
          whiteSpace: 'pre-wrap',
        }}
      >
        {String(content)}
      </p>
    </div>
  );
}
