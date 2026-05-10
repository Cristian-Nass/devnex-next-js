"use client";
import { useState } from "react";
import { signInWithEmail } from "@/lib/firebase-auth";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  loginLabel: string;
  dontHaveAnAccount: string;
  signUp: string;
};

export function LoginFormClient({
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  loginLabel,
  dontHaveAnAccount,
  signUp,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailReadOnly, setEmailReadOnly] = useState(true);
  const [passwordReadOnly, setPasswordReadOnly] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={emailPlaceholder}
            required
            autoComplete="new-password"   // Tricks browser into skipping autofill
            readOnly={emailReadOnly}
            onFocus={() => setEmailReadOnly(false)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">{passwordLabel}</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"   // Most reliable flag to block credential fill
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
          <Button type="submit">{loginLabel}</Button>
          <FieldDescription className="text-center">
            {dontHaveAnAccount} <Link href="/signup">{signUp}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}