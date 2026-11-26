/**
 * Devuelve la fecha local en formato `YYYY-MM-DD`.
 *
 * No usar `toISOString().split("T")[0]`: `toISOString()` convierte a UTC y en
 * America/La_Paz (UTC-4) cambia el día después de las 20:00.
 */
export function toLocalDateKey(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
