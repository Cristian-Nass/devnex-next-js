"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { apiLogin, googleOAuthUrl, saveToken } from "@/lib/api-auth";
import { useAuthStore } from "@/stores/auth-store";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  loginWithGoogleLabel: string;
  orContinueWithLabel: string;
  forgotPasswordLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  loginLabel: string;
  dontHaveAnAccount: string;
  signUp: string;
};

export function LoginFormClient({
  loginWithGoogleLabel,
  orContinueWithLabel,
  forgotPasswordLabel,
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  loginLabel,
  dontHaveAnAccount,
  signUp,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      const { access_token, user } = await apiLogin(email, password);
      saveToken(access_token);
      useAuthStore.getState().setUser(user);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Button variant="outline" className="w-full" asChild>
        <a href={googleOAuthUrl(locale)}>{loginWithGoogleLabel}</a>
      </Button>

      <FieldSeparator>{orContinueWithLabel}</FieldSeparator>

      <form onSubmit={(e) => void onSubmit(e)} autoComplete="off">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={emailPlaceholder}
              required
              autoComplete="new-password"
              readOnly={emailReadOnly}
              onFocus={() => setEmailReadOnly(false)}
            />
          </Field>

          <Field>
            <div className="flex w-full flex-row items-center justify-between gap-2">
              <FieldLabel htmlFor="password">{passwordLabel}</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-muted-foreground text-xs underline-offset-4 hover:text-primary hover:underline"
              >
                {forgotPasswordLabel}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              readOnly={passwordReadOnly}
              onFocus={() => setPasswordReadOnly(false)}
            />
          </Field>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : loginLabel}
            </Button>
            <FieldDescription className="text-center">
              {dontHaveAnAccount} <Link href="/signup">{signUp}</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
