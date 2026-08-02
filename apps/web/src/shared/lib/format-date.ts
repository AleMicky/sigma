export function formatDate(value: string, locale = "es-BO") {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}
