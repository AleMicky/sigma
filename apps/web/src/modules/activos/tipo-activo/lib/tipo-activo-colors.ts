export const TIPO_ACTIVO_COLOR_PRESETS = [
  "#2563EB",
  "#0D9488",
  "#16A34A",
  "#CA8A04",
  "#EA580C",
  "#DC2626",
  "#DB2777",
  "#7C3AED",
  "#475569",
  "#0F172A",
] as const

export const DEFAULT_TIPO_ACTIVO_COLOR = TIPO_ACTIVO_COLOR_PRESETS[0]

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export function isHexColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value)
}

export function normalizeHexColor(value: string): string {
  return value.trim().toUpperCase()
}
