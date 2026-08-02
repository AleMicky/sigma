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
  useCreateGestion,
  useUpdateGestion,
} from "../api/gestion.mutations"
import type { Gestion } from "../api/gestion.service"
import {
  datesForGestionYear,
  defaultGestionValues,
  gestionSchema,
  type GestionDto,
} from "../schemas/gestion.schema"

type GestionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  gestion?: Gestion | null
  onSuccess?: (gestion: Gestion) => void
}

export function GestionFormDialog({
  open,
  onOpenChange,
  gestion,
  onSuccess,
}: GestionFormDialogProps) {
  const isEditing = Boolean(gestion)
  const createMutation = useCreateGestion()
  const updateMutation = useUpdateGestion()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: gestion
      ? {
          gestion: gestion.gestion,
          fechaInicio: gestion.fechaInicio,
          fechaFin: gestion.fechaFin,
        }
      : defaultGestionValues,
    validators: {
      onSubmit: gestionSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: GestionDto = {
        gestion: value.gestion,
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
      }

      try {
        const saved =
          isEditing && gestion
            ? await updateMutation.mutateAsync({
                id: gestion.id,
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
            : "No se pudo guardar la gestión.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar gestión" : "Nueva gestión"}
      description={
        isEditing
          ? "Actualiza el año y las fechas de la gestión."
          : "Al crear la gestión se generarán automáticamente los 12 períodos."
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
      <form.Field name="gestion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Gestión (año)
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min={2000}
                max={2100}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const year =
                    e.target.value === "" ? NaN : Number(e.target.value)
                  field.handleChange(year)

                  if (
                    !isEditing &&
                    Number.isInteger(year) &&
                    year >= 2000 &&
                    year <= 2100
                  ) {
                    const dates = datesForGestionYear(year)
                    form.setFieldValue("fechaInicio", dates.fechaInicio)
                    form.setFieldValue("fechaFin", dates.fechaFin)
                  }
                }}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="2026"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="fechaInicio">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Fecha inicio
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="date"
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

      <form.Field name="fechaFin">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Fecha fin
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="date"
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
    </FormDialog>
  )
}
