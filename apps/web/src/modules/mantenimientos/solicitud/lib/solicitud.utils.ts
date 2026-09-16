import type { Activo } from "@/modules/activos/activo/types/activo.types"

/**
 * Extrae la placa de circulación desde la descripción o texto de un activo.
 */
export function extractPlaca(activo?: Partial<Activo> | null): string | null {
  try {
    if (!activo || typeof activo !== "object") return null
    if (!activo.descripcion || typeof activo.descripcion !== "string") return null

    // Coincide con formatos como "PLACA 5202TGB", "PLACA: 6333-SYX", "PLACA 5197 LIB", "PLACA-123", etc.
    const match = activo.descripcion.match(
      /PLACA[:\s#-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)*)/i,
    )
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (clean.length >= 2 && clean.length <= 20) {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Retorna la variante de Badge según el estado de la solicitud.
 */
export function getEstadoBadgeVariant(
  estado?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  if (!estado) return "secondary"
  const norm = estado.trim().toUpperCase()

  switch (norm) {
    case "BORRADOR":
      return "secondary"
    case "OBSERVADO":
    case "RECHAZADO":
    case "CANCELADO":
      return "destructive"
    case "FINALIZADO":
    case "FINALIZADA":
    case "VALIDADO":
    case "TRABAJO_REALIZADO":
    case "CERRADO":
      return "default"
    default:
      return "outline"
  }
}

export type PrioridadColorConfig = {
  dotClass: string
  borderClass: string
  alertClass: string
  badgeClass: string
  defaultDescription: string
}

/**
 * Configuración visual y de criticidad basada en el nivel de prioridad (1 a 5).
 */
export function getPrioridadColorConfig(nivel = 1): PrioridadColorConfig {
  switch (nivel) {
    case 5:
      return {
        dotClass: "bg-rose-600 animate-pulse",
        borderClass: "border-rose-500/60 focus-visible:ring-rose-500/30",
        alertClass:
          "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200",
        badgeClass: "bg-rose-600 text-white",
        defaultDescription: "Emergencia crítica. Requiere detención y atención inmediata.",
      }
    case 4:
      return {
        dotClass: "bg-amber-500",
        borderClass: "border-amber-500/60 focus-visible:ring-amber-500/30",
        alertClass:
          "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200",
        badgeClass: "bg-amber-600 text-white",
        defaultDescription: "Alta prioridad. Afecta severamente la operatividad o seguridad.",
      }
    case 3:
      return {
        dotClass: "bg-blue-500",
        borderClass: "border-blue-500/60 focus-visible:ring-blue-500/30",
        alertClass:
          "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200",
        badgeClass: "bg-blue-600 text-white",
        defaultDescription: "Media prioridad. Requiere programación y atención prioritaria.",
      }
    case 2:
      return {
        dotClass: "bg-emerald-500",
        borderClass: "border-emerald-500/60 focus-visible:ring-emerald-500/30",
        alertClass:
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200",
        badgeClass: "bg-emerald-600 text-white",
        defaultDescription: "Baja prioridad. Atención planificada en la rutina normal de trabajo.",
      }
    case 1:
    default:
      return {
        dotClass: "bg-slate-400 dark:bg-slate-500",
        borderClass: "border-border focus-visible:ring-ring/30",
        alertClass:
          "bg-muted/40 border-border/80 text-foreground",
        badgeClass: "bg-muted-foreground text-background",
        defaultDescription: "Muy baja prioridad o solicitud preventiva de rutina sin impacto operativo.",
      }
  }
}

/**
 * Retorna las clases de estilo para las etiquetas interactivas de Tipo de Mantenimiento.
 */
export function getTipoMantenimientoBadgeClass(
  nombre: string,
  isSelected: boolean,
): string {
  const norm = (nombre || "").toLowerCase().trim()

  if (!isSelected) {
    return "bg-card border-border/70 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border"
  }

  if (norm.includes("correctiv")) {
    return "bg-amber-600 border-amber-600 text-white shadow-xs font-semibold"
  }
  if (norm.includes("preventiv")) {
    return "bg-emerald-600 border-emerald-600 text-white shadow-xs font-semibold"
  }
  if (norm.includes("predictiv")) {
    return "bg-cyan-600 border-cyan-600 text-white shadow-xs font-semibold"
  }
  if (norm.includes("mejorativ") || norm.includes("modificativ")) {
    return "bg-indigo-600 border-indigo-600 text-white shadow-xs font-semibold"
  }

  return "bg-primary border-primary text-primary-foreground shadow-xs font-semibold"
}
