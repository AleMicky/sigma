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
  useCreateTipoMantenimiento,
  useUpdateTipoMantenimiento,
} from "../api/tipo-mantenimiento.mutations"
import type { TipoMantenimiento } from "../api/tipo-mantenimiento.service"
import {
  defaultTipoMantenimientoValues,
  tipoMantenimientoSchema,
} from "../schemas/tipo-mantenimiento.schema"

type TipoMantenimientoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoMantenimiento?: TipoMantenimiento | null
  onSuccess?: (tipoMantenimiento: TipoMantenimiento) => void
}

export function TipoMantenimientoFormDialog({
  open,
  onOpenChange,
  tipoMantenimiento,
  onSuccess,
}: TipoMantenimientoFormDialogProps) {
  const isEditing = Boolean(tipoMantenimiento)
  const createMutation = useCreateTipoMantenimiento()
  const updateMutation = useUpdateTipoMantenimiento()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoMantenimiento
      ? {
          codigo: tipoMantenimiento.codigo,
          nombre: tipoMantenimiento.nombre,
          descripcion: tipoMantenimiento.descripcion ?? "",
        }
      : defaultTipoMantenimientoValues,
    validators: {
      onSubmit: tipoMantenimientoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && tipoMantenimiento
            ? await updateMutation.mutateAsync({
                id: tipoMantenimiento.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: (value.descripcion ?? "").trim() || null,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: (value.descripcion ?? "").trim() || null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={isEditing ? "Editar tipo de mantenimiento" : "Nuevo tipo de mantenimiento"}
      description={
        isEditing
          ? "Actualiza los datos de este tipo de mantenimiento."
          : "Define un nuevo tipo de mantenimiento para clasificar las órdenes de trabajo."
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
          const isInvalid = Boolean(field.state.meta.errors.length)

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
                  field.handleChange(e.target.value.toUpperCase().replace(/\s+/g, "_"))
                }
                aria-required
                aria-invalid={isInvalid}
                placeholder="EJ: PREVENTIVO, CORRECTIVO, PREDICTIVO"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código técnico único en mayúsculas (ej. PREVENTIVO, CORRECTIVO).
              </p>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid = Boolean(field.state.meta.errors.length)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nombre
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-required
                aria-invalid={isInvalid}
                placeholder="Mantenimiento Preventivo, Mantenimiento Correctivo..."
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid = Boolean(field.state.meta.errors.length)

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
                placeholder="Detalle o alcance de este tipo de mantenimiento..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && tipoMantenimiento ? (
        <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1 mt-1 text-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={tipoMantenimiento} compact />
        </div>
      ) : null}
    </FormDialog>
  )
}
