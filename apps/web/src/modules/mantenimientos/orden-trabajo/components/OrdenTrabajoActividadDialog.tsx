import { useEffect, useState } from "react"
import { Calendar, CheckSquare, Loader2, Save } from "lucide-react"

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
  useCreateOrdenTrabajoActividad,
  useUpdateOrdenTrabajoActividad,
} from "../api/orden-trabajo.mutations"
import type {
  OrdenTrabajoActividad,
  OrdenTrabajoActividadPayload,
} from "../api/orden-trabajo.service"
import { ActividadMantenimientoCombobox } from "./ActividadMantenimientoCombobox"

type OrdenTrabajoActividadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajoId: string
  actividad?: OrdenTrabajoActividad | null
  onSuccess?: () => void
}

export function OrdenTrabajoActividadDialog({
  open,
  onOpenChange,
  ordenTrabajoId,
  actividad,
  onSuccess,
}: OrdenTrabajoActividadDialogProps) {
  const isEditing = Boolean(actividad?.id)

  const createMutation = useCreateOrdenTrabajoActividad()
  const updateMutation = useUpdateOrdenTrabajoActividad()

  const [actividadMantenimientoId, setActividadMantenimientoId] =
    useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [realizado, setRealizado] = useState<boolean>(false)
  const [observacion, setObservacion] = useState<string>("")
  const [fechaRealizacion, setFechaRealizacion] = useState<string>("")

  useEffect(() => {
    if (open) {
      if (actividad) {
        setActividadMantenimientoId(
          actividad.actividadMantenimiento?.id || "",
        )
        setDescripcion(actividad.descripcion || "")
        setRealizado(actividad.realizado || false)
        setObservacion(actividad.observacion || "")
        setFechaRealizacion(
          actividad.fechaRealizacion
            ? actividad.fechaRealizacion.slice(0, 16)
            : "",
        )
      } else {
        setActividadMantenimientoId("")
        setDescripcion("")
        setRealizado(false)
        setObservacion("")
        setFechaRealizacion("")
      }
    }
  }, [open, actividad])

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isValid = Boolean(descripcion.trim() && ordenTrabajoId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    const payload: OrdenTrabajoActividadPayload = {
      ordenTrabajoId,
      actividadMantenimientoId: actividadMantenimientoId || null,
      descripcion: descripcion.trim(),
      realizado,
      observacion: observacion.trim() || null,
      fechaRealizacion: fechaRealizacion ? `${fechaRealizacion}:00` : null,
    }

    if (isEditing && actividad?.id) {
      await updateMutation.mutateAsync({
        id: actividad.id,
        payload,
      })
      onSuccess?.()
      onOpenChange(false)
    } else {
      await createMutation.mutateAsync(payload)
      onSuccess?.()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckSquare className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Editar Actividad" : "Agregar Actividad / Tarea"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Especifica la tarea a realizar como parte del mantenimiento.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Actividad del Catálogo (Opcional)
            </Label>
            <ActividadMantenimientoCombobox
              value={actividadMantenimientoId}
              onValueChange={(val, act) => {
                setActividadMantenimientoId(val)
                if (act?.nombre && !descripcion) {
                  setDescripcion(act.nombre)
                }
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="act-desc" className="text-xs font-semibold">
              Descripción de la Tarea / Actividad *
            </Label>
            <Input
              id="act-desc"
              placeholder="Ej: Cambio de aceite y filtro, calibración de válvulas..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="h-8.5 text-xs"
              required
              maxLength={1000}
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border p-2.5 bg-muted/20">
            <input
              type="checkbox"
              id="act-realizado"
              checked={realizado}
              onChange={(e) => {
                const checked = e.target.checked
                setRealizado(checked)
                if (checked && !fechaRealizacion) {
                  const now = new Date()
                  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
                  setFechaRealizacion(now.toISOString().slice(0, 16))
                }
              }}
              className="size-4 rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="act-realizado"
              className="text-xs font-semibold text-foreground cursor-pointer select-none"
            >
              ¿Actividad realizada / ejecutada?
            </label>
          </div>

          {realizado && (
            <div className="space-y-1.5">
              <Label htmlFor="act-fecha" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha / Hora de Realización</span>
              </Label>
              <Input
                id="act-fecha"
                type="datetime-local"
                value={fechaRealizacion}
                onChange={(e) => setFechaRealizacion(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="act-obs" className="text-xs font-semibold">
              Observaciones del Técnico
            </Label>
            <Textarea
              id="act-obs"
              placeholder="Resultados, observaciones de la actividad o medidas tomadas..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
              maxLength={1500}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
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
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Guardar Cambios" : "Agregar Tarea"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
