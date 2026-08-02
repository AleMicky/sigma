import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import {
  useCreateCatalogo,
  useUpdateCatalogo,
} from "../api/catalogo.mutations"
import type { Catalogo } from "../api/catalogo.service"
import {
  catalogoSchema,
  defaultCatalogoValues,
  type CatalogoDto,
} from "../schemas/catalogo.schema"

type CatalogoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogo?: Catalogo | null
  onSuccess?: (catalogo: Catalogo) => void
}

export function CatalogoFormDialog({
  open,
  onOpenChange,
  catalogo,
  onSuccess,
}: CatalogoFormDialogProps) {
  const isEditing = Boolean(catalogo)
  const createMutation = useCreateCatalogo()
  const updateMutation = useUpdateCatalogo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: catalogo
      ? { codigo: catalogo.codigo, nombre: catalogo.nombre }
      : defaultCatalogoValues,
    validators: {
      onSubmit: catalogoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: CatalogoDto = {
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
      }

      try {
        const saved =
          isEditing && catalogo
            ? await updateMutation.mutateAsync({
                id: catalogo.id,
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
            : "No se pudo guardar el catálogo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar catálogo" : "Nuevo catálogo"}
      description={
        isEditing
          ? "Actualiza el código y nombre del catálogo maestro."
          : "Define un catálogo maestro, por ejemplo Tipo de documento."
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
                placeholder="TIPO_DOCUMENTO"
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
                placeholder="Tipo de documento"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
