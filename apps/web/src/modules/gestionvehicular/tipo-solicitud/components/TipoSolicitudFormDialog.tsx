import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { CalendarClock, FileCheck, FileCode2, FileSpreadsheet, FileText } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

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
          diasAnticipacion: tipoSolicitud.diasAnticipacion ?? 0,
          requiereRespaldo: tipoSolicitud.requiereRespaldo ?? false,
          requiereJustificacion: tipoSolicitud.requiereJustificacion ?? false,
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
          diasAnticipacion: Number(value.diasAnticipacion) || 0,
          requiereRespaldo: Boolean(value.requiereRespaldo),
          requiereJustificacion: Boolean(value.requiereJustificacion),
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
          ? "Actualiza la configuración, requerimientos y datos del tipo de solicitud."
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

        {/* 3. Días de Anticipación */}
        <form.Field name="diasAnticipacion">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Días de Anticipación Mínimos</RequiredFieldLabel>
                </FieldLabel>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    step={1}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder="0"
                    className="pl-9"
                    aria-invalid={isInvalid}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Cantidad mínima de días previos requeridos para registrar esta solicitud (0 = sin restricción).
                </p>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 4. Switches de Requerimientos */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Requiere Respaldo */}
          <form.Field name="requiereRespaldo">
            {(field) => (
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileSpreadsheet className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      Requiere Respaldo Documental
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Exige adjuntar comprobantes o archivos de respaldo al solicitar
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    field.state.value ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                      field.state.value ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            )}
          </form.Field>

          {/* Requiere Justificación */}
          <form.Field name="requiereJustificacion">
            {(field) => (
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileCheck className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      Requiere Justificación Obligatoria
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Obliga al solicitante a redactar una justificación del viaje o comisión
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    field.state.value ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                      field.state.value ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            )}
          </form.Field>
        </div>

        {/* 5. Descripción */}
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

