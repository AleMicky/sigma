import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { CalendarClock, FileCheck } from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
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
          ? "Actualiza la configuración de este tipo de documento y sus reglas de control de vencimiento."
          : "Define un nuevo tipo de documento para clasificar y parametrizar los adjuntos de los activos."
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
                Código Identificador
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value.toUpperCase().replace(/\s+/g, "_"))
                }
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="EJ: FACTURA, POLIZA_SEGURO"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código técnico único en mayúsculas (ej. POLIZA_SEGURO, GARANTIA).
              </p>
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
                placeholder="Factura de compra, Póliza de seguro vehicular"
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
                placeholder="Detalle o propósito de este tipo de documento..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="requiereVencimiento">
        {(field) => (
          <div
            onClick={() => field.handleChange(!field.state.value)}
            className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
              field.state.value
                ? "border-amber-500/40 bg-amber-500/5 text-amber-950 dark:text-amber-100"
                : "border-border/60 bg-muted/20 hover:bg-muted/40"
            }`}
          >
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 size-4 rounded border border-input accent-amber-600 dark:accent-amber-500 cursor-pointer"
            />
            <div className="flex-1 space-y-0.5">
              <label
                htmlFor={field.name}
                className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-foreground"
              >
                {field.state.value ? (
                  <CalendarClock className="size-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <FileCheck className="size-3.5 text-muted-foreground" />
                )}
                Requiere fecha de vencimiento
              </label>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {field.state.value
                  ? "Se exigirá registrar la fecha de expiración para activar avisos de caducidad en el activo."
                  : "Documento permanente. No se requerirá fecha de caducidad obligatoria."}
              </p>
            </div>
          </div>
        )}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && tipoDocumento ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={tipoDocumento} />
        </div>
      ) : null}
    </FormDialog>
  )
}
