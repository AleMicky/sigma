import type React from "react"
import { CheckCircle2, Play } from "lucide-react"

import type {
  WorkflowAction,
  WorkflowTask,
  WorkflowTaskActions,
} from "../api/salida-vehicular.types"

export type SalidaNextActionType = "SALIDA" | "LLEGADA"

export interface SalidaNextActionConfig {
  type: SalidaNextActionType
  label: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  buttonClassName: string
  iconClassName: string
  dotClassName: string
}

export interface SalidaNextActionInput {
  tareaActual?: WorkflowTask | null
  acciones?: WorkflowTaskActions | null
  estado?: string | null
  descripcionActividad?: string | null
}

/** Estados terminales exactos devueltos por la API y equivalentes usados en Web. */
const INACTIVE_STATES = new Set([
  "LLEGADA",
  "FINALIZADA",
  "COMPLETADA",
  "CANCELADA",
  "ANULADA",
])

export function isSalidaInactive(estado?: string | null): boolean {
  return INACTIVE_STATES.has((estado ?? "").trim().toUpperCase())
}

/**
 * Normaliza claves de tarea y valores de acción (`registrarSalida`,
 * `REGISTRAR_SALIDA`, `SALIDA`, ...) a un token comparable sin ambigüedades.
 */
function normalizeActionToken(value?: string | null): string {
  return (value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function resolveActionType(
  tarea: WorkflowTask,
  acciones: WorkflowAction[]
): SalidaNextActionType | null {
  const taskToken = normalizeActionToken(tarea.taskDefinitionKey)
  const actionTokens = acciones.map((action) =>
    normalizeActionToken(action.value || action.name)
  )

  if (taskToken === "REGISTRAR_SALIDA" || taskToken === "SALIDA") {
    return actionTokens.some(
      (token) => token === "REGISTRAR_SALIDA" || token === "SALIDA"
    )
      ? "SALIDA"
      : null
  }

  if (taskToken === "REGISTRAR_LLEGADA" || taskToken === "LLEGADA") {
    return actionTokens.some(
      (token) => token === "REGISTRAR_LLEGADA" || token === "LLEGADA"
    )
      ? "LLEGADA"
      : null
  }

  return null
}

/**
 * Deriva la siguiente acción únicamente de la tarea activa de Flowable y de las
 * acciones disponibles para esa tarea. No infiere la acción a partir de eventos
 * ni de cadenas de estado parciales: sin tarea, sin acciones o en estado
 * terminal no existe CTA.
 */
export function getSalidaNextActionConfig({
  tareaActual,
  acciones,
  estado,
  descripcionActividad,
}: SalidaNextActionInput): SalidaNextActionConfig | null {
  if (isSalidaInactive(estado)) return null
  if (!tareaActual?.taskDefinitionKey) return null

  const availableActions = acciones?.actions ?? []
  if (availableActions.length === 0) return null

  const type = resolveActionType(tareaActual, availableActions)
  if (!type) return null

  if (type === "LLEGADA") {
    return {
      type,
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

  return {
    type,
    label: "Registrar Salida",
    title: "Registrar salida vehicular con odómetro y ubicación GPS",
    icon: Play,
    buttonClassName:
      "bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-blue-500/35 hover:border-blue-500/50 shadow-2xs hover:shadow-xs",
    iconClassName: "size-3 text-blue-600 dark:text-blue-400 fill-current",
    dotClassName: "bg-blue-500",
  }
}
