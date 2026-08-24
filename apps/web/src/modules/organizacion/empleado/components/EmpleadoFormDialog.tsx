import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Building, Calendar, Hash, UserCheck } from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import { AreaCombobox } from "../../area/components/AreaCombobox"
import { CargoCombobox } from "../../cargo/components/CargoCombobox"
import { PersonaCombobox } from "../../persona/components/PersonaCombobox"
import { useCreateEmpleado, useUpdateEmpleado } from "../api/empleado.mutations"
import type { Empleado } from "../api/empleado.service"
import {
  defaultEmpleadoValues,
  empleadoSchema,
} from "../schemas/empleado.schema"

type EmpleadoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  empleado?: Empleado | null
  onSuccess?: (empleado: Empleado) => void
}

export function EmpleadoFormDialog({
  open,
  onOpenChange,
  empleado,
  onSuccess,
}: EmpleadoFormDialogProps) {
  const isEditing = Boolean(empleado)
  const createMutation = useCreateEmpleado()
  const updateMutation = useUpdateEmpleado()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: empleado
      ? {
          personaId: empleado.personaInfo?.id ?? empleado.personaId ?? "",
          areaId: empleado.areaInfo?.id ?? empleado.areaId ?? "",
          cargoId: empleado.cargoInfo?.id ?? empleado.cargoId ?? "",
          codigo: empleado.codigo,
          fechaInicio: empleado.fechaInicio ?? "",
          fechaFin: empleado.fechaFin ?? "",
        }
      : defaultEmpleadoValues,
    validators: {
      onSubmit: empleadoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          personaId: value.personaId,
          areaId: value.areaId,
          cargoId: value.cargoId,
          codigo: value.codigo.trim().toUpperCase(),
          fechaInicio: value.fechaInicio || null,
          fechaFin: value.fechaFin || null,
        }

        const saved =
          isEditing && empleado
            ? await updateMutation.mutateAsync({
                id: empleado.id,
                payload,
              })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error) ? error.message : "No se pudo guardar el registro de empleado.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar empleado" : "Nuevo registro de empleado"}
      description={
        isEditing
          ? "Actualiza la asignación de persona, departamento, cargo o periodo laboral."
          : "Vincula una persona natural con un área y cargo de la estructura institucional."
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
      <div className="flex flex-col gap-3 py-0.5">
        {/* 1. Persona Natural */}
        <form.Field name="personaId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                  <UserCheck className="size-3.5 text-primary" />
                  <span>Persona Natural</span>
                </RequiredFieldLabel>
                <PersonaCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Buscar persona por nombre o documento..."
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 2. Área y Cargo en 2 Columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <form.Field name="areaId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                    <Building className="size-3.5 text-primary" />
                    <span>Área / Departamento</span>
                  </RequiredFieldLabel>
                  <AreaCombobox
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="Seleccionar área..."
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="cargoId">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                    <Building className="size-3.5 text-primary" />
                    <span>Cargo / Puesto</span>
                  </RequiredFieldLabel>
                  <CargoCombobox
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="Seleccionar cargo..."
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {/* 3. Código, Fecha Inicio y Fecha Fin en 3 Columnas compactas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <form.Field name="codigo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                    <Hash className="size-3.5 text-primary" />
                    <span>Código Empleado</span>
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    required
                    placeholder="EMP-001"
                    className="font-mono uppercase h-9 text-xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="fechaInicio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>Fecha Inicio</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-9 text-xs"
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
                  <FieldLabel htmlFor={field.name} className="gap-1.5 text-xs font-semibold">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>Fecha Fin</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-9 text-xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {isEditing && empleado ? (
          <div className="pt-2 border-t mt-1">
            <AuditInfo data={empleado} />
          </div>
        ) : null}
      </div>
    </FormDialog>
  )
}
