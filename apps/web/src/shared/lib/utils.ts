import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      ((typeof crypto !== "undefined" && crypto.getRandomValues
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 256)) &
        (15 >> (+c / 4)))
    ).toString(16),
  )
}

