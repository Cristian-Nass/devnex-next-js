"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiResetPassword } from "@/lib/api-auth";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function ResetPasswordFallback() {
  const t = useTranslations("AuthResetPassword");
  return (
    <p className="text-center text-muted-foreground text-sm">
      {t("loadingFallback")}
    </p>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("AuthResetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t("invalidLink"));
      return;
    }
    if (password.length < 8) {
      setError(t("errorTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("errorMismatch"));
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(token, password);
      setDone(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-destructive text-sm" role="alert">
          {t("invalidLink")}
        </p>
        <Button asChild variant="outline">
          <Link href="/forgot-password">{t("forgotPassword")}</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("successTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("successDescription")}</p>
        <Button asChild>
          <Link href="/login">{t("goToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">{t("formTitle")}</h1>
        <p className="mt-2 text-muted-foreground text-sm">{t("formDescription")}</p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">{t("newPassword")}</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">{t("confirmPassword")}</FieldLabel>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("saving") : t("updatePassword")}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
