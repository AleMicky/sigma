import type { Rol } from "../api/rol.service"

const KNOWN_ROLE_LABELS: Record<string, string> = {
  admin: "Administrador del Sistema",
  administrador: "Administrador del Sistema",
  role_admin: "Administrador del Sistema",
  rol_admin: "Administrador del Sistema",
  user: "Usuario General",
  usuario: "Usuario General",
  operator: "Operador de Planta",
  operador: "Operador de Planta",
  supervisor: "Supervisor General",
  supervisor_mantenimiento: "Supervisor de Mantenimiento",
  tecnico: "Técnico Especialista",
  tecnico_mantenimiento: "Técnico de Mantenimiento",
  encargado_mantenimiento: "Encargado de Mantenimiento",
  aprobador: "Aprobador de Solicitudes",
  auditor: "Auditor del Sistema",
  inventarios: "Gestor de Inventarios",
  "default-roles-sigma": "Roles Base del Sistema (SIGMA)",
  offline_access: "Acceso Fuera de Línea (Offline)",
  uma_authorization: "Autorización de Recursos (UMA)",
}

const MINOR_WORDS = new Set(["de", "del", "la", "el", "los", "las", "en", "y", "o", "a", "por", "para"])

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
 * Returns a friendly, beautifully formatted display name for a Rol.
 */
export function getFriendlyRoleName(rol: Rol | null | undefined): string {
  if (!rol) return ""

  const codigoClean = (rol.codigo || "").toLowerCase().trim()
  if (KNOWN_ROLE_LABELS[codigoClean]) {
    return KNOWN_ROLE_LABELS[codigoClean]
  }

  // Check if nombre is present and different from raw code
  if (rol.nombre && rol.nombre.trim()) {
    const nombreClean = rol.nombre.toLowerCase().trim()
    if (KNOWN_ROLE_LABELS[nombreClean]) {
      return KNOWN_ROLE_LABELS[nombreClean]
    }
    return formatTitleCase(rol.nombre)
  }

  return formatTitleCase(rol.codigo)
}
