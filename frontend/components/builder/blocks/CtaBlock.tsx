interface CtaBlockProps {
  label?: string;
  href?: string;
  variant?: string;
  [key: string]: unknown;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
};

export function CtaBlock({
  label = 'Click Here',
  href = '#',
  variant = 'primary',
}: CtaBlockProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <a
        href={href as string}
        className={`inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-semibold transition-colors ${variantClasses[variant as string] ?? variantClasses.primary}`}
      >
        {label as string}
      </a>
    </div>
  );
}
