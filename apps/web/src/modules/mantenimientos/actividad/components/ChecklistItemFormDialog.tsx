import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckSquare, Loader2, Plus, PlusCircle, Save } from "lucide-react"

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
import { checklistItemQueries } from "../api/checklist-item.queries"
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
  const [isSubmittingAndNew, setIsSubmittingAndNew] = useState(false)

  const nombreInputRef = useRef<HTMLInputElement>(null)

  const createMutation = useCreateChecklistItem()
  const updateMutation = useUpdateChecklistItem()

  const isPending = createMutation.isPending || updateMutation.isPending

  // Consulta los ítems existentes de la aplicación para calcular el orden automático
  const checklistQuery = useQuery({
    ...checklistItemQueries.byAplicacionList(aplicacion?.id ?? ""),
    enabled: Boolean(open && aplicacion?.id && !item),
  })

  // Sincroniza el formulario al abrir o cambiar el ítem seleccionado
  useEffect(() => {
    if (open) {
      if (item) {
        setNombre(item.nombre)
        setDescripcion(item.descripcion ?? "")
        setOrden(item.orden)
      } else {
        setNombre("")
        setDescripcion("")
        const items = checklistQuery.data ?? []
        const maxOrden =
          items.length > 0
            ? Math.max(...items.map((i) => i.orden ?? 0))
            : 0
        setOrden(maxOrden > 0 ? maxOrden + 1 : nextOrder)
        setTimeout(() => {
          nombreInputRef.current?.focus()
        }, 50)
      }
      setFormError(null)
    }
  }, [open, item])

  // Ajusta el orden automático cuando cargan los ítems existentes
  useEffect(() => {
    if (open && !item && checklistQuery.data && nombre === "") {
      const items = checklistQuery.data
      const maxOrden =
        items.length > 0 ? Math.max(...items.map((i) => i.orden ?? 0)) : 0
      setOrden(maxOrden > 0 ? maxOrden + 1 : nextOrder)
    }
  }, [checklistQuery.data, open, item, nextOrder])

  async function handleSave(keepOpen: boolean = false) {
    if (!aplicacion) return
    if (!nombre.trim()) {
      setFormError("El nombre del ítem es obligatorio.")
      return
    }

    setFormError(null)
    if (keepOpen) {
      setIsSubmittingAndNew(true)
    }

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

      onSuccess?.()

      if (keepOpen && !isEditing) {
        setNombre("")
        setDescripcion("")
        setOrden((prev) => Number(prev) + 1)
        setTimeout(() => {
          nombreInputRef.current?.focus()
        }, 50)
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      setFormError(
        isApiError(error)
          ? error.message
          : "Ocurrió un error al guardar el ítem de verificación."
      )
    } finally {
      setIsSubmittingAndNew(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSave(false)
  }

  if (!aplicacion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
                ref={nombreInputRef}
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="checklist-orden">Orden</FieldLabel>
                {!isEditing && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Auto-asignado (#{orden})
                  </span>
                )}
              </div>
              <Input
                id="checklist-orden"
                type="number"
                min={0}
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
                className="text-xs font-mono"
                disabled={isPending}
              />
            </Field>
          </div>

          <DialogFooter className="border-t pt-4 gap-2 flex-col-reverse sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>

            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSave(true)}
                disabled={!nombre.trim() || isPending}
                className="gap-1.5 border border-border/80"
              >
                {isSubmittingAndNew ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlusCircle className="size-4 text-primary" />
                )}
                Guardar y registrar nuevo
              </Button>
            )}

            <Button
              type="submit"
              disabled={!nombre.trim() || isPending}
              className="gap-1.5"
            >
              {isPending && !isSubmittingAndNew ? (
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

