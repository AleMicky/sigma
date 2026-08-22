import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import { areaQueries } from "../../area/api/area.queries"
import { cargoQueries } from "../../cargo/api/cargo.queries"
import { personaQueries } from "../../persona/api/persona.queries"
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

  const personasQuery = useQuery(personaQueries.list({ size: 100 }))
  const areasQuery = useQuery(areaQueries.list({ size: 100 }))
  const cargosQuery = useQuery(cargoQueries.list({ size: 100 }))

  const personas = personasQuery.data?.content ?? []
  const areas = areasQuery.data?.content ?? []
  const cargos = cargosQuery.data?.content ?? []

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
          codigo: value.codigo.trim(),
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
          isApiError(error) ? error.message : "No se pudo guardar el empleado.",
        )
      }
    },
  })

  const selectClassName =
    "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar empleado" : "Nuevo empleado"}
      description={
        isEditing
          ? "Actualiza la asignación de persona, área, cargo o código del empleado."
          : "Asigna una persona a un área y un cargo institucional."
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
      <form.Field name="personaId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Persona
              </RequiredFieldLabel>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                className={selectClassName}
              >
                <option value="">-- Seleccionar Persona --</option>
                {personas.map((p) => {
                  const nombre = [p.nombres, p.primerApellido, p.segundoApellido]
                    .filter(Boolean)
                    .join(" ")
                  return (
                    <option key={p.id} value={p.id}>
                      {nombre} ({p.tipoDocumento}: {p.numeroDocumento})
                    </option>
                  )
                })}
              </select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="areaId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Área
                </RequiredFieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className={selectClassName}
                >
                  <option value="">-- Seleccionar Área --</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.codigo})
                    </option>
                  ))}
                </select>
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
                <RequiredFieldLabel htmlFor={field.name}>
                  Cargo
                </RequiredFieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className={selectClassName}
                >
                  <option value="">-- Seleccionar Cargo --</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo})
                    </option>
                  ))}
                </select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Código de Empleado
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                placeholder="EMP-001"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="fechaInicio">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Fecha Inicio</FieldLabel>
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

        <form.Field name="fechaFin">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Fecha Fin</FieldLabel>
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
    </FormDialog>
  )
}
