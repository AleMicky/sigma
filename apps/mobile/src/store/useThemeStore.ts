import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: "system",
  setThemeMode: (mode) => set({ themeMode: mode }),
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === "dark" ? "light" : "dark",
    })),
}));
