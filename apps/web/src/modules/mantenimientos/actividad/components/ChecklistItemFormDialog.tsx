import { useEffect, useState } from "react"
import { CheckSquare, Loader2, Plus, Save } from "lucide-react"

import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateChecklistItem,
  useUpdateChecklistItem,
} from "../api/checklist-item.mutations"
import type { ChecklistItem } from "../api/checklist-item.service"
import type { ActividadAplicacion } from "../api/actividad-aplicacion.service"

type ChecklistItemFormDialogProps = {
  aplicacion: ActividadAplicacion | null
  item?: ChecklistItem | null
  nextOrder?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ChecklistItemFormDialog({
  aplicacion,
  item,
  nextOrder = 1,
  open,
  onOpenChange,
  onSuccess,
}: ChecklistItemFormDialogProps) {
  const isEditing = Boolean(item)

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [orden, setOrden] = useState(nextOrder)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateChecklistItem()
  const updateMutation = useUpdateChecklistItem()

  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      if (item) {
        setNombre(item.nombre)
        setDescripcion(item.descripcion ?? "")
        setOrden(item.orden)
      } else {
        setNombre("")
        setDescripcion("")
        setOrden(nextOrder)
      }
      setFormError(null)
    }
  }, [open, item, nextOrder])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!aplicacion) return
    if (!nombre.trim()) {
      setFormError("El nombre del ítem es obligatorio.")
      return
    }

    setFormError(null)

    try {
      if (isEditing && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          payload: {
            actividadMantenimientoAplicacionId: aplicacion.id,
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            orden: Number(orden) || 0,
          },
        })
      } else {
        await createMutation.mutateAsync({
          actividadMantenimientoAplicacionId: aplicacion.id,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          orden: Number(orden) || 0,
        })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      setFormError(
        isApiError(error)
          ? error.message
          : "Ocurrió un error al guardar el ítem de verificación."
      )
    }
  }

  if (!aplicacion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <CheckSquare className="size-4" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase">
                {aplicacion.tipoActivo?.nombre ?? "Aplicación"}
              </span>
            </div>
            <DialogTitle className="font-heading text-lg font-bold">
              {isEditing ? "Editar Ítem de Checklist" : "Nuevo Ítem de Checklist"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? "Modifica el paso de verificación para este tipo de activo."
                : `Agrega un paso de control para ${aplicacion.tipoActivo?.nombre ?? "este tipo de activo"}${aplicacion.componente ? ` (${aplicacion.componente.nombre})` : ""}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {formError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {formError}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="checklist-nombre">
                Nombre / Tarea <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="checklist-nombre"
                placeholder="Ej. Revisión de niveles de aceite"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={200}
                required
                className="text-xs"
                disabled={isPending}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="checklist-descripcion">
                Descripción / Instrucción
              </FieldLabel>
              <Textarea
                id="checklist-descripcion"
                placeholder="Instrucciones detalladas de verificación o criterio de aceptación..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                maxLength={500}
                rows={3}
                className="text-xs resize-none"
                disabled={isPending}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="checklist-orden">Orden</FieldLabel>
              <Input
                id="checklist-orden"
                type="number"
                min={0}
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                className="text-xs"
                disabled={isPending}
              />
            </Field>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!nombre.trim() || isPending}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditing ? (
                <Save className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {isEditing ? "Guardar Cambios" : "Agregar Ítem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
