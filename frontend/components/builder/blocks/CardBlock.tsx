interface CardBlockProps {
  title?: string;
  body?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export function CardBlock({
  title = 'Card Title',
  body = 'Card content goes here.',
  imageUrl,
}: CardBlockProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm">
      {imageUrl && (
        <img
          src={imageUrl as string}
          alt={title as string}
          className="h-40 w-full rounded-md object-cover"
        />
      )}
      <h3 className="text-lg font-semibold">{title as string}</h3>
      <p className="text-sm text-muted-foreground">{body as string}</p>
    </div>
  );
}
