import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Layers, Loader2, Plus, Trash2 } from "lucide-react"

import { isApiError } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import {
  useCreateActividadAplicacion,
  useDeleteActividadAplicacion,
} from "../api/actividad-aplicacion.mutations"
import { actividadAplicacionQueries } from "../api/actividad-aplicacion.queries"
import type {
  ActividadAplicacion,
} from "../api/actividad-aplicacion.service"
import type { ActividadMantenimiento } from "../api/actividad.service"
import {
  actividadAplicacionSchema,
  defaultActividadAplicacionValues,
} from "../schemas/actividad-aplicacion.schema"

type ActividadAplicacionesSheetProps = {
  actividad: ActividadMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActividadAplicacionesSheet({
  actividad,
  open,
  onOpenChange,
}: ActividadAplicacionesSheetProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleting, setDeleting] = useState<ActividadAplicacion | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateActividadAplicacion()
  const deleteMutation = useDeleteActividadAplicacion()

  const aplicacionesQuery = useQuery(
    actividadAplicacionQueries.byActividad(actividad?.id ?? ""),
  )

  const aplicaciones = aplicacionesQuery.data?.content ?? []

  const form = useForm({
    defaultValues: {
      ...defaultActividadAplicacionValues,
      actividadMantenimientoId: actividad?.id ?? "",
    },
    validators: {
      onSubmit: actividadAplicacionSchema,
    },
    onSubmit: async ({ value }) => {
      if (!actividad) return
      setFormError(null)

      try {
        await createMutation.mutateAsync({
          actividadMantenimientoId: actividad.id,
          tipoActivoId: value.tipoActivoId.trim(),
          componenteId: (value.componenteId ?? "").trim() || null,
        })
        form.reset({
          actividadMantenimientoId: actividad.id,
          tipoActivoId: "",
          componenteId: "",
        })
        setShowAddForm(false)
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo asociar la aplicación.",
        )
      }
    },
  })

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by toast
    }
  }

  if (!actividad) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="size-4" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase">
                {actividad.codigo}
              </span>
            </div>
            <SheetTitle className="font-heading text-lg font-bold">
              Aplicaciones a Tipos de Activo
            </SheetTitle>
            <SheetDescription className="text-xs">
              Configura para qué tipos de activos o componentes específicos es válida esta actividad.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
            {/* Top Action */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">
                Tipos de Activos Asociados ({aplicaciones.length})
              </p>
              {!showAddForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="size-3.5" />
                  Asociar Tipo de Activo
                </Button>
              )}
            </div>

            {/* Quick Create Form */}
            {showAddForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary text-xs">
                    Nueva Asociación
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormError(null)
                    }}
                    className="h-6 px-2 text-[11px]"
                  >
                    Cancelar
                  </Button>
                </div>

                {formError && (
                  <p className="text-[11px] font-medium text-destructive">
                    {formError}
                  </p>
                )}

                <form.Field name="tipoActivoId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        ID del Tipo de Activo *
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="UUID del Tipo de Activo"
                        className="h-8 text-xs"
                        required
                      />
                      {field.state.meta.isTouched && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="componenteId">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        ID Componente (Opcional)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="UUID del Componente"
                        className="h-8 text-xs"
                      />
                    </Field>
                  )}
                </form.Field>

                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                    className="h-7 text-xs"
                  >
                    {createMutation.isPending && (
                      <Loader2 className="size-3 mr-1 animate-spin" />
                    )}
                    Guardar Asociación
                  </Button>
                </div>
              </form>
            )}

            {/* List */}
            {aplicacionesQuery.isLoading ? (
              <ListSkeleton rows={3} className="flex flex-col gap-2" />
            ) : aplicaciones.length === 0 ? (
              <EmptyState
                icon={<Layers className="size-4 text-muted-foreground" />}
                title="Sin aplicaciones específicas"
                description={
                  actividad.aplicaTodosTiposActivo
                    ? "Esta actividad está configurada como 'Global' (aplica a todos los activos)."
                    : "Asocia al menos un Tipo de Activo para que esta actividad esté disponible."
                }
              />
            ) : (
              <ul className="space-y-2">
                {aplicaciones.map((app: ActividadAplicacion) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 shadow-2xs hover:border-primary/30 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {app.tipoActivo.nombre}
                        </Badge>
                        {app.componente && (
                          <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                            Comp: {app.componente.nombre}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleting(app)}
                      title="Eliminar asociación"
                      className="size-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="¿Eliminar asociación de tipo de activo?"
        description="Se retirará la aplicabilidad de esta actividad para este tipo de activo."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
