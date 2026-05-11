interface ImageBlockProps {
  src?: string;
  alt?: string;
  caption?: string;
  [key: string]: unknown;
}

export function ImageBlock({ src, alt = 'Image', caption }: ImageBlockProps) {
  if (!src) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted">
        <span className="text-sm text-muted-foreground">Set image URL in props</span>
      </div>
    );
  }
  return (
    <figure className="flex flex-col gap-2">
      <img
        src={src as string}
        alt={alt as string}
        className="w-full rounded-lg object-cover"
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground">
          {caption as string}
        </figcaption>
      )}
    </figure>
  );
}
