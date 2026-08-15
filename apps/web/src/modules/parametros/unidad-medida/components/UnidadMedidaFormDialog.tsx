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
  useCreateUnidadMedida,
  useUpdateUnidadMedida,
} from "../api/unidad-medida.mutations"
import type { UnidadMedida } from "../api/unidad-medida.service"
import {
  defaultUnidadMedidaValues,
  unidadMedidaSchema,
  type UnidadMedidaDto,
} from "../schemas/unidad-medida.schema"

type UnidadMedidaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unidadMedida?: UnidadMedida | null
  onSuccess?: (unidadMedida: UnidadMedida) => void
}

export function UnidadMedidaFormDialog({
  open,
  onOpenChange,
  unidadMedida,
  onSuccess,
}: UnidadMedidaFormDialogProps) {
  const isEditing = Boolean(unidadMedida)
  const createMutation = useCreateUnidadMedida()
  const updateMutation = useUpdateUnidadMedida()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: unidadMedida
      ? {
          codigo: unidadMedida.codigo,
          nombre: unidadMedida.nombre,
          simbolo: unidadMedida.simbolo,
          permiteDecimal: unidadMedida.permiteDecimal,
        }
      : defaultUnidadMedidaValues,
    validators: {
      onSubmit: unidadMedidaSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: UnidadMedidaDto = {
        codigo: isEditing && unidadMedida ? unidadMedida.codigo : value.codigo.trim().toUpperCase(),
        nombre: value.nombre.trim(),
        simbolo: value.simbolo.trim(),
        permiteDecimal: value.permiteDecimal,
      }

      try {
        const saved =
          isEditing && unidadMedida
            ? await updateMutation.mutateAsync({
                id: unidadMedida.id,
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
            : "No se pudo guardar la unidad de medida.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar unidad de medida" : "Nueva unidad de medida"}
      description={
        isEditing
          ? "Actualiza el nombre, símbolo y comportamiento decimal. El código es inmutable."
          : "Registra una nueva unidad de medida estándar (ejemplo: Kilogramo, Metro, Pieza)."
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
      {/* Código */}
      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            !isEditing &&
            field.state.meta.isTouched &&
            !field.state.meta.isValid

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
                onChange={(e) => {
                  if (!isEditing) {
                    field.handleChange(e.target.value.toUpperCase())
                  }
                }}
                required
                disabled={isEditing}
                readOnly={isEditing}
                aria-required
                aria-invalid={isInvalid}
                aria-readonly={isEditing || undefined}
                placeholder="KG, M, PZA"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Nombre */}
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
                placeholder="Kilogramo, Metro, Pieza"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Símbolo */}
      <form.Field name="simbolo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Símbolo
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
                placeholder="kg, m, pza"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Permite Decimal */}
      <form.Field name="permiteDecimal">
        {(field) => (
          <Field className="pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-border/80 p-3.5 bg-muted/30">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="mt-0.5 size-4 rounded border-input text-primary accent-primary cursor-pointer"
              />
              <div className="space-y-0.5">
                <FieldLabel
                  htmlFor={field.name}
                  className="font-medium text-foreground cursor-pointer"
                >
                  Permite valores decimales
                </FieldLabel>
                <p className="text-xs text-muted-foreground">
                  Marca esta opción si las cantidades medidas pueden incluir fracciones (ejemplo: 1.50 kg, 2.75 m). Déjala desmarcada para unidades discretas (ejemplo: 5 piezas).
                </p>
              </div>
            </div>
          </Field>
        )}
      </form.Field>
    </FormDialog>
  )
}
