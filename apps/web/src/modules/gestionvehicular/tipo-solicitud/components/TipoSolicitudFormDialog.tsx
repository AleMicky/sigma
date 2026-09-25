import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { FileCode2, FileText } from "lucide-react"

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
  useCreateTipoSolicitudVehicular,
  useUpdateTipoSolicitudVehicular,
} from "../api/tipo-solicitud.mutations"
import type { TipoSolicitudVehicular } from "../api/tipo-solicitud.service"
import {
  defaultTipoSolicitudVehicularValues,
  tipoSolicitudVehicularSchema,
} from "../schemas/tipo-solicitud.schema"

type TipoSolicitudFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoSolicitud?: TipoSolicitudVehicular | null
  onSuccess?: (tipoSolicitud: TipoSolicitudVehicular) => void
}

export function TipoSolicitudFormDialog({
  open,
  onOpenChange,
  tipoSolicitud,
  onSuccess,
}: TipoSolicitudFormDialogProps) {
  const isEditing = Boolean(tipoSolicitud)
  const createMutation = useCreateTipoSolicitudVehicular()
  const updateMutation = useUpdateTipoSolicitudVehicular()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: tipoSolicitud
      ? {
          codigo: tipoSolicitud.codigo,
          nombre: tipoSolicitud.nombre,
          descripcion: tipoSolicitud.descripcion ?? "",
        }
      : defaultTipoSolicitudVehicularValues,
    validators: {
      onChange: tipoSolicitudVehicularSchema,
      onSubmit: tipoSolicitudVehicularSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          codigo: value.codigo.trim().toUpperCase(),
          nombre: value.nombre.trim(),
          descripcion: value.descripcion?.trim() || null,
        }

        const saved =
          isEditing && tipoSolicitud
            ? await updateMutation.mutateAsync({ id: tipoSolicitud.id, payload })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el tipo de solicitud vehicular."
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing
          ? "Editar Tipo de Solicitud"
          : "Registrar Nuevo Tipo de Solicitud"
      }
      description={
        isEditing
          ? "Actualiza el código, denominación o descripción del tipo de solicitud."
          : "Define un nuevo motivo o tipo de solicitud para la flota vehicular."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
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
      <div className="flex flex-col gap-4 py-1">
        {/* 1. Código */}
        <form.Field name="codigo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Código Identificador</RequiredFieldLabel>
                </FieldLabel>
                <div className="relative">
                  <FileCode2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value.toUpperCase().replace(/\s+/g, "_")
                      )
                    }
                    onBlur={field.handleBlur}
                    placeholder="Ej. COMISION_SERVICIO"
                    className="pl-9 font-mono uppercase"
                    aria-invalid={isInvalid}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 2. Nombre */}
        <form.Field name="nombre">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Nombre / Motivo</RequiredFieldLabel>
                </FieldLabel>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Ej. Comisión de Servicio"
                    className="pl-9"
                    aria-invalid={isInvalid}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 3. Descripción */}
        <form.Field name="descripcion">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <span>Descripción (Opcional)</span>
                </FieldLabel>
                <div className="relative">
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Describe el alcance y propósitos de este tipo de solicitud vehicular…"
                    rows={3}
                    className="resize-none"
                    aria-invalid={isInvalid}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>
    </FormDialog>
  )
}
