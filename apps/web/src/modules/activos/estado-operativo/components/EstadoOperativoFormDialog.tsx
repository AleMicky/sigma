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
import { ColorPickerField } from "@/modules/activos/tipo-activo/components/ColorPickerField"

import {
  useCreateEstadoOperativo,
  useUpdateEstadoOperativo,
} from "../api/estado-operativo.mutations"
import type { EstadoOperativo } from "../api/estado-operativo.service"
import {
  defaultEstadoOperativoValues,
  estadoOperativoSchema,
} from "../schemas/estado-operativo.schema"

type EstadoOperativoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  estado?: EstadoOperativo | null
  onSuccess?: (estado: EstadoOperativo) => void
}

export function EstadoOperativoFormDialog({
  open,
  onOpenChange,
  estado,
  onSuccess,
}: EstadoOperativoFormDialogProps) {
  const isEditing = Boolean(estado)
  const createMutation = useCreateEstadoOperativo()
  const updateMutation = useUpdateEstadoOperativo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: estado
      ? {
          codigo: estado.codigo,
          nombre: estado.nombre,
          descripcion: estado.descripcion ?? "",
          color: estado.color ?? "#10B981",
        }
      : defaultEstadoOperativoValues,
    validators: {
      onSubmit: estadoOperativoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && estado
            ? await updateMutation.mutateAsync({
                id: estado.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion?.trim() || null,
                  color: value.color?.trim() || null,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion?.trim() || null,
                color: value.color?.trim() || null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el estado operativo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar estado operativo" : "Nuevo estado operativo"}
      description={
        isEditing
          ? "Actualiza la denominación, código o distintivo visual del estado operativo."
          : "Define un nuevo estado operativo para los activos de la institución."
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
                disabled={isEditing}
                placeholder="OPERATIVO, MANTENIMIENTO, INACTIVO..."
                className="font-mono text-sm uppercase"
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
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
                Nombre
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                placeholder="Operativo, En Mantenimiento, Fuera de Servicio..."
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="color">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>
                Color Distintivo
              </FieldLabel>
              <ColorPickerField
                id={field.name}
                value={field.state.value ?? "#10B981"}
                onChange={(color) => field.handleChange(color)}
                onBlur={field.handleBlur}
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
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
              <FieldLabel htmlFor={field.name}>
                Descripción
              </FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Detalla las condiciones asociadas a este estado..."
                rows={3}
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      {isEditing && estado && <AuditInfo data={estado} />}
    </FormDialog>
  )
}
