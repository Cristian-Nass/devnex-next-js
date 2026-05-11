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
      style={{ backgroundColor: bgColor as string, color: textColor as string }}
      className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg px-8 py-12 text-center"
    >
      <h1 className="text-4xl font-bold leading-tight">{heading as string}</h1>
      <p className="max-w-xl text-lg opacity-90">{subheading as string}</p>
      {ctaLabel && (
        <a
          href={ctaHref as string}
          className="mt-2 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow transition-colors hover:bg-gray-100"
        >
          {ctaLabel as string}
        </a>
      )}
    </div>
  );
}
