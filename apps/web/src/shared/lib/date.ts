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

/**
 * Normaliza una fecha a `yyyy-MM-ddTHH:mm:ss` en hora local (America/La_Paz).
 *
 * Los campos `datetime-local` llegan sin zona; una fecha con `Z`/offset se
 * convierte a componentes locales para que la API reciba siempre el mismo
 * `LocalDateTime` y nunca un `+00:00`/`Z` que desplace la hora en UTC-4.
 */
export function toLocalDateTimeIso(value: string): string {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return trimmed.slice(0, 19)
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) return trimmed
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
