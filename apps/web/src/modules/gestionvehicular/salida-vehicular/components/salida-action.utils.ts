import type React from "react"
import {
  CheckCircle2,
  Play,
} from "lucide-react"

export type SalidaNextActionType =
  | "SALIDA"
  | "LLEGADA"

export interface SalidaNextActionConfig {
  type: SalidaNextActionType
  label: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  buttonClassName: string
  iconClassName: string
  dotClassName: string
}

/**
 * Determina la siguiente acción contextual operativa para una salida vehicular
 * según la tarea actual en el flujo (únicamente Salida y Llegada, siendo Llegada el cierre).
 */
export function getSalidaNextActionConfig(
  rawEstadoOrTaskName?: string | null,
  descripcionActividad?: string | null
): SalidaNextActionConfig {
  const norm = (rawEstadoOrTaskName ?? "").trim().toUpperCase()

  // Paso 2 (Final): LLEGADA
  if (norm.includes("LLEGAD") || norm.includes("CURSO") || norm.includes("TRANSIT")) {
    return {
      type: "LLEGADA",
      label: "Registrar Llegada",
      title: descripcionActividad
        ? `Registrar llegada final para la actividad: ${descripcionActividad}`
        : "Registrar llegada final vehicular",
      icon: CheckCircle2,
      buttonClassName:
        "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 hover:border-emerald-500/50 shadow-2xs hover:shadow-xs",
      iconClassName: "size-3 text-emerald-600 dark:text-emerald-400",
      dotClassName: "bg-emerald-500",
    }
  }

  // Paso 1: SALIDA
  return {
    type: "SALIDA",
    label: "Registrar Salida",
    title: "Registrar salida vehicular con odómetro y ubicación GPS",
    icon: Play,
    buttonClassName:
      "bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/35 hover:border-blue-500/50 shadow-2xs hover:shadow-xs",
    iconClassName: "size-3 text-blue-600 dark:text-blue-400 fill-current",
    dotClassName: "bg-blue-500",
  }
}
