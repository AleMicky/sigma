import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { Globe2 } from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import {
  useCreateActividad,
  useUpdateActividad,
} from "../api/actividad.mutations"
import type { ActividadMantenimiento } from "../api/actividad.service"
import {
  defaultActividadValues,
  actividadSchema,
} from "../schemas/actividad.schema"

type ActividadFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actividad?: ActividadMantenimiento | null
  onSuccess?: (actividad: ActividadMantenimiento) => void
}

export function ActividadFormDialog({
  open,
  onOpenChange,
  actividad,
  onSuccess,
}: ActividadFormDialogProps) {
  const isEditing = Boolean(actividad)
  const createMutation = useCreateActividad()
  const updateMutation = useUpdateActividad()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: actividad
      ? {
        codigo: actividad.codigo,
        nombre: actividad.nombre,
        descripcion: actividad.descripcion ?? "",
        aplicaTodosTiposActivo: actividad.aplicaTodosTiposActivo ?? false,
      }
      : defaultActividadValues,
    validators: {
      onSubmit: actividadSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          codigo: value.codigo.trim(),
          nombre: value.nombre.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
          aplicaTodosTiposActivo: value.aplicaTodosTiposActivo,
        }

        const saved =
          isEditing && actividad
            ? await updateMutation.mutateAsync({
              id: actividad.id,
              payload,
            })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la actividad de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar actividad" : "Nueva actividad de mantenimiento"}
      description={
        isEditing
          ? "Actualiza los parámetros de esta actividad de mantenimiento."
          : "Define una nueva actividad en el catálogo maestro."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) =>
            [state.canSubmit, state.isSubmitting] as const
          }
        >
          {([canSubmit, isSubmitting]) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </form.Subscribe>
      }
    >
      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Código Identificador
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  )
                }
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="EJ: ACT-001"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código único en mayúsculas, números o guiones.
              </p>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nombre de la Actividad
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="Ej. Cambio de Aceite"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Detalla las instrucciones o alcance de esta actividad..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="pt-0.5">
        <form.Field name="aplicaTodosTiposActivo">
          {(field) => (
            <label
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all select-none",
                field.state.value
                  ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                  : "border-border/80 hover:bg-muted/30 hover:border-border",
              )}
            >
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-3.5 mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Globe2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Aplica a todos los tipos de activo</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Universal para todo tipo de activo.
                </p>
              </div>
            </label>
          )}
        </form.Field>
      </div>

      {/* Audit info in edit mode */}
      {isEditing && actividad ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={actividad} />
        </div>
      ) : null}
    </FormDialog>
  )
}
