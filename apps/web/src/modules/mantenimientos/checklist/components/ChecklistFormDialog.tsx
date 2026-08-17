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
  useCreateChecklist,
  useUpdateChecklist,
} from "../api/checklist.mutations"
import type { ChecklistMantenimiento } from "../api/checklist.service"
import {
  checklistSchema,
  defaultChecklistValues,
} from "../schemas/checklist.schema"

type ChecklistFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklist?: ChecklistMantenimiento | null
  onSuccess?: (checklist: ChecklistMantenimiento) => void
}

export function ChecklistFormDialog({
  open,
  onOpenChange,
  checklist,
  onSuccess,
}: ChecklistFormDialogProps) {
  const isEditing = Boolean(checklist)
  const createMutation = useCreateChecklist()
  const updateMutation = useUpdateChecklist()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: checklist
      ? {
          actividadMantenimientoId: checklist.actividadMantenimiento?.id ?? "",
          codigo: checklist.codigo,
          nombre: checklist.nombre,
          descripcion: checklist.descripcion ?? "",
        }
      : defaultChecklistValues,
    validators: {
      onSubmit: checklistSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          actividadMantenimientoId: value.actividadMantenimientoId.trim(),
          codigo: value.codigo.trim(),
          nombre: value.nombre.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
        }

        const saved =
          isEditing && checklist
            ? await updateMutation.mutateAsync({
                id: checklist.id,
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
            : "No se pudo guardar el checklist de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar checklist" : "Nuevo checklist de mantenimiento"}
      description={
        isEditing
          ? "Actualiza la configuración general de este checklist."
          : "Crea una nueva plantilla de checklist y asóciala a una actividad de mantenimiento."
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
      <form.Field name="actividadMantenimientoId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                ID Actividad de Mantenimiento
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
                placeholder="UUID de la Actividad"
              />
              <p className="text-[11px] text-muted-foreground">
                Actividad a la cual pertenece este checklist de verificación.
              </p>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

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
                placeholder="EJ: CHK-MOTOR-001"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código único en mayúsculas (ej. CHK-ACEITE-001).
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
                Nombre del Checklist
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
                placeholder="Ej. Inspección de fluidos y niveles"
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
                placeholder="Instrucciones generales para el técnico ejecutor..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && checklist ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={checklist} />
        </div>
      ) : null}
    </FormDialog>
  )
}
