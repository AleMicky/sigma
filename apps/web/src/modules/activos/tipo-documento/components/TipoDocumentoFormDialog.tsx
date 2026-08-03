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
  useCreateTipoDocumento,
  useUpdateTipoDocumento,
} from "../api/tipo-documento.mutations"
import type { TipoDocumento } from "../api/tipo-documento.service"
import {
  defaultTipoDocumentoValues,
  tipoDocumentoSchema,
} from "../schemas/tipo-documento.schema"

type TipoDocumentoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoDocumento?: TipoDocumento | null
  onSuccess?: (tipoDocumento: TipoDocumento) => void
}

export function TipoDocumentoFormDialog({
  open,
  onOpenChange,
  tipoDocumento,
  onSuccess,
}: TipoDocumentoFormDialogProps) {
  const isEditing = Boolean(tipoDocumento)
  const createMutation = useCreateTipoDocumento()
  const updateMutation = useUpdateTipoDocumento()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoDocumento
      ? {
          codigo: tipoDocumento.codigo,
          nombre: tipoDocumento.nombre,
          descripcion: tipoDocumento.descripcion ?? "",
          requiereVencimiento: tipoDocumento.requiereVencimiento ?? false,
        }
      : defaultTipoDocumentoValues,
    validators: {
      onSubmit: tipoDocumentoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && tipoDocumento
            ? await updateMutation.mutateAsync({
                id: tipoDocumento.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion.trim() || null,
                  requiereVencimiento: value.requiereVencimiento,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                requiereVencimiento: value.requiereVencimiento,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de documento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar tipo de documento" : "Nuevo tipo de documento"}
      description={
        isEditing
          ? "Actualiza el código, nombre, descripción o si requiere fecha de vencimiento."
          : "Define un tipo de documento para los activos, por ejemplo Factura o póliza de seguro."
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
                placeholder="FACTURA"
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
                placeholder="Factura de compra"
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
                placeholder="Documento que acredita la adquisición del activo"
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="requiereVencimiento">
        {(field) => (
          <Field orientation="horizontal" className="pt-1">
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
              Requiere fecha de vencimiento
            </FieldLabel>
          </Field>
        )}
      </form.Field>
    </FormDialog>
  )
}
