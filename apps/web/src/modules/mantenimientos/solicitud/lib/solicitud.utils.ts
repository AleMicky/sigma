export function getEstadoBadgeStyles(estado?: string) {
  const norm = (estado ?? "").toLowerCase().trim()
  switch (norm) {
    case "finalizado":
    case "completado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "en_proceso":
    case "en proceso":
    case "en_ejecucion":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    case "aprobado":
    case "asignado":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
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

export function getPrioridadDotColor(nivel: number) {
  switch (nivel) {
    case 5:
      return "bg-rose-500 text-rose-500"
    case 4:
      return "bg-amber-500 text-amber-500"
    case 3:
      return "bg-yellow-500 text-yellow-500"
    case 2:
      return "bg-blue-500 text-blue-500"
    default:
      return "bg-emerald-500 text-emerald-500"
  }
}

export function getEstadoBadgeVariant(estado: string) {
  const est = (estado || "").toLowerCase()
  if (est === "aprobado" || est === "completado" || est === "finalizado") {
    return "default" as const
  }
  if (est === "en_proceso" || est === "en proceso") {
    return "secondary" as const
  }
  if (est === "rechazado" || est === "cancelado") {
    return "destructive" as const
  }
  return "outline" as const
}
