import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import { areaQueries } from "../../area/api/area.queries"
import { cargoQueries } from "../../cargo/api/cargo.queries"
import { empleadoQueries } from "../../empleado/api/empleado.queries"
import { responsabilidadQueries } from "../../responsabilidad/api/responsabilidad.queries"
import {
  useCreateGrupoAprobadorDetalle,
  useUpdateGrupoAprobadorDetalle,
} from "../api/grupo-aprobador-detalle.mutations"
import type { GrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.service"
import {
  defaultGrupoAprobadorDetalleValues,
  grupoAprobadorDetalleSchema,
  type AlcanceAprobador,
  type TipoAprobador,
} from "../schemas/grupo-aprobador-detalle.schema"

type GrupoAprobadorDetalleFormDialogProps = {
  grupoAprobadorId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  detalle?: GrupoAprobadorDetalle | null
  onSuccess?: () => void
}

export function GrupoAprobadorDetalleFormDialog({
  grupoAprobadorId,
  open,
  onOpenChange,
  detalle,
  onSuccess,
}: GrupoAprobadorDetalleFormDialogProps) {
  const isEditing = Boolean(detalle)
  const createMutation = useCreateGrupoAprobadorDetalle(grupoAprobadorId)
  const updateMutation = useUpdateGrupoAprobadorDetalle(grupoAprobadorId)
  const [formError, setFormError] = useState<string | null>(null)

  const empleadosQuery = useQuery(empleadoQueries.list({ size: 100 }))
  const areasQuery = useQuery(areaQueries.list({ size: 100 }))
  const cargosQuery = useQuery(cargoQueries.list({ size: 100 }))
  const responsabilidadesQuery = useQuery(
    responsabilidadQueries.list({ size: 100 }),
  )

  const empleados = empleadosQuery.data?.content ?? []
  const areas = areasQuery.data?.content ?? []
  const cargos = cargosQuery.data?.content ?? []
  const responsabilidades = responsabilidadesQuery.data?.content ?? []

  const form = useForm({
    defaultValues: detalle
      ? {
          tipoAprobador: detalle.tipoAprobador,
          empleadoId: detalle.empleadoInfo?.id ?? detalle.empleadoId ?? null,
          cargoId: detalle.cargoInfo?.id ?? detalle.cargoId ?? null,
          unidadId: detalle.unidadInfo?.id ?? detalle.unidadId ?? null,
          responsabilidadId:
            detalle.responsabilidadInfo?.id ?? detalle.responsabilidadId ?? null,
          alcance: detalle.alcance,
          orden: detalle.orden,
          requiereAprobacion: detalle.requiereAprobacion,
        }
      : defaultGrupoAprobadorDetalleValues,
    validators: {
      onSubmit: grupoAprobadorDetalleSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          tipoAprobador: value.tipoAprobador,
          empleadoId:
            value.tipoAprobador === "EMPLEADO" ? value.empleadoId : null,
          cargoId: value.tipoAprobador === "CARGO" ? value.cargoId : null,
          unidadId:
            value.tipoAprobador === "UNIDAD" ||
            value.alcance === "UNIDAD_ESPECIFICA"
              ? value.unidadId
              : null,
          responsabilidadId:
            value.tipoAprobador === "RESPONSABILIDAD"
              ? value.responsabilidadId
              : null,
          alcance: value.alcance,
          orden: Number(value.orden),
          requiereAprobacion: Boolean(value.requiereAprobacion),
        }

        if (isEditing && detalle) {
          await updateMutation.mutateAsync({
            id: detalle.id,
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
            : "No se pudo guardar el aprobador en el grupo.",
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
      title={isEditing ? "Editar aprobador" : "Agregar aprobador al grupo"}
      description={
        isEditing
          ? "Actualiza el tipo de aprobador, alcance u orden en la secuencia de aprobación."
          : "Define un nuevo paso y aprobador en este flujo de aprobación."
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="tipoAprobador">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Tipo de Aprobador
                </RequiredFieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as TipoAprobador)
                  }
                  required
                  className={selectClassName}
                >
                  <option value="EMPLEADO">Empleado (Específico)</option>
                  <option value="CARGO">Cargo Institucional</option>
                  <option value="UNIDAD">Unidad / Área</option>
                  <option value="RESPONSABILIDAD">Responsabilidad</option>
                </select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="alcance">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Alcance
                </RequiredFieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value as AlcanceAprobador)
                  }
                  required
                  className={selectClassName}
                >
                  <option value="GLOBAL">Global (Toda la institución)</option>
                  <option value="UNIDAD_ESPECIFICA">Unidad Específica</option>
                </select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* Selector dependiente del tipo de aprobador */}
      <form.Subscribe selector={(state) => state.values.tipoAprobador}>
        {(tipo) => {
          if (tipo === "EMPLEADO") {
            return (
              <form.Field name="empleadoId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Seleccionar Funcionario / Empleado
                      </RequiredFieldLabel>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">-- Seleccionar Empleado --</option>
                        {empleados.map((emp) => {
                          const nombre =
                            emp.personaInfo?.nombreCompleto ||
                            emp.personaNombreCompleto ||
                            `Empleado (${emp.codigo})`
                          return (
                            <option key={emp.id} value={emp.id}>
                              {nombre} [{emp.codigo}]
                            </option>
                          )
                        })}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            )
          }

          if (tipo === "CARGO") {
            return (
              <form.Field name="cargoId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Seleccionar Cargo
                      </RequiredFieldLabel>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">-- Seleccionar Cargo --</option>
                        {cargos.map((cargo) => (
                          <option key={cargo.id} value={cargo.id}>
                            {cargo.nombre} ({cargo.codigo})
                          </option>
                        ))}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            )
          }

          if (tipo === "RESPONSABILIDAD") {
            return (
              <form.Field name="responsabilidadId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Seleccionar Responsabilidad
                      </RequiredFieldLabel>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">
                          -- Seleccionar Responsabilidad --
                        </option>
                        {responsabilidades.map((resp) => (
                          <option key={resp.id} value={resp.id}>
                            {resp.nombre} ({resp.codigo})
                          </option>
                        ))}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            )
          }

          return null
        }}
      </form.Subscribe>

      {/* Unidad requerida si tipo === "UNIDAD" o alcance === "UNIDAD_ESPECIFICA" */}
      <form.Subscribe
        selector={(state) => ({
          tipo: state.values.tipoAprobador,
          alcance: state.values.alcance,
        })}
      >
        {({ tipo, alcance }) => {
          if (tipo === "UNIDAD" || alcance === "UNIDAD_ESPECIFICA") {
            return (
              <form.Field name="unidadId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Unidad / Área {alcance === "UNIDAD_ESPECIFICA" && "(Alcance Específico)"}
                      </RequiredFieldLabel>
                      <select
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">-- Seleccionar Área / Unidad --</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.nombre} ({area.codigo})
                          </option>
                        ))}
                      </select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            )
          }
          return null
        }}
      </form.Subscribe>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="orden">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Orden en Flujo
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value))
                  }
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="requiereAprobacion">
          {(field) => (
            <Field className="flex flex-col justify-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={Boolean(field.state.value)}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                />
                Requiere Aprobación Explícita
              </label>
            </Field>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}
