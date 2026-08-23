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
  useCreateTipoInsumo,
  useUpdateTipoInsumo,
} from "../api/tipo-insumo.mutations"
import type { TipoInsumo } from "../api/tipo-insumo.service"
import {
  defaultTipoInsumoValues,
  tipoInsumoSchema,
} from "../schemas/tipo-insumo.schema"

type TipoInsumoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoInsumo?: TipoInsumo | null
  onSuccess?: (tipoInsumo: TipoInsumo) => void
}

export function TipoInsumoFormDialog({
  open,
  onOpenChange,
  tipoInsumo,
  onSuccess,
}: TipoInsumoFormDialogProps) {
  const isEditing = Boolean(tipoInsumo)
  const createMutation = useCreateTipoInsumo()
  const updateMutation = useUpdateTipoInsumo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoInsumo
      ? {
          codigo: tipoInsumo.codigo,
          nombre: tipoInsumo.nombre,
          descripcion: tipoInsumo.descripcion ?? "",
        }
      : defaultTipoInsumoValues,
    validators: {
      onSubmit: tipoInsumoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && tipoInsumo
            ? await updateMutation.mutateAsync({
                id: tipoInsumo.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion?.trim() || null,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion?.trim() || null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de insumo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar tipo de insumo" : "Nuevo tipo de insumo"}
      description={
        isEditing
          ? "Actualiza el código, nombre o descripción del tipo de insumo."
          : "Define un tipo de insumo para clasificar y agregar atributos personalizados dinámicos."
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
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
