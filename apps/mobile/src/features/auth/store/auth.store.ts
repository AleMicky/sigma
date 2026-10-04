import { create } from "zustand";

import type { AuthUser } from "@/features/auth/types/auth.types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setUser: (user: AuthUser | null) => void;

  setInitialized: (
    initialized: boolean
  ) => void;

  clear: () => void;
};

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    isAuthenticated: false,

    isInitialized: false,

    setUser: (user) =>
      set({
        user,
        isAuthenticated: Boolean(user),
      }),

    setInitialized: (isInitialized) =>
      set({
        isInitialized,
      }),

    clear: () =>
      set({
        user: null,
        isAuthenticated: false,
      }),
  }));