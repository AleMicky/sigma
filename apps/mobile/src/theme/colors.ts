export const lightColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  background: "#FFFFFF",
  surface: "#F9FAFB",
  surfaceSecondary: "#F3F4F6",

  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  border: "#E5E7EB",
  borderDark: "#D1D5DB",

  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const darkColors = {
  primary: "#3B82F6",
  primaryDark: "#2563EB",
  primaryLight: "#1E293B",

  background: "#0F172A",
  surface: "#1E293B",
  surfaceSecondary: "#334155",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  border: "#334155",
  borderDark: "#475569",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  dangerLight: "#450A0A",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorPalette = typeof lightColors;
export type ColorKey = keyof ColorPalette;

// Default color palette for static stylesheets
export const colors: ColorPalette = lightColors;