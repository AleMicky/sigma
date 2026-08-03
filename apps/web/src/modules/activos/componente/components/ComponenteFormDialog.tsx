import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateComponente,
  useUpdateComponente,
} from "../api/componente.mutations"
import type { Componente } from "../api/componente.service"
import {
  defaultComponenteValues,
  componenteSchema,
} from "../schemas/componente.schema"

type ComponenteFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoActivoId: string
  componente?: Componente | null
  onSuccess?: () => void
}

export function ComponenteFormDialog({
  open,
  onOpenChange,
  tipoActivoId,
  componente,
  onSuccess,
}: ComponenteFormDialogProps) {
  const isEditing = Boolean(componente)
  const createMutation = useCreateComponente()
  const updateMutation = useUpdateComponente()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: componente
      ? {
          codigo: componente.codigo,
          nombre: componente.nombre,
          descripcion: componente.descripcion ?? "",
        }
      : defaultComponenteValues,
    validators: {
      onSubmit: componenteSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const payload = {
        tipoActivoId,
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      }

      try {
        if (isEditing && componente) {
          await updateMutation.mutateAsync({
            id: componente.id,
            payload,
          })
        } else {
          await createMutation.mutateAsync(payload)
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el componente.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar componente" : "Crear componente"}
      description={
        isEditing
          ? "Actualiza la parte o subconjunto del tipo de activo."
          : "Define una parte o subconjunto, por ejemplo motor o freno."
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
                Código
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
                placeholder="MOTOR"
              />
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
                aria-invalid={isInvalid}
                placeholder="Motor"
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
                placeholder="Motor del vehículo"
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
