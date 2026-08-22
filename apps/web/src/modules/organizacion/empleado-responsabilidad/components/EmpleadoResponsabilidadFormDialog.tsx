import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Calendar, UserCheck } from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import { EmpleadoCombobox } from "../../empleado/components/EmpleadoCombobox"
import {
  useCreateEmpleadoResponsabilidad,
  useUpdateEmpleadoResponsabilidad,
} from "../api/empleado-responsabilidad.mutations"
import type { EmpleadoResponsabilidad } from "../api/empleado-responsabilidad.service"
import {
  defaultEmpleadoResponsabilidadValues,
  empleadoResponsabilidadSchema,
} from "../schemas/empleado-responsabilidad.schema"

type EmpleadoResponsabilidadFormDialogProps = {
  responsabilidadId: string
  responsabilidadNombre?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  asignacion?: EmpleadoResponsabilidad | null
  onSuccess?: () => void
}

export function EmpleadoResponsabilidadFormDialog({
  responsabilidadId,
  responsabilidadNombre,
  open,
  onOpenChange,
  asignacion,
  onSuccess,
}: EmpleadoResponsabilidadFormDialogProps) {
  const isEditing = Boolean(asignacion)
  const createMutation = useCreateEmpleadoResponsabilidad()
  const updateMutation = useUpdateEmpleadoResponsabilidad()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: asignacion
      ? {
          empleadoId:
            asignacion.empleadoInfo?.id ?? asignacion.empleadoId ?? "",
          responsabilidadId:
            asignacion.responsabilidadInfo?.id ??
            asignacion.responsabilidadId ??
            responsabilidadId,
          fechaInicio: asignacion.fechaInicio ?? "",
          fechaFin: asignacion.fechaFin ?? "",
        }
      : {
          ...defaultEmpleadoResponsabilidadValues,
          responsabilidadId,
        },
    validators: {
      onSubmit: empleadoResponsabilidadSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          empleadoId: value.empleadoId,
          responsabilidadId,
          fechaInicio: value.fechaInicio,
          fechaFin: value.fechaFin || null,
        }

        if (isEditing && asignacion) {
          await updateMutation.mutateAsync({
            id: asignacion.id,
            payload,
          })
        } else {
          await createMutation.mutateAsync(payload)
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la asignación de responsabilidad.",
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
          ? "Editar asignación de responsabilidad"
          : "Asignar empleado a responsabilidad"
      }
      description={
        isEditing
          ? `Actualiza el empleado o período de vigencia para "${responsabilidadNombre ?? "la responsabilidad"}".`
          : `Busca y selecciona el empleado y define el período de asignación para "${responsabilidadNombre ?? "la responsabilidad"}".`
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
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <UserCheck className="size-4 text-primary" />
          <span>Funcionario Asignado</span>
        </div>

        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Seleccionar Empleado (Autocomplete)
                </RequiredFieldLabel>

                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Escribe el nombre o código del empleado…"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Calendar className="size-4 text-primary" />
          <span>Período de Vigencia</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="fechaInicio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Fecha Inicio
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
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
                  <FieldLabel htmlFor={field.name}>
                    Fecha Fin (Opcional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      {isEditing && asignacion ? (
        <div className="pt-2 border-t">
          <AuditInfo data={asignacion} />
        </div>
      ) : null}
    </FormDialog>
  )
}
