'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {apiRegister, googleOAuthUrl} from '@/lib/api-auth';
import {Link, useRouter} from '@/i18n/routing';
import {Button} from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import {Input} from '@/components/ui/input';

type Props = {
  signUpWithGoogleLabel: string;
  orContinueWithLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailDescription: string;
  passwordLabel: string;
  passwordDescription: string;
  confirmPasswordLabel: string;
  confirmPasswordDescription: string;
  createAccountLabel: string;
  alreadyHaveAnAccount: string;
  signIn: string;
};

export function SignupFormClient({
  signUpWithGoogleLabel,
  orContinueWithLabel,
  emailLabel,
  emailPlaceholder,
  emailDescription,
  passwordLabel,
  passwordDescription,
  confirmPasswordLabel,
  confirmPasswordDescription,
  createAccountLabel,
  alreadyHaveAnAccount,
  signIn,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('SignupForm');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm-password') ?? '');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiRegister(email, password, locale);
      toast.success(t('registerSuccessToast'));
      router.replace('/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="outline" className="w-full" asChild>
        <a href={googleOAuthUrl(locale)}>{signUpWithGoogleLabel}</a>
      </Button>

      <FieldSeparator>{orContinueWithLabel}</FieldSeparator>

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
            <FieldDescription>{emailDescription}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">{passwordLabel}</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <FieldDescription>{passwordDescription}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">
              {confirmPasswordLabel}
            </FieldLabel>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <FieldDescription>{confirmPasswordDescription}</FieldDescription>
          </Field>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <FieldGroup>
            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : createAccountLabel}
              </Button>
              <FieldDescription className="px-6 text-center">
                {alreadyHaveAnAccount} <Link href="/login">{signIn}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>
    </div>
  );
}
