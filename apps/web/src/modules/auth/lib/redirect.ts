import { routes } from "@/app/config/routes"

function isControlCharacter(code: number): boolean {
  return code <= 0x1f || code === 0x7f
}

/** C0 y DEL: el navegador puede normalizarlos antes de navegar. */
function stripControlCharacters(value: string): string {
  let result = ""
  for (let index = 0; index < value.length; index += 1) {
    if (!isControlCharacter(value.charCodeAt(index))) {
      result += value[index]
    }
  }
  return result
}

function decodeForValidation(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    // Un % mal formado no es una ruta interna válida; se valida tal cual.
    return value
  }
}

function isSameOriginPath(value: string): boolean {
  if (typeof window === "undefined") return false

  try {
    return new URL(value, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

export function sanitizeRedirectPath(redirectParam?: unknown): string {
  if (typeof redirectParam !== "string") {
    return routes.home
  }

  const trimmed = redirectParam.trim()
  if (!trimmed) {
    return routes.home
  }

  // Se compara tanto la forma original como la decodificada: %5C y %0A también
  // pueden convertirse en una barra invertida o en un salto de línea.
  const candidates = [trimmed, stripControlCharacters(trimmed)]
  const normalized = candidates.map(decodeForValidation).map(stripControlCharacters)

  if (
    normalized.some(
      (candidate) =>
        !candidate.startsWith("/") ||
        candidate.startsWith("//") ||
        candidate.includes("\\") ||
        candidate.startsWith(routes.login) ||
        !isSameOriginPath(candidate),
    )
  ) {
    return routes.home
  }

  if (!isSameOriginPath(trimmed)) {
    return routes.home
  }

  return trimmed
}
