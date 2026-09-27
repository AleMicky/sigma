import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { ShieldCheck } from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { cn } from "@/shared/lib/utils"

import { useAsignarResponsable, useUpdateResponsable } from "../api/flota.mutations"
import type { FlotaVehicular, ResponsableFlota } from "../api/flota.service"
import {
  type ResponsableFormValues,
  responsableFormSchema,
} from "../schemas/flota.schema"

interface FlotaResponsableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flota: FlotaVehicular
  responsable?: ResponsableFlota | null
  onSuccess?: () => void
}

export function FlotaResponsableDialog({
  open,
  onOpenChange,
  flota,
  responsable,
  onSuccess,
}: FlotaResponsableDialogProps) {
  const isEditing = Boolean(responsable)
  const assignMutation = useAsignarResponsable()
  const updateMutation = useUpdateResponsable()
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: ResponsableFormValues = responsable
    ? {
        empleadoId: responsable.empleadoId,
        principal: responsable.principal ?? false,
        activo: responsable.activo ?? true,
      }
    : {
        empleadoId: "",
        principal: false,
        activo: true,
      }

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: responsableFormSchema,
      onSubmit: responsableFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        if (isEditing && responsable?.id) {
          await updateMutation.mutateAsync({
            id: responsable.id,
            data: {
              flotaVehicularId: flota.id,
              empleadoId: value.empleadoId,
              principal: value.principal,
              activo: value.activo,
            },
          })
        } else {
          await assignMutation.mutateAsync({
            flotaVehicularId: flota.id,
            empleadoId: value.empleadoId,
            principal: value.principal,
            activo: value.activo,
          })
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la asignación del responsable."
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Responsable de Flota" : "Asignar Responsable"}
      description={`Asigna un colaborador encargado para la flota "${flota.nombre}".`}
      formError={formError}
      className="max-w-md"
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
        {/* Empleado */}
        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Empleado</RequiredFieldLabel>
                </FieldLabel>
                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  disabled={isEditing}
                  placeholder="Buscar colaborador…"
                />
                {isEditing && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    El empleado no puede modificarse. Crea una nueva asignación si deseas cambiarlo.
                  </p>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Principal */}
        <form.Field name="principal">
          {(field) => (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Responsable Principal
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Contacto principal para autorizaciones y asignaciones
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500",
                  field.state.value ? "bg-amber-500" : "bg-muted-foreground/30"
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

        {/* Activo */}
        <form.Field name="activo">
          {(field) => (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Asignación Habilitada
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Indica si el responsable está activo para la flota
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500",
                  field.state.value ? "bg-cyan-600" : "bg-muted-foreground/30"
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
    </FormDialog>
  )
}
