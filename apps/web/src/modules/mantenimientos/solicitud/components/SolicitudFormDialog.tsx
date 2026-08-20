import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Box, Building2, Loader2, User, Wrench } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { prioridadQueries } from "@/modules/mantenimientos/prioridad/api/prioridad.queries"
import { tipoMantenimientoQueries } from "@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.queries"
import { areaQueries } from "@/modules/organizacion/area/api/area.queries"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateSolicitud,
  useUpdateSolicitud,
} from "../api/solicitud.mutations"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  defaultSolicitudValues,
  solicitudSchema,
} from "../schemas/solicitud.schema"

function getPrioridadDotColor(nivel: number) {
  switch (nivel) {
    case 5:
      return "bg-rose-500"
    case 4:
      return "bg-amber-500"
    case 3:
      return "bg-yellow-500"
    case 2:
      return "bg-blue-500"
    default:
      return "bg-emerald-500"
  }
}

type SolicitudFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudMantenimiento | null
  onSuccess?: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudFormDialog({
  open,
  onOpenChange,
  solicitud,
  onSuccess,
}: SolicitudFormDialogProps) {
  const isEditing = Boolean(solicitud)
  const createMutation = useCreateSolicitud()
  const updateMutation = useUpdateSolicitud()
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch activos from /api/v1/activos
  const activosQuery = useQuery({
    ...activoQueries.list({ size: 100 }),
    enabled: open,
  })

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const activosById = useMemo(
    () => new Map(activos.map((a) => [a.id, a])),
    [activos],
  )

  // Ensure current solicitud.activoId is available even if not in first page
  const singleActivoQuery = useQuery({
    ...activoQueries.detail(solicitud?.activoId ?? ""),
    enabled:
      open &&
      Boolean(solicitud?.activoId) &&
      !activosById.has(solicitud?.activoId ?? ""),
  })

  const activosList = useMemo(() => {
    const list = [...activos]
    if (
      singleActivoQuery.data &&
      !list.some((a) => a.id === singleActivoQuery.data.id)
    ) {
      list.unshift(singleActivoQuery.data)
    }
    return list
  }, [activos, singleActivoQuery.data])

  const activosMap = useMemo(
    () => new Map(activosList.map((a) => [a.id, a])),
    [activosList],
  )

  // Fetch prioridades from /api/v1/prioridades
  const prioridadesQuery = useQuery({
    ...prioridadQueries.list({ size: 100 }),
    enabled: open,
  })

  const prioridades = useMemo(
    () => prioridadesQuery.data?.content ?? [],
    [prioridadesQuery.data?.content],
  )

  const prioridadesById = useMemo(
    () => new Map(prioridades.map((p) => [p.id, p])),
    [prioridades],
  )

  const singlePrioridadQuery = useQuery({
    ...prioridadQueries.detail(solicitud?.prioridadId ?? ""),
    enabled:
      open &&
      Boolean(solicitud?.prioridadId) &&
      !prioridadesById.has(solicitud?.prioridadId ?? ""),
  })

  const prioridadesList = useMemo(() => {
    const list = [...prioridades]
    if (
      singlePrioridadQuery.data &&
      !list.some((p) => p.id === singlePrioridadQuery.data.id)
    ) {
      list.unshift(singlePrioridadQuery.data)
    }
    return list
  }, [prioridades, singlePrioridadQuery.data])

  const prioridadesMap = useMemo(
    () => new Map(prioridadesList.map((p) => [p.id, p])),
    [prioridadesList],
  )

  // Fetch tipos de mantenimiento from /api/v1/tipos-mantenimiento
  const tiposMantenimientoQuery = useQuery({
    ...tipoMantenimientoQueries.list({ size: 100 }),
    enabled: open,
  })

  const tiposMantenimiento = useMemo(
    () => tiposMantenimientoQuery.data?.content ?? [],
    [tiposMantenimientoQuery.data?.content],
  )

  const tiposMantenimientoById = useMemo(
    () => new Map(tiposMantenimiento.map((t) => [t.id, t])),
    [tiposMantenimiento],
  )

  const singleTipoMantenimientoQuery = useQuery({
    ...tipoMantenimientoQueries.detail(solicitud?.tipoMantenimientoId ?? ""),
    enabled:
      open &&
      Boolean(solicitud?.tipoMantenimientoId) &&
      !tiposMantenimientoById.has(solicitud?.tipoMantenimientoId ?? ""),
  })

  const tiposMantenimientoList = useMemo(() => {
    const list = [...tiposMantenimiento]
    if (
      singleTipoMantenimientoQuery.data &&
      !list.some((t) => t.id === singleTipoMantenimientoQuery.data.id)
    ) {
      list.unshift(singleTipoMantenimientoQuery.data)
    }
    return list
  }, [tiposMantenimiento, singleTipoMantenimientoQuery.data])

  const tiposMantenimientoMap = useMemo(
    () => new Map(tiposMantenimientoList.map((t) => [t.id, t])),
    [tiposMantenimientoList],
  )

  // Fetch empleados (solicitante) from /api/v1/empleados
  const empleadosQuery = useQuery({
    ...empleadoQueries.list({ size: 100 }),
    enabled: open,
  })

  const empleados = useMemo(
    () => empleadosQuery.data?.content ?? [],
    [empleadosQuery.data?.content],
  )

  const empleadosById = useMemo(
    () => new Map(empleados.map((e) => [e.id, e])),
    [empleados],
  )

  const singleEmpleadoQuery = useQuery({
    ...empleadoQueries.detail(solicitud?.solicitanteId ?? ""),
    enabled:
      open &&
      Boolean(solicitud?.solicitanteId) &&
      !empleadosById.has(solicitud?.solicitanteId ?? ""),
  })

  const empleadosList = useMemo(() => {
    const list = [...empleados]
    if (
      singleEmpleadoQuery.data &&
      !list.some((e) => e.id === singleEmpleadoQuery.data.id)
    ) {
      list.unshift(singleEmpleadoQuery.data)
    }
    return list
  }, [empleados, singleEmpleadoQuery.data])

  const empleadosMap = useMemo(
    () => new Map(empleadosList.map((e) => [e.id, e])),
    [empleadosList],
  )

  // Fetch areas from /api/v1/areas
  const areasQuery = useQuery({
    ...areaQueries.list({ size: 100 }),
    enabled: open,
  })

  const areas = useMemo(
    () => areasQuery.data?.content ?? [],
    [areasQuery.data?.content],
  )

  const areasById = useMemo(
    () => new Map(areas.map((a) => [a.id, a])),
    [areas],
  )

  const singleAreaQuery = useQuery({
    ...areaQueries.detail(solicitud?.areaSolicitanteId ?? ""),
    enabled:
      open &&
      Boolean(solicitud?.areaSolicitanteId) &&
      !areasById.has(solicitud?.areaSolicitanteId ?? ""),
  })

  const areasList = useMemo(() => {
    const list = [...areas]
    if (
      singleAreaQuery.data &&
      !list.some((a) => a.id === singleAreaQuery.data.id)
    ) {
      list.unshift(singleAreaQuery.data)
    }
    return list
  }, [areas, singleAreaQuery.data])

  const areasMap = useMemo(
    () => new Map(areasList.map((a) => [a.id, a])),
    [areasList],
  )

  const form = useForm({
    defaultValues: solicitud
      ? {
          titulo: solicitud.titulo,
          descripcion: solicitud.descripcion ?? "",
          activoId: solicitud.activoId,
          tipoMantenimientoId: solicitud.tipoMantenimientoId,
          motivoMantenimientoId: solicitud.motivoMantenimientoId ?? "",
          prioridadId: solicitud.prioridadId,
          solicitanteId: solicitud.solicitanteId,
          areaSolicitanteId: solicitud.areaSolicitanteId,
        }
      : defaultSolicitudValues,
    validators: {
      onSubmit: solicitudSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          titulo: value.titulo.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
          activoId: value.activoId.trim(),
          tipoMantenimientoId: value.tipoMantenimientoId.trim(),
          motivoMantenimientoId: (value.motivoMantenimientoId ?? "").trim() || null,
          prioridadId: value.prioridadId.trim(),
          solicitanteId: value.solicitanteId.trim(),
          areaSolicitanteId: value.areaSolicitanteId.trim(),
        }

        const saved =
          isEditing && solicitud
            ? await updateMutation.mutateAsync({
                id: solicitud.id,
                payload,
              })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la solicitud de mantenimiento.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar solicitud" : "Nueva solicitud"}
      description={
        isEditing
          ? "Actualiza los datos de esta solicitud de mantenimiento."
          : "Registra una nueva solicitud de mantenimiento para un activo."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) =>
            [state.canSubmit, state.isSubmitting] as const
          }
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
      <form.Field name="titulo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Título de la Solicitud
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="Ej. Falla en motor / Mantenimiento preventivo"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Descripción / Detalle</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Describe el motivo, síntomas de falla o requerimientos..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form.Field name="activoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedActivo = activosMap.get(field.state.value) ?? null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Activo
                </RequiredFieldLabel>
                <Combobox
                  items={activosList}
                  itemToStringLabel={(item: Activo) =>
                    item ? `${item.codigo} - ${item.nombre}` : ""
                  }
                  itemToStringValue={(item: Activo) => item?.id ?? ""}
                  value={selectedActivo}
                  onValueChange={(val: Activo | null) =>
                    field.handleChange(val?.id ?? "")
                  }
                  disabled={activosQuery.isLoading}
                >
                  <ComboboxInput
                    id={field.name}
                    placeholder={
                      activosQuery.isLoading
                        ? "Cargando activos..."
                        : "Buscar o seleccionar activo..."
                    }
                    showClear={Boolean(field.state.value)}
                    aria-invalid={isInvalid}
                    className="w-full"
                  />
                  <ComboboxContent className="z-50 max-h-60 min-w-[280px]">
                    <ComboboxEmpty>
                      {activosQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Cargando activos...</span>
                        </div>
                      ) : (
                        "No se encontraron activos."
                      )}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: Activo) => (
                        <ComboboxItem
                          key={item.id}
                          value={item}
                          className="text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Box className="size-3.5 text-muted-foreground shrink-0" />
                            <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded shrink-0">
                              {item.codigo}
                            </code>
                            <span className="font-medium text-foreground truncate">
                              {item.nombre}
                            </span>
                            {item.tipoActivo?.nombre ? (
                              <span className="ml-auto text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                                {item.tipoActivo.nombre}
                              </span>
                            ) : null}
                          </div>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="prioridadId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selected = prioridadesMap.get(field.state.value)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Prioridad
                </RequiredFieldLabel>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) => field.handleChange(value ?? "")}
                  disabled={prioridadesQuery.isLoading}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Seleccionar prioridad">
                      {selected ? (
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`size-2 rounded-full inline-block shrink-0 ${getPrioridadDotColor(selected.nivel)}`}
                          />
                          <span className="truncate font-medium text-foreground">
                            {selected.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({selected.codigo})
                          </span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {prioridadesList.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        className="text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`size-2 rounded-full inline-block shrink-0 ${getPrioridadDotColor(p.nivel)}`}
                          />
                          <span className="truncate font-medium text-foreground">
                            {p.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({p.codigo})
                          </span>
                        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form.Field name="tipoMantenimientoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selected = tiposMantenimientoMap.get(field.state.value)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Tipo de Mantenimiento
                </RequiredFieldLabel>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) => field.handleChange(value ?? "")}
                  disabled={tiposMantenimientoQuery.isLoading}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Seleccionar tipo de mantenimiento">
                      {selected ? (
                        <div className="flex items-center gap-2 truncate">
                          <Wrench className="size-3.5 text-primary shrink-0" />
                          <span className="truncate font-medium text-foreground">
                            {selected.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({selected.codigo})
                          </span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {tiposMantenimientoList.map((tm) => (
                      <SelectItem
                        key={tm.id}
                        value={tm.id}
                        className="text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Wrench className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate font-medium text-foreground">
                            {tm.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({tm.codigo})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="solicitanteId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedEmpleado = empleadosMap.get(field.state.value) ?? null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Solicitante (Empleado)
                </RequiredFieldLabel>
                <Combobox
                  items={empleadosList}
                  itemToStringLabel={(item: Empleado) =>
                    item
                      ? `${item.personaNombreCompleto || item.codigo}${item.cargoNombre ? ` (${item.cargoNombre})` : ""}`
                      : ""
                  }
                  itemToStringValue={(item: Empleado) => item?.id ?? ""}
                  value={selectedEmpleado}
                  onValueChange={(val: Empleado | null) => {
                    field.handleChange(val?.id ?? "")
                    if (val?.areaId) {
                      form.setFieldValue("areaSolicitanteId", val.areaId)
                    }
                  }}
                  disabled={empleadosQuery.isLoading}
                >
                  <ComboboxInput
                    id={field.name}
                    placeholder={
                      empleadosQuery.isLoading
                        ? "Cargando empleados..."
                        : "Buscar o seleccionar solicitante..."
                    }
                    showClear={Boolean(field.state.value)}
                    aria-invalid={isInvalid}
                    className="w-full"
                  />
                  <ComboboxContent className="z-50 max-h-60 min-w-[280px]">
                    <ComboboxEmpty>
                      {empleadosQuery.isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Cargando empleados...</span>
                        </div>
                      ) : (
                        "No se encontraron empleados."
                      )}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: Empleado) => (
                        <ComboboxItem
                          key={item.id}
                          value={item}
                          className="text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                            <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded shrink-0">
                              {item.codigo}
                            </code>
                            <span className="font-medium text-foreground truncate">
                              {item.personaNombreCompleto || item.codigo}
                            </span>
                            {item.cargoNombre ? (
                              <span className="ml-auto text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                                {item.cargoNombre}
                              </span>
                            ) : null}
                          </div>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="areaSolicitanteId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          const selected = areasMap.get(field.state.value)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Área Solicitante
              </RequiredFieldLabel>
              <Select
                value={field.state.value || null}
                onValueChange={(value) => field.handleChange(value ?? "")}
                disabled={areasQuery.isLoading}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={isInvalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Seleccionar área">
                    {selected ? (
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="size-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {selected.nombre}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({selected.codigo})
                        </span>
                      </div>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {areasList.map((a) => (
                    <SelectItem
                      key={a.id}
                      value={a.id}
                      className="text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {a.nombre}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({a.codigo})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && solicitud ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={solicitud} />
        </div>
      ) : null}
    </FormDialog>
  )
}
