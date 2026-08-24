import { useEffect, useState } from "react"
import { Calendar, FileText, Loader2, Save, Wrench } from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateOrdenTrabajo,
  useUpdateOrdenTrabajo,
} from "../api/orden-trabajo.mutations"
import type {
  OrdenTrabajo,
  OrdenTrabajoPayload,
} from "../api/orden-trabajo.service"
import { ActivoCombobox } from "./ActivoCombobox"
import { SolicitudAsignadaCombobox } from "./SolicitudAsignadaCombobox"

type OrdenTrabajoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajo?: OrdenTrabajo | null
  initialSolicitudId?: string
  initialActivoId?: string
  onSuccess?: (ot: OrdenTrabajo) => void
}

export function OrdenTrabajoFormDialog({
  open,
  onOpenChange,
  ordenTrabajo,
  initialSolicitudId,
  initialActivoId,
  onSuccess,
}: OrdenTrabajoFormDialogProps) {
  const isEditing = Boolean(ordenTrabajo?.id)

  const createMutation = useCreateOrdenTrabajo()
  const updateMutation = useUpdateOrdenTrabajo()

  const [solicitudMantenimientoId, setSolicitudMantenimientoId] =
    useState<string>("")
  const [activoId, setActivoId] = useState<string>("")
  const [responsableId, setResponsableId] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [diagnostico, setDiagnostico] = useState<string>("")
  const [trabajoRealizado, setTrabajoRealizado] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")

  useEffect(() => {
    if (open) {
      if (ordenTrabajo) {
        setSolicitudMantenimientoId(ordenTrabajo.solicitudMantenimientoId || "")
        setActivoId(ordenTrabajo.activo?.id || "")
        setResponsableId(ordenTrabajo.responsable?.id || "")
        setFechaInicio(
          ordenTrabajo.fechaInicio ? ordenTrabajo.fechaInicio.slice(0, 16) : "",
        )
        setFechaFin(
          ordenTrabajo.fechaFin ? ordenTrabajo.fechaFin.slice(0, 16) : "",
        )
        setDiagnostico(ordenTrabajo.diagnostico || "")
        setTrabajoRealizado(ordenTrabajo.trabajoRealizado || "")
        setObservacion(ordenTrabajo.observacion || "")
      } else {
        setSolicitudMantenimientoId(initialSolicitudId || "")
        setActivoId(initialActivoId || "")
        setResponsableId("")
        // Default start date to now
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        setFechaInicio(now.toISOString().slice(0, 16))
        setFechaFin("")
        setDiagnostico("")
        setTrabajoRealizado("")
        setObservacion("")
      }
    }
  }, [open, ordenTrabajo, initialSolicitudId, initialActivoId])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isValid = Boolean(
    solicitudMantenimientoId && activoId && responsableId,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    const payload: OrdenTrabajoPayload = {
      solicitudMantenimientoId,
      activoId,
      responsableId,
      fechaInicio: fechaInicio ? `${fechaInicio}:00` : null,
      fechaFin: fechaFin ? `${fechaFin}:00` : null,
      diagnostico: diagnostico.trim() || null,
      trabajoRealizado: trabajoRealizado.trim() || null,
      observacion: observacion.trim() || null,
    }

    if (isEditing && ordenTrabajo?.id) {
      const result = await updateMutation.mutateAsync({
        id: ordenTrabajo.id,
        payload,
      })
      onSuccess?.(result)
      onOpenChange(false)
    } else {
      const result = await createMutation.mutateAsync(payload)
      onSuccess?.(result)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              <Wrench className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {isEditing
                  ? `Editar Orden de Trabajo (${ordenTrabajo?.numero ?? ""})`
                  : "Nueva Orden de Trabajo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Modifica los datos principales y diagnóstico de la orden de trabajo."
                  : "Registra una orden de trabajo vinculada a una solicitud de mantenimiento."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Solicitud & Activo */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <FileText className="size-3 text-primary" />
                <span>Solicitud de Mantenimiento *</span>
              </Label>
              <SolicitudAsignadaCombobox
                value={solicitudMantenimientoId}
                onValueChange={(val, sol) => {
                  setSolicitudMantenimientoId(val)
                  if (sol?.activo?.id && !activoId) {
                    setActivoId(sol.activo.id)
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <span>Activo *</span>
              </Label>
              <ActivoCombobox
                value={activoId}
                onValueChange={(val) => setActivoId(val)}
              />
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Empleado Responsable de la Ejecución *
            </Label>
            <EmpleadoCombobox
              value={responsableId}
              onValueChange={(val) => setResponsableId(val)}
              placeholder="Buscar responsable por nombre o código…"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fechaInicio" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha / Hora de Inicio</span>
              </Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaFin" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha / Hora de Fin</span>
              </Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="space-y-1.5">
            <Label htmlFor="diagnostico" className="text-xs font-semibold">
              Diagnóstico Técnico Inicial
            </Label>
            <Textarea
              id="diagnostico"
              placeholder="Descripción del diagnóstico, fallas detectadas o estado del equipo..."
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              rows={2}
              maxLength={2000}
              className="text-xs resize-none"
            />
          </div>

          {/* Trabajo Realizado */}
          <div className="space-y-1.5">
            <Label htmlFor="trabajoRealizado" className="text-xs font-semibold">
              Trabajo Realizado / Solución Aplicada
            </Label>
            <Textarea
              id="trabajoRealizado"
              placeholder="Detalle de trabajos, reparaciones, calibraciones o reemplazos ejecutados..."
              value={trabajoRealizado}
              onChange={(e) => setTrabajoRealizado(e.target.value)}
              rows={2}
              maxLength={4000}
              className="text-xs resize-none"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label htmlFor="observacion" className="text-xs font-semibold">
              Observaciones Adicionales
            </Label>
            <Textarea
              id="observacion"
              placeholder="Recomendaciones futuras, precauciones o notas para el operador..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
              maxLength={2000}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 sm:pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || isSubmitting}
              className="h-8 text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Guardar Cambios" : "Crear Orden"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
