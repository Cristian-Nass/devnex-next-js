"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiVerifyEmail } from "@/lib/api-auth";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

function VerifyEmailFallback() {
  const t = useTranslations("AuthVerifyEmail");
  return (
    <p className="text-center text-muted-foreground text-sm">
      {t("loadingFallback")}
    </p>
  );
}

function VerifyEmailContent() {
  const t = useTranslations("AuthVerifyEmail");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("err");
      return;
    }

    void apiVerifyEmail(token)
      .then(() => {
        setStatus("ok");
      })
      .catch(() => {
        setStatus("err");
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <p className="text-center text-muted-foreground text-sm">{t("loading")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        {status === "ok" ? t("titleSuccess") : t("titleError")}
      </h1>
      <p
        className={
          status === "err"
            ? "text-destructive text-sm"
            : "text-muted-foreground text-sm"
        }
      >
        {status === "ok"
          ? t("successDescription")
          : searchParams.get("token")
            ? t("errorVerificationFailed")
            : t("missingToken")}
      </p>
      <Button asChild>
        <Link href="/login">{t("continueToLogin")}</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
