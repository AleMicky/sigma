import type React from "react"
import {
  CheckCircle2,
  GitBranch,
  MapPin,
  Play,
  RotateCcw,
} from "lucide-react"

export type SalidaNextActionType =
  | "INICIAR"
  | "LLEGADA"
  | "RETORNO"
  | "FINALIZAR"
  | "AVANZAR"

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
 * según su estado actual en el ciclo de vida del proceso de movilidad.
 */
export function getSalidaNextActionConfig(
  rawEstado?: string | null,
  descripcionActividad?: string | null
): SalidaNextActionConfig {
  const norm = (rawEstado ?? "").trim().toUpperCase()

  // 1. Estado Creada / Registrada / Iniciada (antes de la partida)
  // Tarea BPMN: iniciarSalida -> Acción: Iniciar Salida
  if (
    !norm ||
    norm.includes("REGISTRAD") ||
    norm.includes("BORRADOR") ||
    norm.includes("CREAD") ||
    norm.includes("INICIAD")
  ) {
    return {
      type: "INICIAR",
      label: "Iniciar Salida",
      title: "Iniciar salida vehicular y registrar odómetro/GPS de partida",
      icon: Play,
      buttonClassName:
        "bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/35 hover:border-blue-500/50 shadow-2xs hover:shadow-xs",
      iconClassName: "size-3 text-blue-600 dark:text-blue-400 fill-current",
      dotClassName: "bg-blue-500",
    }
  }

  // 2. Estado En Tránsito / En Curso (hacia el punto de actividad)
  // Tarea BPMN: registrarLlegada -> Acción: Registrar Llegada
  if (norm.includes("TRANSIT") || norm.includes("CURSO")) {
    return {
      type: "LLEGADA",
      label: "Registrar Llegada",
      title: descripcionActividad
        ? `Registrar llegada para la actividad: ${descripcionActividad}`
        : "Registrar llegada al punto de actividad",
      icon: MapPin,
      buttonClassName:
        "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border-amber-500/35 hover:border-amber-500/50 shadow-2xs hover:shadow-xs",
      iconClassName: "size-3 text-amber-600 dark:text-amber-400",
      dotClassName: "bg-amber-500",
    }
  }

  // 3. Estado En Destino / Llegada (listo para iniciar retorno)
  // Tarea BPMN: iniciarRetorno -> Acción: Iniciar Retorno
  if (norm.includes("DESTINO") || norm.includes("LLEGAD")) {
    return {
      type: "RETORNO",
      label: "Iniciar Retorno",
      title: "Iniciar trayecto de retorno a la base",
      icon: RotateCcw,
      buttonClassName:
        "bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border-purple-500/35 hover:border-purple-500/50 shadow-2xs hover:shadow-xs",
      iconClassName: "size-3 text-purple-600 dark:text-purple-400",
      dotClassName: "bg-purple-500",
    }
  }

  // 4. Estado En Retorno (regresando a base)
  // Tarea BPMN: finalizarSalida -> Acción: Finalizar Salida
  if (norm.includes("RETORN")) {
    return {
      type: "FINALIZAR",
      label: "Finalizar Salida",
      title: "Finalizar salida vehicular y registrar odómetro final de cierre",
      icon: CheckCircle2,
      buttonClassName:
        "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 hover:border-emerald-500/50 shadow-2xs hover:shadow-xs",
      iconClassName: "size-3 text-emerald-600 dark:text-emerald-400",
      dotClassName: "bg-emerald-500",
    }
  }

  // 5. Fallback para cualquier otro estado activo
  return {
    type: "AVANZAR",
    label: "Avanzar Flujo",
    title: "Avanzar al siguiente hito del proceso vehicular",
    icon: GitBranch,
    buttonClassName:
      "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border-indigo-500/35 hover:border-indigo-500/50 shadow-2xs hover:shadow-xs",
    iconClassName: "size-3 text-indigo-600 dark:text-indigo-400",
    dotClassName: "bg-indigo-500",
  }
}
