import * as React from "react"
import { CheckCircle2, GitCommit, Loader2, XCircle } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"

import { useEjecutarAccionIncidenteMutation } from "../api/incidente.mutations"
import type { WorkflowTaskActions } from "../api/incidente.types"

interface EjecutarAccionIncidenteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidenteId: string
  tareaActual?: WorkflowTaskActions | null
  onSuccess?: () => void
}

export function EjecutarAccionIncidenteModal({
  open,
  onOpenChange,
  incidenteId,
  tareaActual,
  onSuccess,
}: EjecutarAccionIncidenteModalProps) {
  const taskKey = (tareaActual?.taskDefinitionKey || "").toLowerCase()
  const taskName = tareaActual?.taskName || "Tarea de Proceso"

  const [aprobado, setAprobado] = React.useState<boolean>(true)
  const [observacionRevision, setObservacionRevision] = React.useState("")
  const [detalleAtencion, setDetalleAtencion] = React.useState("")
  const [solucionAprobada, setSolucionAprobada] = React.useState<boolean>(true)
  const [observacionValidacion, setObservacionValidacion] = React.useState("")
  const [observacionCierre, setObservacionCierre] = React.useState("")
  const [observacionGeneral, setObservacionGeneral] = React.useState("")

  const ejecutarMutation = useEjecutarAccionIncidenteMutation()

  React.useEffect(() => {
    if (open) {
      setAprobado(true)
      setObservacionRevision("")
      setDetalleAtencion("")
      setSolucionAprobada(true)
      setObservacionValidacion("")
      setObservacionCierre("")
      setObservacionGeneral("")
    }
  }, [open, tareaActual])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const firstAction = tareaActual?.actions?.[0]?.value || "COMPLETAR"

    const payload = {
      aprobado,
      observacionRevision: observacionRevision.trim() || undefined,
      detalleAtencion: detalleAtencion.trim() || undefined,
      solucionAprobada,
      observacionValidacion: observacionValidacion.trim() || undefined,
      observacionCierre: observacionCierre.trim() || undefined,
      observacion: observacionGeneral.trim() || undefined,
    }

    ejecutarMutation.mutate(
      { id: incidenteId, accionId: firstAction, data: payload },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {taskName}
              </DialogTitle>
              <DialogDescription>
                Completa los datos requeridos por el flujo para avanzar de etapa.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Formulario para ETAPA REVISIÓN */}
          {taskKey === "revision" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  ¿Admitir o rechazar el incidente?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAprobado(true)}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-left transition-all ${
                      aprobado
                        ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium">Admitir incidente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAprobado(false)}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-left transition-all ${
                      !aprobado
                        ? "border-rose-500 bg-rose-50/60 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200 ring-2 ring-rose-500/30"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-sm font-medium">Rechazar</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Observación de revisión</Label>
                <Textarea
                  value={observacionRevision}
                  onChange={(e) => setObservacionRevision(e.target.value)}
                  placeholder="Detalle el criterio o motivo de la decisión..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Formulario para ETAPA ATENCIÓN */}
          {taskKey === "atencion" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Detalle de Atención / Acciones Realizadas <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={detalleAtencion}
                  onChange={(e) => setDetalleAtencion(e.target.value)}
                  placeholder="Indique las reparaciones, traslados, peritajes o trabajos técnicos efectuados..."
                  rows={4}
                  required
                />
              </div>
            </div>
          )}

          {/* Formulario para ETAPA VALIDACIÓN */}
          {taskKey === "validacion" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  ¿Se aprueba la solución técnica?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSolucionAprobada(true)}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-left transition-all ${
                      solucionAprobada
                        ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium">Aprobar solución</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSolucionAprobada(false)}
                    className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-left transition-all ${
                      !solucionAprobada
                        ? "border-amber-500 bg-amber-50/60 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 ring-2 ring-amber-500/30"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="text-sm font-medium">Retrabajo / No aprobada</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Observación de validación</Label>
                <Textarea
                  value={observacionValidacion}
                  onChange={(e) => setObservacionValidacion(e.target.value)}
                  placeholder="Comentarios sobre la verificación o requerimientos de retrabajo..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Formulario para ETAPA CIERRE */}
          {taskKey === "cierre" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Observaciones Finales de Cierre
                </Label>
                <Textarea
                  value={observacionCierre}
                  onChange={(e) => setObservacionCierre(e.target.value)}
                  placeholder="Conclusiones finales, costos o resumen del siniestro..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Comentario Adicional general si no es ninguna tarea específica */}
          {taskKey !== "revision" &&
            taskKey !== "atencion" &&
            taskKey !== "validacion" &&
            taskKey !== "cierre" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Observaciones de la tarea</Label>
                <Textarea
                  value={observacionGeneral}
                  onChange={(e) => setObservacionGeneral(e.target.value)}
                  placeholder="Ingrese los comentarios correspondientes..."
                  rows={3}
                />
              </div>
            )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={ejecutarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                ejecutarMutation.isPending ||
                (taskKey === "atencion" && !detalleAtencion.trim())
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2"
            >
              {ejecutarMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Completar y Avanzar Flujo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
