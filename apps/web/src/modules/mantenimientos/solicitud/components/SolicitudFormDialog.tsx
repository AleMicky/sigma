import { useState } from "react"
import { useForm } from "@tanstack/react-form"

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
  useCreateSolicitud,
  useUpdateSolicitud,
} from "../api/solicitud.mutations"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  defaultSolicitudValues,
  solicitudSchema,
} from "../schemas/solicitud.schema"

type SolicitudFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudMantenimiento | null
  onSuccess?: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudFormDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccess,
}: SolicitudFormDialogProps) {
  const isEditing = Boolean(solicitud)
  const createMutation = useCreateSolicitud()
  const updateMutation = useUpdateSolicitud()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: solicitud
      ? {
          titulo: solicitud.titulo,
          descripcion: solicitud.descripcion ?? "",
          activoId: solicitud.activoId,
          tipoMantenimientoId: solicitud.tipoMantenimientoId,
          motivoMantenimientoId: solicitud.motivoMantenimientoId ?? "",
          prioridadId: solicitud.prioridadId,
          solicitanteId: solicitud.solicitanteId,
          areaSolicitanteId: solicitud.areaSolicitanteId,
        }
      : defaultSolicitudValues,
    validators: {
      onSubmit: solicitudSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          titulo: value.titulo.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
          activoId: value.activoId.trim(),
          tipoMantenimientoId: value.tipoMantenimientoId.trim(),
          motivoMantenimientoId: (value.motivoMantenimientoId ?? "").trim() || null,
          prioridadId: value.prioridadId.trim(),
          solicitanteId: value.solicitanteId.trim(),
          areaSolicitanteId: value.areaSolicitanteId.trim(),
        }

        const saved =
          isEditing && solicitud
            ? await updateMutation.mutateAsync({
                id: solicitud.id,
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
            : "No se pudo guardar la solicitud de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar solicitud" : "Nueva solicitud"}
      description={
        isEditing
          ? "Actualiza los datos de esta solicitud de mantenimiento."
          : "Registra una nueva solicitud de mantenimiento para un activo."
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
      <form.Field name="titulo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Título de la Solicitud
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
                placeholder="Ej. Falla en motor / Mantenimiento preventivo"
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
              <FieldLabel htmlFor={field.name}>Descripción / Detalle</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Describe el motivo, síntomas de falla o requerimientos..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form.Field name="activoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  ID del Activo
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="UUID del Activo"
                  required
                  aria-required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="prioridadId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  ID de la Prioridad
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="UUID de Prioridad"
                  required
                  aria-required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form.Field name="tipoMantenimientoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  ID Tipo Mantenimiento
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="UUID Tipo Mantenimiento"
                  required
                  aria-required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="solicitanteId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  ID Solicitante
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="UUID del Solicitante"
                  required
                  aria-required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="areaSolicitanteId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                ID Área Solicitante
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="UUID del Área"
                required
                aria-required
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && solicitud ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={solicitud} />
        </div>
      ) : null}
    </FormDialog>
  )
}
