export function getEstadoBadgeStyles(estado?: string) {
  const norm = (estado ?? "").toLowerCase().trim()
  switch (norm) {
    case "finalizado":
    case "completado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "trabajo_realizado":
    case "trabajo realizado":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
    case "validado":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
    case "en_revision":
    case "en revision":
    case "en revisión":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    case "en_mantenimiento":
    case "en mantenimiento":
    case "en_proceso":
    case "en proceso":
    case "en_ejecucion":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    case "asignado":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
    case "aprobado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "observado_mantenimiento":
    case "observado mantenimiento":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case "observado":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
    case "solicitado":
    case "pendiente":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case "rechazado":
    case "cancelado":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case "borrador":
    default:
      return "bg-muted text-muted-foreground border-border/80"
  }
}

export function getPrioridadBadgeStyles(nivel = 1) {
  switch (nivel) {
    case 5:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case 4:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case 3:
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    case 2:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
}

export type PrioridadColorConfig = {
  dotClass: string
  textClass: string
  borderClass: string
  alertClass: string
  badgeClass: string
  defaultDescription: string
}

export function getPrioridadColorConfig(nivel = 1): PrioridadColorConfig {
  switch (nivel) {
    case 5:
      return {
        dotClass: "bg-rose-500",
        textClass: "text-rose-600 dark:text-rose-400",
        borderClass: "border-rose-500/50 ring-1 ring-rose-500/20 bg-rose-500/5",
        alertClass: "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200",
        badgeClass: "bg-rose-600 text-white",
        defaultDescription: "Atención inmediata requerida. Riesgo inminente de parada operativa o afectación a la seguridad.",
      }
    case 4:
      return {
        dotClass: "bg-orange-500",
        textClass: "text-orange-600 dark:text-orange-400",
        borderClass: "border-orange-500/50 ring-1 ring-orange-500/20 bg-orange-500/5",
        alertClass: "bg-orange-500/10 border-orange-500/30 text-orange-900 dark:text-orange-200",
        badgeClass: "bg-orange-600 text-white",
        defaultDescription: "Atención con alta celeridad. Afecta directamente la operatividad y debe resolverse a la brevedad.",
      }
    case 3:
      return {
        dotClass: "bg-amber-500",
        textClass: "text-amber-600 dark:text-amber-400",
        borderClass: "border-amber-500/50 ring-1 ring-amber-500/20 bg-amber-500/5",
        alertClass: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
        badgeClass: "bg-amber-600 text-white",
        defaultDescription: "Planificación prioritaria dentro del turno o jornada de trabajo regular.",
      }
    case 2:
      return {
        dotClass: "bg-blue-500",
        textClass: "text-blue-600 dark:text-blue-400",
        borderClass: "border-blue-500/50 ring-1 ring-blue-500/20 bg-blue-500/5",
        alertClass: "bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200",
        badgeClass: "bg-blue-600 text-white",
        defaultDescription: "Atención estándar y programable según el flujo habitual de trabajo.",
      }
    case 1:
    default:
      return {
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-500/5",
        alertClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
        badgeClass: "bg-emerald-600 text-white",
        defaultDescription: "Mantenimiento preventivo o de impacto menor sin riesgo operativo inmediato.",
      }
  }
}

export function getEstadoBadgeVariant(estado: string) {
  const est = (estado || "").toLowerCase()
  if (est === "aprobado" || est === "completado" || est === "finalizado" || est === "validado" || est === "trabajo_realizado") {
    return "default" as const
  }
  if (est === "en_mantenimiento" || est === "en_revision" || est === "en_proceso" || est === "en proceso") {
    return "secondary" as const
  }
  if (est === "rechazado" || est === "cancelado" || est === "observado" || est === "observado_mantenimiento") {
    return "destructive" as const
  }
  return "outline" as const
}

export function getTipoMantenimientoBadgeClass(nombre: string, isSelected: boolean) {
  const norm = (nombre || "").toLowerCase().trim()

  if (norm.includes("preventiv")) {
    return isSelected
      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30 scale-[1.02]"
      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
  }
  if (norm.includes("correctiv")) {
    return isSelected
      ? "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/30 scale-[1.02]"
      : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50"
  }
  if (norm.includes("predictiv")) {
    return isSelected
      ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30 scale-[1.02]"
      : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50"
  }
  if (norm.includes("calibrac") || norm.includes("inspecc") || norm.includes("revision")) {
    return isSelected
      ? "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30 scale-[1.02]"
      : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50"
  }
  if (norm.includes("mejora") || norm.includes("adaptat")) {
    return isSelected
      ? "bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-500/30 scale-[1.02]"
      : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50"
  }

  return isSelected
    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/30 scale-[1.02]"
    : "bg-muted/80 text-foreground border-border/80 hover:bg-accent hover:border-primary/40 hover:text-accent-foreground"
}

export function fixEncoding(str?: string | null): string {
  if (!str) return ""
  return str
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã /g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã /g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã‘/g, "Ñ")
}
