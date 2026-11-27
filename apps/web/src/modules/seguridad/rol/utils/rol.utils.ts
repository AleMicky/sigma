import type { Rol } from "../api/rol.service"

/**
 * Únicos roles del seed V159. No se inventan alias: cualquier código fuera de
 * este catálogo se muestra con el texto que envía la API (fallback seguro).
 */
const KNOWN_ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  encargado_movilidades: "Encargado de Movilidades",
  conductor: "Conductor",
  solicitante_movilidad: "Solicitante de Movilidad",
  encargado: "Encargado",
  supervisor: "Supervisor",
  solicitante: "Solicitante",
}

const MINOR_WORDS = new Set(["de", "del", "la", "el", "los", "las", "en", "y", "o", "a", "por", "para"])

function normalizeRoleCode(value: string): string {
  return value.trim().toLowerCase().replace(/^(role_|rol_)/, "")
}

/**
 * Formats any raw string into a clean, human-readable Title Case string.
 * Example:
 * - "SUPERVISOR_MANTENIMIENTO" -> "Supervisor de Mantenimiento"
 * - "rol_jefe_planta" -> "Jefe de Planta"
 */
export function formatTitleCase(input: string): string {
  if (!input) return ""

  // Clean technical prefixes
  let cleaned = input.trim()
  cleaned = cleaned.replace(/^(ROLE_|ROL_|role_|rol_)/i, "")
  cleaned = cleaned.replace(/[-_]+/g, " ")

  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return input

  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && MINOR_WORDS.has(lower)) {
        return lower
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
}

/**
 * Returns a friendly display name only for roles known from V159; the rest
 * keeps the API wording through a conservative Title Case fallback.
 */
export function getFriendlyRoleName(rol: Rol | null | undefined): string {
  if (!rol) return ""

  const codigoClean = normalizeRoleCode(rol.codigo ?? "")
  const knownByCode = KNOWN_ROLE_LABELS[codigoClean]
  if (knownByCode) {
    return knownByCode
  }

  const nombreClean = normalizeRoleCode(rol.nombre ?? "")
  const knownByNombre = KNOWN_ROLE_LABELS[nombreClean]
  if (knownByNombre) {
    return knownByNombre
  }

  if (rol.nombre?.trim()) {
    return formatTitleCase(rol.nombre)
  }

  return formatTitleCase(rol.codigo ?? "")
}
