export function formatDate(value?: string | null, locale = "es-BO"): string {
  if (!value) return "—"
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) {
      // Intento con split date simple YYYY-MM-DD
      const [year, month, day] = value.split("-").map(Number)
      if (year && month && day) {
        return new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(year, month - 1, day))
      }
      return value
    }

    const hasTime = value.includes("T") || value.includes(":")
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(d)
  } catch {
    return value
  }
}

export function formatShortDate(value?: string | null, locale = "es-BO"): string {
  if (!value) return "—"
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d)
  } catch {
    return value
  }
}
