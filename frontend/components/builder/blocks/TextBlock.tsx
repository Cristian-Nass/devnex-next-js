interface TextBlockProps {
  content?: string;
  align?: string;
  [key: string]: unknown;
}

export function TextBlock({
  content = 'Write your content here...',
  align = 'left',
}: TextBlockProps) {
  return (
    <div className={`text-${align as string} p-4`}>
      <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {content as string}
      </p>
    </div>
  );
}
