import { useState } from "react"
import { useForm } from "@tanstack/react-form"

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
