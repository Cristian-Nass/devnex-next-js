"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { apiGetMe, saveToken } from "@/lib/api-auth";
import { useAuthStore } from "@/stores/auth-store";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    // redirectTo comes from the OAuth state we encoded on the frontend
    const redirectTo = (searchParams.get("redirectTo") ?? "/home") as "/home" | "/login";

    if (!token) {
      setError("Missing token");
      router.replace("/login");
      return;
    }

    saveToken(token);
    void apiGetMe(token).then((user) => {
      if (!user) {
        setError("Could not load your account");
        router.replace("/login");
        return;
      }
      useAuthStore.getState().setUser(user);
      router.replace(redirectTo === "/login" ? "/login" : "/home");
    });
  }, [router, searchParams]);

  if (error) {
    return (
      <p className="text-center text-destructive text-sm" role="alert">
        {error}
      </p>
    );
  }

  return (
    <p className="text-center text-muted-foreground text-sm">Signing you in…</p>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-muted-foreground text-sm">Loading…</p>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
