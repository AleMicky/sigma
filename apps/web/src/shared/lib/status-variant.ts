export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "indigo"
  | "neutral"

/**
 * Normaliza cualquier texto o estado del backend a una variante semántica estándar.
 */
export function resolveStatusVariant(statusText?: string | null): StatusBadgeVariant {
  if (!statusText) return "neutral"
  const normalized = statusText.trim().toLowerCase()

  // Success / Positivos / Disponibles
  if (
    normalized.includes("operativ") ||
    normalized.includes("disponibl") ||
    normalized.includes("aprobad") ||
    normalized.includes("activo") ||
    normalized.includes("completad") ||
    normalized.includes("finalizad") ||
    normalized.includes("ejecutad") ||
    normalized.includes("entregad") ||
    normalized.includes("exitos") ||
    normalized === "si" ||
    normalized === "ok"
  ) {
    return "success"
  }

  // Warning / Transición / En Taller / En Proceso
  if (
    normalized.includes("pendient") ||
    normalized.includes("proceso") ||
    normalized.includes("revision") ||
    normalized.includes("espera") ||
    normalized.includes("tramite") ||
    normalized.includes("mantenimiento") ||
    normalized.includes("taller") ||
    normalized.includes("inspeccion")
  ) {
    return "warning"
  }

  // Danger / Críticos / Bajas / Averías
  if (
    normalized.includes("critic") ||
    normalized.includes("falla") ||
    normalized.includes("averi") ||
    normalized.includes("rechazad") ||
    normalized.includes("anulad") ||
    normalized.includes("inactiv") ||
    normalized.includes("bloquead") ||
    normalized.includes("baja") ||
    normalized.includes("desincorporad") ||
    normalized.includes("urgente") ||
    normalized.includes("error") ||
    normalized === "no"
  ) {
    return "danger"
  }

  // Info / Asignados / En Ruta / En Tránsito
  if (
    normalized.includes("programad") ||
    normalized.includes("asignad") ||
    normalized.includes("ruta") ||
    normalized.includes("transit") ||
    normalized.includes("viaje") ||
    normalized.includes("abierto") ||
    normalized.includes("enviad")
  ) {
    return "info"
  }

  return "neutral"
}
