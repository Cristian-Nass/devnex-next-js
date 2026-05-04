"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";

export function AuthStateSync() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      useAuthStore.getState().setUser(user);
    });
    return () => unsub();
  }, []);

  return null;
}
