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

import { useUpdatePeriodo } from "../api/periodo.mutations"
import type { Periodo } from "../api/periodo.service"
import { periodoSchema } from "../schemas/periodo.schema"

type PeriodoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodo: Periodo
  onSuccess?: () => void
}

export function PeriodoFormDialog({
  open,
  onOpenChange,
  periodo,
  onSuccess,
}: PeriodoFormDialogProps) {
  const updateMutation = useUpdatePeriodo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      literal: periodo.literal,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
    },
    validators: {
      onSubmit: periodoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        await updateMutation.mutateAsync({
          id: periodo.id,
          payload: {
            gestionId: periodo.gestionId,
            periodo: periodo.periodo,
            literal: value.literal.trim(),
            fechaInicio: value.fechaInicio,
            fechaFin: value.fechaFin,
          },
        })

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el período.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Editar período ${periodo.periodo}`}
      description="Puedes ajustar el literal y las fechas del período."
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
      <form.Field name="literal">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Literal
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
                placeholder="Enero"
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
