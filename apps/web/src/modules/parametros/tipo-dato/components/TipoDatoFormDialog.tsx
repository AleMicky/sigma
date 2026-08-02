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
  useCreateTipoDato,
  useUpdateTipoDato,
} from "../api/tipo-dato.mutations"
import type { TipoDato } from "../api/tipo-dato.service"
import {
  defaultTipoDatoValues,
  tipoDatoSchema,
  type TipoDatoDto,
} from "../schemas/tipo-dato.schema"

type TipoDatoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoDato?: TipoDato | null
  onSuccess?: (tipoDato: TipoDato) => void
}

export function TipoDatoFormDialog({
  open,
  onOpenChange,
  tipoDato,
  onSuccess,
}: TipoDatoFormDialogProps) {
  const isEditing = Boolean(tipoDato)
  const createMutation = useCreateTipoDato()
  const updateMutation = useUpdateTipoDato()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoDato
      ? {
          codigo: tipoDato.codigo,
          nombre: tipoDato.nombre,
          descripcion: tipoDato.descripcion ?? "",
          permiteOpciones: tipoDato.permiteOpciones,
        }
      : defaultTipoDatoValues,
    validators: {
      onSubmit: tipoDatoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: TipoDatoDto = {
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        permiteOpciones: value.permiteOpciones,
      }

      try {
        const saved =
          isEditing && tipoDato
            ? await updateMutation.mutateAsync({
                id: tipoDato.id,
                payload: {
                  ...payload,
                  descripcion: payload.descripcion || null,
                },
              })
            : await createMutation.mutateAsync({
                ...payload,
                descripcion: payload.descripcion || null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de dato.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar tipo de dato" : "Nuevo tipo de dato"}
      description={
        isEditing
          ? "Actualiza el código, nombre y opciones del tipo de dato."
          : "Define un tipo disponible para atributos, por ejemplo SELECT o FECHA."
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
                placeholder="SELECT"
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
                placeholder="Selección"
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
                placeholder="Lista de opciones (estado, marca, color)."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="permiteOpciones">
        {(field) => (
          <Field orientation="horizontal">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 rounded border border-input accent-primary"
            />
            <FieldLabel htmlFor={field.name} className="font-normal">
              Permite opciones de catálogo
            </FieldLabel>
          </Field>
        )}
      </form.Field>
    </FormDialog>
  )
}
