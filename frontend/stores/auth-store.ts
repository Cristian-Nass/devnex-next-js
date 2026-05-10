import { create } from "zustand";
import type { User } from "firebase/auth";
import { devtools } from "zustand/middleware";
export type AuthUser = Pick<User, "uid" | "email">;

type AuthStore = {
  user: AuthUser | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>()(devtools((set, get) => ({
  user: null,
  setUser: (user) => {
    const next = user
      ? { uid: user.uid, email: user.email }
      : null;
    const prev = get().user;
    if (prev?.uid === next?.uid && prev?.email === next?.email) return;
    set({ user: next });
  },
})));
