'use client';

import {useState} from 'react';
import {apiForgotPassword} from '@/lib/api-auth';
import {Link} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {useLocale} from 'next-intl';

type Props = {
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  backToLogin: string;
  successTitle: string;
  successDescription: string;
};

export function ForgotPasswordFormClient({
  emailLabel,
  emailPlaceholder,
  submitLabel,
  backToLogin,
  successTitle,
  successDescription,
}: Props) {
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');

    setLoading(true);
    try {
      await apiForgotPassword(email, locale);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-medium text-lg">{successTitle}</h2>
        <p className="text-muted-foreground text-sm">{successDescription}</p>
        <Button asChild variant="outline">
          <Link href="/login">{backToLogin}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={emailPlaceholder}
            required
            autoComplete="email"
          />
        </Field>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : submitLabel}
          </Button>
          <FieldDescription className="text-center">
            <Link href="/login">{backToLogin}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
