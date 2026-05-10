"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { signOut as signOutFirebase } from "@/lib/firebase-auth";

type Props = {
  locale: string;
  loginLabel: string;
  logoutLabel: string;
  className: string;
};

export function NavigationBarAuth({
  locale,
  loginLabel,
  logoutLabel,
  className,
}: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <Button variant="outline" size="lg" className={cn(className)} asChild>
        <Link href={`/${locale}/login`}>{loginLabel}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(className)}
      onClick={() => void signOutFirebase()}
    >
      {logoutLabel}
    </Button>
  );
}
