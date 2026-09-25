import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Calendar, IdCard } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { useCreateConductor, useUpdateConductor } from "../api/conductor.mutations"
import type { Conductor } from "../api/conductor.service"
import {
  CATEGORIAS_LICENCIA,
  defaultConductorValues,
  conductorSchema,
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

  const form = useForm({
    defaultValues: conductor
      ? {
          empleadoId: conductor.empleadoId,
          numeroLicencia: conductor.numeroLicencia,
          categoriaLicencia: conductor.categoriaLicencia,
          fechaVencimiento: conductor.fechaVencimiento ?? "",
          activo: conductor.activo ?? true,
        }
      : defaultConductorValues,
    validators: {
      onChange: conductorSchema,
      onSubmit: conductorSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        if (isEditing && conductor) {
          const payload = {
            empleadoId: conductor.empleadoId || value.empleadoId,
            numeroLicencia: value.numeroLicencia.trim().toUpperCase(),
            categoriaLicencia: value.categoriaLicencia.trim().toUpperCase(),
            fechaVencimiento: value.fechaVencimiento,
            activo: value.activo,
          }

          const saved = await updateMutation.mutateAsync({
            id: conductor.id,
            payload,
          })

          onSuccess?.(saved)
        } else {
          const payload = {
            empleadoId: value.empleadoId,
            numeroLicencia: value.numeroLicencia.trim().toUpperCase(),
            categoriaLicencia: value.categoriaLicencia.trim().toUpperCase(),
            fechaVencimiento: value.fechaVencimiento,
            activo: value.activo,
          }

          const saved = await createMutation.mutateAsync(payload)
          onSuccess?.(saved)
        }

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
      title={isEditing ? "Editar Conductor" : "Registrar Nuevo Conductor"}
      description={
        isEditing
          ? "Actualiza la licencia de conducir, categoría o estado de habilitación."
          : "Habilita a un empleado del personal institucional como conductor oficial."
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
                  placeholder="Selecciona el empleado…"
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
          {/* 2. Número de Licencia */}
          <form.Field name="numeroLicencia">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Nº Licencia de Conducir</RequiredFieldLabel>
                  </FieldLabel>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      onBlur={field.handleBlur}
                      placeholder="Ej. 12345678-LP"
                      className="pl-9 font-mono uppercase"
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          {/* 3. Categoría de Licencia */}
          <form.Field name="categoriaLicencia">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Categoría de Licencia</RequiredFieldLabel>
                  </FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val ?? "")}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_LICENCIA.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {/* 4. Fecha de Vencimiento */}
        <form.Field name="fechaVencimiento">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  <RequiredFieldLabel>Fecha de Vencimiento</RequiredFieldLabel>
                </FieldLabel>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="pl-9"
                    aria-invalid={isInvalid}
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 5. Estado Activo */}
        <form.Field name="activo">
          {(field) => (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Conductor Habilitado
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Permitir asignación para conducción y órdenes de trabajo vehiculares
                </span>
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
    </FormDialog>
  )
}
