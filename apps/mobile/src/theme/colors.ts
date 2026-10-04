export const colors = {
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

export type ColorKey = keyof typeof colors;