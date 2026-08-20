import { format, isValid, parseISO } from "date-fns"

import { appConfig } from "@/app/config/app.config"

export function formatDate(
  value: string | null | undefined,
  pattern: string = appConfig.dateFormats.date,
): string {
  if (!value) {
    return "—"
  }

  const date = parseISO(value)

  if (!isValid(date)) {
    return "—"
  }

  return format(date, pattern)
}

export function formatDateTime(
  value: string | null | undefined,
  pattern: string = appConfig.dateFormats.dateTime,
): string {
  if (!value) {
    return "—"
  }

  const date = parseISO(value)

  if (!isValid(date)) {
    return "—"
  }

  return format(date, pattern)
}

