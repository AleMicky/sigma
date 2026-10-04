import { colors, darkColors, lightColors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export * from "./colors";
export * from "./radius";
export * from "./shadows";
export * from "./spacing";
export * from "./typography";
export { useAppTheme } from "@/hooks/useAppTheme";
export { useThemeStore, type ThemeMode } from "@/store/useThemeStore";

export const theme = {
  colors,
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;