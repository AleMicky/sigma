import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { UserCheck } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError } from "@/shared/components/ui/field"

import { EmpleadoCombobox } from "../../empleado/components/EmpleadoCombobox"
import {
  useCreateGrupoAprobadorDependiente,
  useUpdateGrupoAprobadorDependiente,
} from "../api/grupo-aprobador-dependiente.mutations"
import type { GrupoAprobadorDependiente } from "../api/grupo-aprobador-dependiente.service"
import {
  defaultGrupoAprobadorDependienteValues,
  grupoAprobadorDependienteSchema,
} from "../schemas/grupo-aprobador-dependiente.schema"

type GrupoAprobadorDependienteFormDialogProps = {
  grupoAprobadorId: string
  grupoAprobadorNombre?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  dependiente?: GrupoAprobadorDependiente | null
  onSuccess?: () => void
}

export function GrupoAprobadorDependienteFormDialog({
  grupoAprobadorId,
  grupoAprobadorNombre,
  open,
  onOpenChange,
  dependiente,
  onSuccess,
}: GrupoAprobadorDependienteFormDialogProps) {
  const isEditing = Boolean(dependiente)
  const createMutation =
    useCreateGrupoAprobadorDependiente(grupoAprobadorId)
  const updateMutation =
    useUpdateGrupoAprobadorDependiente(grupoAprobadorId)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: dependiente
      ? {
          empleadoId:
            dependiente.empleadoInfo?.id ??
            dependiente.empleadoId ??
            "",
        }
      : defaultGrupoAprobadorDependienteValues,
    validators: {
      onSubmit: grupoAprobadorDependienteSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          empleadoId: value.empleadoId,
        }

        if (isEditing && dependiente) {
          await updateMutation.mutateAsync({
            id: dependiente.id,
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
            : "No se pudo guardar el dependiente en el grupo aprobador.",
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
          ? "Editar empleado dependiente"
          : "Asociar empleado al grupo aprobador"
      }
      description={
        isEditing
          ? `Actualiza el empleado dependiente del grupo "${grupoAprobadorNombre ?? "aprobador"}".`
          : `Selecciona el colaborador cuyas solicitudes y aprobaciones serán canalizadas a través del grupo "${grupoAprobadorNombre ?? "aprobador"}".`
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
          <span>Empleado / Solicitante Dependiente</span>
        </div>

        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Seleccionar Empleado
                </RequiredFieldLabel>

                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Buscar empleado por nombre o código…"
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
