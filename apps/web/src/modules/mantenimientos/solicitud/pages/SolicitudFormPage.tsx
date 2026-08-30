import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  HelpCircle,
  ImageIcon,
  Layers,
  Loader2,
  Paperclip,
  Plus,
  User,
  Wrench,
  X,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { prioridadQueries } from "@/modules/mantenimientos/prioridad/api/prioridad.queries"
import { tipoMantenimientoQueries } from "@/modules/mantenimientos/tipo-mantenimiento/api/tipo-mantenimiento.queries"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { isApiError } from "@/shared/api"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
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
import { CatalogoCombobox } from "@/shared/components/catalogo-combobox"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { ActivoCombobox } from "@/modules/mantenimientos/orden-trabajo/components/ActivoCombobox"
import { cn } from "@/shared/lib/utils"

import {
  useCreateSolicitud,
  useCreateSolicitudWithFiles,
  useUpdateSolicitud,
} from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudPayload } from "../api/solicitud.service"
import {
  getEstadoBadgeVariant,
  getPrioridadColorConfig,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"
import {
  defaultSolicitudValues,
  type SolicitudFormValues,
  solicitudSchema,
} from "../schemas/solicitud.schema"

type SolicitudFormPageProps = {
  solicitudId?: string
}

export function SolicitudFormPage({ solicitudId }: SolicitudFormPageProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(solicitudId)

  // Fetch Solicitud if editing
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudId ?? ""),
    enabled: isEditing,
  })
  const solicitud = solicitudQuery.data

  const createMutation = useCreateSolicitud()
  const createWithFilesMutation = useCreateSolicitudWithFiles()
  const updateMutation = useUpdateSolicitud()

  const [formError, setFormError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const currentActivoId = solicitud?.activo?.id ?? ""
  const currentTipoMantenimientoId = solicitud?.tipoMantenimiento?.id ?? ""
  const currentPrioridadId = solicitud?.prioridad?.id ?? ""
  const currentSolicitanteId = solicitud?.solicitante?.id ?? ""

  // Fetch Activos
  const activosQuery = useQuery(
    activoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )
  const activosById = useMemo(
    () => new Map(activos.map((a) => [a.id, a])),
    [activos],
  )

  const singleActivoQuery = useQuery({
    ...activoQueries.detail(currentActivoId),
    enabled: Boolean(currentActivoId) && !activosById.has(currentActivoId),
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

  // Fetch Prioridades (ordenadas por nivel de menor a mayor)
  const prioridadesQuery = useQuery(
    prioridadQueries.list({ size: 100, sortBy: "nivel", direction: "ASC" }),
  )
  const prioridades = useMemo(
    () => prioridadesQuery.data?.content ?? [],
    [prioridadesQuery.data?.content],
  )
  const prioridadesById = useMemo(
    () => new Map(prioridades.map((p) => [p.id, p])),
    [prioridades],
  )

  const singlePrioridadQuery = useQuery({
    ...prioridadQueries.detail(currentPrioridadId),
    enabled:
      Boolean(currentPrioridadId) && !prioridadesById.has(currentPrioridadId),
  })

  const prioridadesList = useMemo(() => {
    const list = [...prioridades]
    if (
      singlePrioridadQuery.data &&
      !list.some((p) => p.id === singlePrioridadQuery.data.id)
    ) {
      list.push(singlePrioridadQuery.data)
    }
    return list.sort((a, b) => a.nivel - b.nivel)
  }, [prioridades, singlePrioridadQuery.data])

  const prioridadesMap = useMemo(
    () => new Map(prioridadesList.map((p) => [p.id, p])),
    [prioridadesList],
  )

  const defaultPrioridadId = useMemo(() => {
    if (currentPrioridadId) return currentPrioridadId
    return prioridadesList[0]?.id ?? ""
  }, [currentPrioridadId, prioridadesList])

  // Fetch Tipos de Mantenimiento
  const tiposMantenimientoQuery = useQuery(
    tipoMantenimientoQueries.list({ size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const tiposMantenimiento = useMemo(
    () => tiposMantenimientoQuery.data?.content ?? [],
    [tiposMantenimientoQuery.data?.content],
  )
  const tiposMantenimientoById = useMemo(
    () => new Map(tiposMantenimiento.map((t) => [t.id, t])),
    [tiposMantenimiento],
  )

  const singleTipoMantenimientoQuery = useQuery({
    ...tipoMantenimientoQueries.detail(currentTipoMantenimientoId),
    enabled:
      Boolean(currentTipoMantenimientoId) &&
      !tiposMantenimientoById.has(currentTipoMantenimientoId),
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

  // Fetch Empleados (Solicitante) - Usa endpoint mis-empleados (admin ve todos, usuario ve los suyos)
  const empleadosQuery = useQuery(
    empleadoQueries.misEmpleados({ size: 100, sortBy: "codigo", direction: "ASC" }),
  )
  const empleados = useMemo(
    () => empleadosQuery.data?.content ?? [],
    [empleadosQuery.data?.content],
  )
  const empleadosById = useMemo(
    () => new Map(empleados.map((e: Empleado) => [e.id, e])),
    [empleados],
  )

  const singleEmpleadoQuery = useQuery({
    ...empleadoQueries.detail(currentSolicitanteId),
    enabled:
      Boolean(currentSolicitanteId) &&
      !empleadosById.has(currentSolicitanteId),
  })

  const empleadosList = useMemo(() => {
    const list = [...empleados]
    if (
      singleEmpleadoQuery.data &&
      !list.some((e: Empleado) => e.id === singleEmpleadoQuery.data.id)
    ) {
      list.unshift(singleEmpleadoQuery.data)
    }
    return list
  }, [empleados, singleEmpleadoQuery.data])

  const empleadosMap = useMemo(
    () => new Map(empleadosList.map((e) => [e.id, e])),
    [empleadosList],
  )

  function getTodayDateString() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  function getEmpleadoNombre(emp?: Empleado | null): string {
    if (!emp) return ""
    return emp.personaInfo?.nombreCompleto || emp.personaNombreCompleto || emp.codigo
  }

  const form = useForm({
    defaultValues: (solicitud
      ? {
        titulo: solicitud.titulo,
        descripcion: solicitud.descripcion ?? "",
        tipoFallas: solicitud.tipoFallas ?? "",
        activoId: currentActivoId,
        tipoMantenimientoId: currentTipoMantenimientoId,
        prioridadId: currentPrioridadId,
        solicitanteId: currentSolicitanteId,
        fechaSolicitud: solicitud.fechaSolicitud
          ? solicitud.fechaSolicitud.substring(0, 10)
          : getTodayDateString(),
      }
      : {
        ...defaultSolicitudValues,
        prioridadId: defaultPrioridadId,
        fechaSolicitud: getTodayDateString(),
      }) as SolicitudFormValues,
    validators: {
      onSubmit: solicitudSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload: SolicitudPayload = {
          titulo: value.titulo.trim(),
          descripcion: value.descripcion.trim(),
          tipoFallas: (value.tipoFallas ?? "").trim() || null,
          activoId: value.activoId.trim(),
          tipoMantenimientoId: value.tipoMantenimientoId.trim(),
          prioridadId: value.prioridadId.trim(),
          solicitanteId: value.solicitanteId.trim(),
          fechaSolicitud: value.fechaSolicitud
            ? (value.fechaSolicitud.includes("T")
              ? value.fechaSolicitud
              : `${value.fechaSolicitud}T00:00:00`)
            : null,
        }

        if (isEditing && solicitudId) {
          await updateMutation.mutateAsync({
            id: solicitudId,
            payload,
          })
        } else {
          if (selectedFiles.length > 0) {
            await createWithFilesMutation.mutateAsync({
              payload,
              files: selectedFiles,
            })
          } else {
            await createMutation.mutateAsync(payload)
          }
        }

        navigate({ to: routes.mantenimientos.solicitudes })
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la solicitud de mantenimiento. Por favor revisa los campos.",
        )
      }
    },
  })

  // Autoseleccionar por defecto el primer nivel de prioridad (nivel más bajo) en creación
  useEffect(() => {
    if (!isEditing && prioridadesList.length > 0) {
      const currentVal = form.getFieldValue("prioridadId")
      if (!currentVal) {
        form.setFieldValue("prioridadId", prioridadesList[0].id)
      }
    }
  }, [isEditing, prioridadesList, form])

  // Autoseleccionar automáticamente al solicitante si solo tiene 1 empleado asociado en creación
  useEffect(() => {
    if (!isEditing && empleados.length === 1) {
      const currentVal = form.getFieldValue("solicitanteId")
      if (!currentVal) {
        form.setFieldValue("solicitanteId", empleados[0].id)
      }
    }
  }, [isEditing, empleados, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files)
      setSelectedFiles((prev) => [...prev, ...filesArr])
    }
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const isSubmitting =
    form.state.isSubmitting ||
    createMutation.isPending ||
    createWithFilesMutation.isPending ||
    updateMutation.isPending

  if (isEditing && solicitudQuery.isLoading) {
    return (
      <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Cargando datos de la solicitud...</p>
        </div>
      </PageShell>
    )
  }

  const isBorrador = !solicitud || (solicitud.estado ?? "").toLowerCase() === "borrador"

  if (isEditing && solicitud && !isBorrador) {
    return (
      <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center text-center gap-4 p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Solicitud no editable
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta solicitud se encuentra en estado <strong className="text-foreground capitalize">{solicitud.estado}</strong>. Solo se pueden modificar o eliminar solicitudes en estado <strong>Borrador</strong>.
            </p>
          </div>
          <Button
            type="button"
            render={<Link to={routes.mantenimientos.solicitudes} />}
            className="text-xs gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Volver a Solicitudes</span>
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none overflow-y-auto px-4 py-4 sm:px-6 md:px-8">
      <div className="w-full space-y-6 pb-12">
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              render={<Link to={routes.mantenimientos.solicitudes} />}
              aria-label="Volver a solicitudes"
              className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
            >
              <ArrowLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                    {isEditing
                      ? `Editar Solicitud ${solicitud?.numero ? `#${solicitud.numero}` : ""}`
                      : "Nueva Solicitud"}
                  </h1>
                  {solicitud?.estado ? (
                    <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
                      {solicitud.estado}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isEditing
                    ? "Actualiza los datos técnicos y requerimientos de esta solicitud."
                    : "Completa la información técnica para registrar una nueva solicitud de mantenimiento."}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {formError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
            <HelpCircle className="size-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Error al procesar el formulario</p>
              <p className="text-xs text-destructive/90 mt-0.5">{formError}</p>
            </div>
          </div>
        ) : null}

        {/* Form Container Card */}
        <Card className="border border-border/80 bg-card/95 shadow-sm rounded-2xl overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="divide-y divide-border/60"
          >
            {/* SECCIÓN 1: CLASIFICACIÓN */}
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight">
                    Clasificación
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Define el título general, tipología y severidad del mantenimiento.
                  </p>
                </div>
              </div>

              {/* Título de la Solicitud */}
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
                        placeholder="Ej., Tubería con fugas en la sala de calderas principal"
                        className="h-10 text-sm shadow-2xs"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Tipo de Mantenimiento (Badges interactivos) */}
              <form.Field name="tipoMantenimientoId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Tipo de Mantenimiento
                      </RequiredFieldLabel>

                      {tiposMantenimientoQuery.isLoading ? (
                        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Cargando tipos de mantenimiento...</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {tiposMantenimientoList.map((tm) => {
                            const isSelected = field.state.value === tm.id

                            return (
                              <button
                                key={tm.id}
                                type="button"
                                onClick={() => field.handleChange(tm.id)}
                                className={cn(
                                  "group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer shadow-2xs active:scale-95",
                                  getTipoMantenimientoBadgeClass(tm.nombre, isSelected),
                                )}
                              >
                                <Wrench
                                  className={cn(
                                    "size-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-12",
                                    isSelected
                                      ? "text-inherit"
                                      : "opacity-80",
                                  )}
                                />
                                <span className="capitalize tracking-tight">{tm.nombre}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Tipo de Falla y Nivel de Prioridad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo de Fallas (Autocompletado desde Catálogo) */}
                <form.Field name="tipoFallas">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor={field.name}>
                          Tipo de Falla
                        </FieldLabel>
                        <CatalogoCombobox
                          codigo="TIPO_FALLAS"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onValueChange={(val) => field.handleChange(val)}
                          aria-invalid={isInvalid}
                          placeholder="Seleccionar o describir falla..."
                          maxLength={200}
                          allowCustomValue={true}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                {/* Nivel de Prioridad */}
                <form.Field name="prioridadId">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    const selected = prioridadesMap.get(field.state.value)
                    const cfg = selected
                      ? getPrioridadColorConfig(selected.nivel)
                      : null

                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <RequiredFieldLabel htmlFor={field.name}>
                          Nivel de Prioridad
                        </RequiredFieldLabel>
                        <Select
                          value={field.state.value || null}
                          onValueChange={(value) =>
                            field.handleChange(value ?? "")
                          }
                          disabled={prioridadesQuery.isLoading}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                            className={cn(
                              "w-full h-10 shadow-2xs text-sm transition-all",
                              cfg && cfg.borderClass,
                            )}
                          >
                            <SelectValue placeholder="Seleccionar Prioridad">
                              {selected && cfg ? (
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className={`size-2.5 rounded-full inline-block shrink-0 ${cfg.dotClass}`}
                                  />
                                  <span className="truncate font-semibold text-foreground text-xs">
                                    {selected.nombre}
                                  </span>
                                </div>
                              ) : null}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {prioridadesList.map((p) => {
                              const pCfg = getPrioridadColorConfig(p.nivel)
                              return (
                                <SelectItem
                                  key={p.id}
                                  value={p.id}
                                  className="text-xs cursor-pointer py-2.5"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={`size-2.5 rounded-full inline-block shrink-0 ${pCfg.dotClass}`}
                                    />
                                    <span className="truncate font-medium text-foreground">
                                      {p.nombre}
                                    </span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN DEL SOLICITANTE */}
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight">
                    Personal Solicitante
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Persona o área encargada de reportar y gestionar la solicitud.
                  </p>
                </div>
              </div>

              {/* Solicitante Selector */}
              <form.Field name="solicitanteId">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Personal Solicitante
                      </RequiredFieldLabel>

                      <EmpleadoCombobox
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                        onlyMisEmpleados={true}
                        placeholder="Buscar solicitante por nombre, código o cargo..."
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            {/* SECCIÓN 3: DETALLES DE LA SOLICITUD */}
            <div className="p-5 sm:p-7 space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground tracking-tight">
                    Detalles de la Solicitud
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Especifica el activo involucrado, fecha de detección y descripción completa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Activo / Ubicación */}
                <form.Field name="activoId">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <RequiredFieldLabel htmlFor={field.name}>
                          Activo / Ubicación
                        </RequiredFieldLabel>

                        <ActivoCombobox
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          placeholder="Buscar activo por código, nombre o ubicación..."
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                {/* Fecha de Solicitud */}
                <form.Field name="fechaSolicitud">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <FieldLabel htmlFor={field.name}>
                          Fecha de Solicitud
                        </FieldLabel>
                        <div className="relative">
                          <Input
                            id={field.name}
                            type="date"
                            name={field.name}
                            value={field.state.value ?? ""}
                            disabled
                            aria-invalid={isInvalid}
                            className="h-10 text-sm shadow-2xs pr-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                          />
                          <Calendar className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
                        </div>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              {/* Descripción Detallada */}
              <form.Field name="descripcion">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <div className="flex items-center justify-between">
                        <RequiredFieldLabel htmlFor={field.name}>
                          Descripción Detallada
                        </RequiredFieldLabel>
                        <span className="text-[11px] text-muted-foreground">
                          {field.state.value.length} / 2000 caracteres
                        </span>
                      </div>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        aria-required
                        aria-invalid={isInvalid}
                        placeholder="Describa el problema, los síntomas y cualquier contexto relevante..."
                        rows={4}
                        maxLength={2000}
                        className="text-sm shadow-2xs resize-y"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Imagen / Archivo Adjunto (Dropzone) */}
              <div className="space-y-3">
                <FieldLabel htmlFor="solicitud-file-dropzone">
                  Imagen / Archivo Adjunto
                </FieldLabel>

                <div
                  id="solicitud-file-dropzone"
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.005]"
                      : "border-border/80 bg-muted/15 hover:bg-muted/30 hover:border-primary/50",
                  )}
                >
                  <input
                    id="solicitud-page-file-input"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border shadow-2xs">
                      <ImageIcon className="size-6 text-primary" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        <label
                          htmlFor="solicitud-page-file-input"
                          className="cursor-pointer text-primary underline underline-offset-4 hover:text-primary/80 font-semibold pointer-events-auto"
                        >
                          Subir un archivo
                        </label>{" "}
                        o arrastrar y soltar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF o PDF hasta 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Paperclip className="size-3.5 text-primary" />
                      Archivos listos para enviar ({selectedFiles.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 border border-border/70 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText className="size-4 text-primary shrink-0" />
                            <div className="truncate min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeFile(idx)}
                            className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <X className="size-3.5" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Existing attachments when editing */}
                {isEditing && solicitud?.adjuntos && solicitud.adjuntos.length > 0 ? (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Paperclip className="size-3.5 text-muted-foreground" />
                      Adjuntos existentes ({solicitud.adjuntos.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {solicitud.adjuntos.map((adj) => (
                        <div
                          key={adj.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 border border-border text-xs"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText className="size-4 text-muted-foreground shrink-0" />
                            <a
                              href={adj.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-primary hover:underline truncate"
                            >
                              {adj.nombreArchivo}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* SECCIÓN 4: RESUMEN DE LA SOLICITUD (Visible solo cuando el formulario está completo) */}
            <form.Subscribe
              selector={(state) => ({
                titulo: state.values.titulo,
                tipoMantenimientoId: state.values.tipoMantenimientoId,
                prioridadId: state.values.prioridadId,
                solicitanteId: state.values.solicitanteId,
                activoId: state.values.activoId,
                fechaSolicitud: state.values.fechaSolicitud,
                descripcion: state.values.descripcion,
              })}
            >
              {(values) => {
                const isFormComplete = Boolean(
                  values.titulo?.trim() &&
                  values.tipoMantenimientoId &&
                  values.prioridadId &&
                  values.solicitanteId &&
                  values.activoId &&
                  values.descripcion?.trim(),
                )

                if (!isFormComplete) return null

                const selectedTipo = tiposMantenimientoMap.get(values.tipoMantenimientoId)
                const selectedPrioridad = prioridadesMap.get(values.prioridadId)
                const selectedEmpleado = empleadosMap.get(values.solicitanteId)
                const selectedActivo = activosMap.get(values.activoId)
                const cfg = selectedPrioridad
                  ? getPrioridadColorConfig(selectedPrioridad.nivel)
                  : getPrioridadColorConfig(1)

                const totalAdjuntos = selectedFiles.length + (solicitud?.adjuntos?.length ?? 0)

                return (
                  <div className="p-5 sm:p-7 pt-0 space-y-3 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
                    <div
                      className={cn(
                        "rounded-xl border p-3 sm:p-3.5 transition-all shadow-2xs space-y-2",
                        selectedPrioridad
                          ? cfg.alertClass
                          : "bg-muted/30 border-border/80 text-foreground",
                      )}
                    >
                      {/* Header Compacto */}
                      <div className="flex items-center justify-between gap-2 border-b border-inherit/15 pb-2">
                        <div className="flex items-center gap-2">
                          {selectedPrioridad && selectedPrioridad.nivel >= 4 ? (
                            <AlertTriangle className="size-3.5 text-inherit shrink-0" />
                          ) : (
                            <FileText className="size-3.5 text-inherit shrink-0" />
                          )}
                          <h3 className="font-bold text-xs tracking-tight text-inherit">
                            Resumen de Solicitud
                          </h3>
                        </div>

                        {selectedPrioridad && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.2 rounded-full shadow-2xs",
                              cfg.badgeClass,
                            )}
                          >
                            Prioridad {selectedPrioridad.nombre} (Nivel {selectedPrioridad.nivel})
                          </span>
                        )}
                      </div>

                      {/* Resumen Compacto de Campos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Título:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {values.titulo?.trim() || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Tipo:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {selectedTipo?.nombre || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Activo:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {selectedActivo
                              ? `${selectedActivo.nombre} (${selectedActivo.codigo})`
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Solicitante:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {selectedEmpleado
                              ? getEmpleadoNombre(selectedEmpleado)
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Fecha:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {values.fechaSolicitud || "Hoy"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            Adjuntos:
                          </span>
                          <span className="font-medium text-foreground truncate">
                            {totalAdjuntos > 0
                              ? `${totalAdjuntos} archivo(s)`
                              : "0"}
                          </span>
                        </div>
                      </div>

                      {/* Impacto */}
                      {selectedPrioridad && (
                        <div className="pt-1.5 text-[10.5px] opacity-85 leading-tight border-t border-inherit/15 truncate">
                          <span className="font-bold mr-1">Impacto:</span>
                          {selectedPrioridad.descripcion ||
                            cfg.defaultDescription}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }}
            </form.Subscribe>

            {/* FOOTER DE ACCIONES */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-5 sm:px-7 rounded-b-2xl">
              <p className="text-xs text-muted-foreground">
                Los campos marcados con{" "}
                <span className="text-destructive font-bold">*</span> son requeridos para la emisión.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  render={<Link to={routes.mantenimientos.solicitudes} />}
                  className="w-full sm:w-auto text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-9 gap-1.5 px-5 text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      {isEditing ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      <span>{isEditing ? "Guardar Cambios" : "Crear Solicitud"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
