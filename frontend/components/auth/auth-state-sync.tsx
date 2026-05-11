"use client";

import { useEffect } from "react";
import { apiGetMe, getToken } from "@/lib/api-auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Mounts once at the app root. Reads the stored access token from localStorage
 * and hydrates the auth store by fetching the current user from the API.
 * On failure (expired / revoked token) the token is cleared automatically.
 */
export function AuthStateSync() {
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiGetMe(token).then((user) => {
      useAuthStore.getState().setUser(user);
    });
  }, []);

  return null;
}
