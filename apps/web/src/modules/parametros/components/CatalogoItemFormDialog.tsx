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

import {
  useCreateCatalogoItem,
  useUpdateCatalogoItem,
} from "../api/catalogo-item.mutations"
import type { CatalogoItem } from "../api/catalogo-item.service"
import {
  catalogoItemSchema,
  defaultCatalogoItemValues,
} from "../schemas/catalogo-item.schema"

type CatalogoItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogoId: string
  item?: CatalogoItem | null
  onSuccess?: () => void
}

export function CatalogoItemFormDialog({
  open,
  onOpenChange,
  catalogoId,
  item,
  onSuccess,
}: CatalogoItemFormDialogProps) {
  const isEditing = Boolean(item)
  const createMutation = useCreateCatalogoItem()
  const updateMutation = useUpdateCatalogoItem()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: item
      ? {
          nombre: item.nombre,
          valor: item.valor,
          orden: item.orden,
        }
      : defaultCatalogoItemValues,
    validators: {
      onSubmit: catalogoItemSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        if (isEditing && item) {
          await updateMutation.mutateAsync({
            id: item.id,
            payload: {
              catalogoId,
              nombre: value.nombre.trim(),
              valor: value.valor.trim(),
              orden: value.orden ?? 0,
            },
          })
        } else {
          await createMutation.mutateAsync({
            catalogoId,
            nombre: value.nombre.trim(),
            valor: value.valor.trim(),
            orden: null,
          })
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el valor.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar valor" : "Agregar valor"}
      description={
        isEditing
          ? "Actualiza el ítem del catálogo seleccionado."
          : "Agrega un ítem hijo, por ejemplo CI o Pasaporte."
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
      <form.Field name="valor">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Valor
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
                placeholder="CI"
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
                placeholder="Cédula de identidad"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {isEditing ? (
        <form.Field name="orden">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Orden</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  value={field.state.value ?? 0}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      ) : (
        <p className="text-xs text-muted-foreground">
          El orden se asigna automáticamente al crear el valor.
        </p>
      )}
    </FormDialog>
  )
}
