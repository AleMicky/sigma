import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { useCreateConductor, useUpdateConductor } from "../api/conductor.mutations"
import type { Conductor, ConductorPayload } from "../api/conductor.service"
import {
  ESTADOS_CONDUCTOR,
  conductorBasicSchema,
  defaultConductorBasicValues,
  type ConductorBasicFormValues,
} from "../schemas/conductor.schema"

type ConductorFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  conductor?: Conductor | null
  onSuccess?: (conductor: Conductor) => void
}

export function ConductorFormDialog({
  open,
  onOpenChange,
  conductor,
  onSuccess,
}: ConductorFormDialogProps) {
  const isEditing = Boolean(conductor)
  const createMutation = useCreateConductor()
  const updateMutation = useUpdateConductor()
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: ConductorBasicFormValues = conductor
    ? {
        empleadoId: conductor.empleadoId,
        estado: conductor.estado ?? "ACTIVO",
        observacion: conductor.observacion ?? "",
        activo: conductor.activo ?? true,
      }
    : defaultConductorBasicValues

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: conductorBasicSchema,
      onSubmit: conductorBasicSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload: ConductorPayload = {
          empleadoId: isEditing && conductor ? conductor.empleadoId : value.empleadoId,
          estado: value.estado,
          observacion: value.observacion?.trim() || null,
          activo: value.activo,
          licencias: conductor?.licencias ? conductor.licencias.map((l) => ({
            id: l.id,
            categoriaLicencia: l.categoriaLicencia,
            numeroLicencia: l.numeroLicencia,
            fechaEmision: l.fechaEmision,
            fechaVencimiento: l.fechaVencimiento,
            estado: l.estado,
            observacion: l.observacion,
            nombreArchivo: l.nombreArchivo,
            nombreOriginal: l.nombreOriginal,
            url: l.url,
            mimeType: l.mimeType,
            size: l.size,
            activo: l.activo ?? true,
          })) : [],
        }

        const saved = isEditing && conductor
          ? await updateMutation.mutateAsync({ id: conductor.id, payload })
          : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la información del conductor."
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Conductor" : "Nuevo Conductor"}
      description={
        isEditing
          ? "Actualiza los datos del conductor institucional."
          : "Habilita a un empleado del personal institucional como conductor."
      }
      formError={formError}
      className="max-w-md sm:max-w-lg"
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
      <div className="space-y-4 py-1">
        {/* 1. Empleado asignado */}
        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Empleado Titular</RequiredFieldLabel>
                </FieldLabel>
                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  disabled={isEditing}
                  placeholder="Buscar y seleccionar empleado…"
                />
                {isEditing && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    El empleado titular no puede modificarse una vez registrado.
                  </p>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 2. Estado Conductor */}
          <form.Field name="estado">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Estado</RequiredFieldLabel>
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as any)}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_CONDUCTOR.map((est) => (
                        <SelectItem key={est.value} value={est.value}>
                          {est.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          {/* 3. Switch Activo */}
          <form.Field name="activo">
            {(field) => (
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 h-full">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    Habilitado
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Permitir asignaciones
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
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

        {/* 4. Observación */}
        <form.Field name="observacion">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Observaciones Generales</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                rows={3}
                placeholder="Notas o restricciones sobre el perfil del conductor…"
                className="resize-none text-xs"
              />
            </Field>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
