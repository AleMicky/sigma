import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Award, Briefcase, UserCheck } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { cargoQueries } from "../../cargo/api/cargo.queries"
import { EmpleadoCombobox } from "../../empleado/components/EmpleadoCombobox"
import { responsabilidadQueries } from "../../responsabilidad/api/responsabilidad.queries"
import {
  useCreateGrupoAprobadorDetalle,
  useUpdateGrupoAprobadorDetalle,
} from "../api/grupo-aprobador-detalle.mutations"
import type { GrupoAprobadorDetalle } from "../api/grupo-aprobador-detalle.service"
import {
  defaultGrupoAprobadorDetalleValues,
  grupoAprobadorDetalleSchema,
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

  const cargosQuery = useQuery({
    ...cargoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
    enabled: open,
  })
  const responsabilidadesQuery = useQuery({
    ...responsabilidadQueries.list({
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
    enabled: open,
  })

  const cargos = cargosQuery.data?.content ?? []
  const responsabilidades = responsabilidadesQuery.data?.content ?? []

  const form = useForm({
    defaultValues: detalle
      ? {
          tipoAprobador: detalle.tipoAprobador,
          empleadoId:
            detalle.empleadoInfo?.id ?? detalle.empleadoId ?? null,
          cargoId: detalle.cargoInfo?.id ?? detalle.cargoId ?? null,
          responsabilidadId:
            detalle.responsabilidadInfo?.id ??
            detalle.responsabilidadId ??
            null,
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
          responsabilidadId:
            value.tipoAprobador === "RESPONSABILIDAD"
              ? value.responsabilidadId
              : null,
          orden: value.orden,
          requiereAprobacion: value.requiereAprobacion,
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
            : "No se pudo guardar el paso del grupo aprobador.",
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
          ? "Editar paso de aprobación"
          : "Agregar aprobador al grupo"
      }
      description={
        isEditing
          ? "Actualiza la configuración del aprobador y su orden de secuencia."
          : "Define un nuevo validador (por empleado, cargo o responsabilidad) en la secuencia."
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
      <div className="space-y-4">
        {/* Tipo de Aprobador */}
        <form.Field name="tipoAprobador">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Tipo de Aprobador
                </RequiredFieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(val) => {
                    field.handleChange(val as TipoAprobador)
                    form.setFieldValue("empleadoId", null)
                    form.setFieldValue("cargoId", null)
                    form.setFieldValue("responsabilidadId", null)
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLEADO">
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-4 text-blue-500" />
                        <span>Empleado Específico</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CARGO">
                      <div className="flex items-center gap-2">
                        <Briefcase className="size-4 text-purple-500" />
                        <span>Cargo Institucional</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="RESPONSABILIDAD">
                      <div className="flex items-center gap-2">
                        <Award className="size-4 text-amber-500" />
                        <span>Responsabilidad / Rol</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Referencia Dinámica según Tipo */}
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
                          Empleado Validador
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
                          Cargo Aprobador
                        </RequiredFieldLabel>
                        <Select
                          value={field.state.value ?? ""}
                          onValueChange={(val) => field.handleChange(val)}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Seleccionar cargo..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {cargos.map((cargo) => (
                              <SelectItem key={cargo.id} value={cargo.id}>
                                <div className="flex items-center gap-2">
                                  <code className="text-[10px] font-mono text-muted-foreground">
                                    {cargo.codigo}
                                  </code>
                                  <span>{cargo.nombre}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          Responsabilidad Organizacional
                        </RequiredFieldLabel>
                        <Select
                          value={field.state.value ?? ""}
                          onValueChange={(val) => field.handleChange(val)}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Seleccionar responsabilidad..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {responsabilidades.map((resp) => (
                              <SelectItem key={resp.id} value={resp.id}>
                                <div className="flex items-center gap-2">
                                  <code className="text-[10px] font-mono text-muted-foreground">
                                    {resp.codigo}
                                  </code>
                                  <span>{resp.nombre}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

        {/* Orden de Secuencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field name="orden">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Orden de Secuencia
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value === ""
                          ? 0
                          : Number.parseInt(e.target.value, 10),
                      )
                    }
                    className="shadow-2xs"
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          </form.Field>

          {/* Requiere Aprobación */}
          <form.Field name="requiereAprobacion">
            {(field) => (
              <Field className="flex flex-col justify-end pb-1.5">
                <label
                  htmlFor={field.name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/80 p-2.5 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors shadow-2xs"
                >
                  <span className="text-xs font-semibold text-foreground">
                    Aprobación Obligatoria
                  </span>
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </label>
              </Field>
            )}
          </form.Field>
        </div>
      </div>
    </FormDialog>
  )
}
