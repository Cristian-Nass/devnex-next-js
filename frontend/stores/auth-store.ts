import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AuthUser } from "@/lib/api-auth";

type AuthStore = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  devtools((set, get) => ({
    user: null,
    setUser: (user) => {
      const prev = get().user;
      if (prev?.id === user?.id && prev?.email === user?.email) return;
      set({ user });
    },
  })),
);

export type { AuthUser };
