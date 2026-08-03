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
  useCreateTipoActivo,
  useUpdateTipoActivo,
} from "../api/tipo-activo.mutations"
import type { TipoActivo } from "../api/tipo-activo.service"
import { normalizeHexColor } from "../lib/tipo-activo-colors"
import {
  defaultTipoActivoValues,
  tipoActivoSchema,
  type TipoActivoDto,
} from "../schemas/tipo-activo.schema"
import { ColorPickerField } from "./ColorPickerField"
import { IconPickerField } from "./IconPickerField"

type TipoActivoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoActivo?: TipoActivo | null
  onSuccess?: (tipoActivo: TipoActivo) => void
}

export function TipoActivoFormDialog({
  open,
  onOpenChange,
  tipoActivo,
  onSuccess,
}: TipoActivoFormDialogProps) {
  const isEditing = Boolean(tipoActivo)
  const createMutation = useCreateTipoActivo()
  const updateMutation = useUpdateTipoActivo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoActivo
      ? {
          nombre: tipoActivo.nombre,
          descripcion: tipoActivo.descripcion ?? "",
          color: tipoActivo.color ?? "",
          icono: tipoActivo.icono ?? "",
        }
      : defaultTipoActivoValues,
    validators: {
      onSubmit: tipoActivoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: TipoActivoDto = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        color: value.color ? normalizeHexColor(value.color) : "",
        icono: value.icono.trim(),
      }

      try {
        const body = {
          nombre: payload.nombre,
          descripcion: payload.descripcion || null,
          color: payload.color || null,
          icono: payload.icono || null,
        }

        const saved =
          isEditing && tipoActivo
            ? await updateMutation.mutateAsync({
                id: tipoActivo.id,
                payload: body,
              })
            : await createMutation.mutateAsync(body)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de activo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={isEditing ? "Editar tipo de activo" : "Nuevo tipo de activo"}
      description={
        isEditing
          ? "Actualiza los datos, el color y el icono del tipo de activo."
          : "Define un tipo de activo, por ejemplo Vehículo o Equipo."
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
                placeholder="Vehículo"
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
                placeholder="Vehículos utilizados por la institución."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="color">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Color</FieldLabel>
                <ColorPickerField
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="icono">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Icono</FieldLabel>
                <IconPickerField
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>
    </FormDialog>
  )
}
