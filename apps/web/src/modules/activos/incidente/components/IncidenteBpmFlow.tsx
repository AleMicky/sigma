import * as React from "react"
import {
  Check,
  GitCommit,
  History,
  Play,
  XCircle,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import {
  useIncidenteAccionesQuery,
  useIncidenteHistorialQuery,
} from "../api/incidente.queries"
import type { IncidenteActivo } from "../api/incidente.types"
import { EjecutarAccionIncidenteModal } from "./EjecutarAccionIncidenteModal"

interface IncidenteBpmFlowProps {
  incidente: IncidenteActivo
  onSuccess?: () => void
}

const STAGES = [
  { key: "REGISTRADO", label: "Registro" },
  { key: "REVISION", label: "Revisión Inicial" },
  { key: "EN_ATENCION", label: "Atención Técnica" },
  { key: "VALIDACION", label: "Validación Solución" },
  { key: "CERRADO", label: "Cierre" },
]

export function IncidenteBpmFlow({ incidente, onSuccess }: IncidenteBpmFlowProps) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)

  const { data: tareaActual } = useIncidenteAccionesQuery(
    incidente.id,
    Boolean(incidente.processInstanceId)
  )

  const { data: historial, isLoading: loadingHistorial } =
    useIncidenteHistorialQuery(incidente.id, Boolean(incidente.processInstanceId && showHistory))

  const estado = (incidente.estado || "REGISTRADO").toUpperCase()
  const isCanceled = estado === "CANCELADO"
  const isRejected = estado === "RECHAZADO"
  const isClosed = estado === "CERRADO"

  // Determinar etapa actual índice
  let currentStageIndex = 0
  if (estado === "REVISION") currentStageIndex = 1
  else if (estado === "EN_ATENCION") currentStageIndex = 2
  else if (estado === "VALIDACION" || estado === "EN_CIERRE") currentStageIndex = 3
  else if (estado === "CERRADO") currentStageIndex = 4

  return (
    <Card className="border border-border/80 shadow-xs overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Flujo de Vida del Incidente (BPMN Flowable)
            </CardTitle>
            <CardDescription>
              Seguimiento de etapas de auditoría, atención técnica y resolución.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory((prev) => !prev)}
              className="gap-1.5 text-xs h-8"
            >
              <History className="w-3.5 h-3.5" />
              {showHistory ? "Ocultar Historial" : "Ver Trazabilidad"}
            </Button>

            {!isCanceled && !isRejected && !isClosed && tareaActual?.taskId && (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs h-8 font-semibold shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Gestionar Tarea Activa
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Banner de Estado Especial */}
        {isCanceled && (
          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4 text-gray-500 shrink-0" />
            <span>El incidente fue cancelado y su proceso se encuentra detenido.</span>
          </div>
        )}

        {isRejected && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-sm flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>El incidente no fue admitido durante la etapa de revisión.</span>
          </div>
        )}

        {/* Stepper Visual */}
        {!isCanceled && !isRejected && (
          <div className="relative">
            <div className="grid grid-cols-5 gap-2 relative z-10">
              {STAGES.map((st, idx) => {
                const isPast = currentStageIndex > idx
                const isCurrent = currentStageIndex === idx

                return (
                  <div key={st.key} className="flex flex-col items-center text-center">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all",
                        isPast
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : isCurrent
                          ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60 animate-pulse"
                          : "bg-muted border-border text-muted-foreground"
                      )}
                    >
                      {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-semibold leading-tight max-w-[90px]",
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400 font-bold"
                          : isPast
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Línea conectora */}
            <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-border -z-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${(Math.min(currentStageIndex, 4) / 4) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Tarea BPMN Activa */}
        {!isCanceled && !isRejected && !isClosed && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 px-2 py-0.5 rounded-sm">
                Tarea Pendiente en Flowable
              </span>
              <h4 className="text-sm font-bold text-foreground">
                {tareaActual?.taskName || "En espera de asignación de tarea"}
              </h4>
              <p className="text-xs text-muted-foreground">
                Instancia de proceso:{" "}
                <code className="text-xs font-mono">{incidente.processInstanceId || "N/A"}</code>
              </p>
            </div>

            {tareaActual?.taskId && (
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 font-medium text-xs h-9 gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Ejecutar Acción
              </Button>
            )}
          </div>
        )}

        {/* Historial BPMN Plegable */}
        {showHistory && (
          <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Eventos e Hitos del Proceso
            </h4>

            {loadingHistorial ? (
              <div className="text-xs text-center py-4 text-muted-foreground">
                Cargando historial del workflow...
              </div>
            ) : !historial?.items || historial.items.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">
                No hay actividades históricas registradas en Flowable aún.
              </div>
            ) : (
              <div className="space-y-2">
                {historial.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-semibold text-foreground">
                        {item.activityName || item.activityId}
                      </span>
                      <span className="text-muted-foreground">
                        ({item.activityType})
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] font-mono">
                      {item.startTime
                        ? new Date(item.startTime).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <EjecutarAccionIncidenteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        incidenteId={incidente.id}
        tareaActual={tareaActual}
        onSuccess={onSuccess}
      />
    </Card>
  )
}
