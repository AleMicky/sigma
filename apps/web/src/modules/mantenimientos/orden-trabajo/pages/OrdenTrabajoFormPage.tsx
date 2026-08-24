import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import { getPrioridadBadgeStyles } from "@/modules/mantenimientos/solicitud/lib/solicitud.utils"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useCreateOrdenTrabajoWithActividades } from "../api/orden-trabajo.mutations"
import type { OrdenTrabajoPayload } from "../api/orden-trabajo.service"
import { ActividadMantenimientoCombobox } from "../components/ActividadMantenimientoCombobox"
import { ActivoCombobox } from "../components/ActivoCombobox"
import { SolicitudAsignadaCombobox } from "../components/SolicitudAsignadaCombobox"

export type ActividadFormItem = {
  id: string // local client id
  actividadMantenimientoId?: string | null
  descripcion: string
  realizado: boolean
  observacion?: string | null
}

type OrdenTrabajoFormPageProps = {
  solicitudId?: string
  activoId?: string
}

export function OrdenTrabajoFormPage({
  solicitudId: propSolicitudId,
  activoId: propActivoId,
}: OrdenTrabajoFormPageProps) {
  const navigate = useNavigate()

  let searchParams: { solicitudId?: string; activoId?: string } = {}
  try {
    searchParams = useSearch({ strict: false }) as {
      solicitudId?: string
      activoId?: string
    }
  } catch {
    // Non-route context fallback
  }

  const initialSolicitudId =
    propSolicitudId || searchParams.solicitudId || ""
  const initialActivoId = propActivoId || searchParams.activoId || ""

  // Form State - Maestro
  const [solicitudMantenimientoId, setSolicitudMantenimientoId] =
    useState<string>(initialSolicitudId)
  const [activoId, setActivoId] = useState<string>(initialActivoId)
  const [responsableId, setResponsableId] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [diagnostico, setDiagnostico] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")

  // Form State - Detalle (Actividades)
  const [actividades, setActividades] = useState<ActividadFormItem[]>([])

  // Set default initial date
  useEffect(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setFechaInicio(now.toISOString().slice(0, 16))
  }, [])

  // Sync initial query params if provided
  useEffect(() => {
    if (initialSolicitudId && !solicitudMantenimientoId) {
      setSolicitudMantenimientoId(initialSolicitudId)
    }
    if (initialActivoId && !activoId) {
      setActivoId(initialActivoId)
    }
  }, [initialSolicitudId, initialActivoId, solicitudMantenimientoId, activoId])

  // Queries for contextual data
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudMantenimientoId),
    enabled: Boolean(solicitudMantenimientoId),
  })
  const solicitud = solicitudQuery.data

  // When solicitud loads, auto-populate activoId if not set
  useEffect(() => {
    if (solicitud?.activo?.id && !activoId) {
      setActivoId(solicitud.activo.id)
    }
    if (solicitud?.descripcion && !diagnostico) {
      setDiagnostico(solicitud.descripcion)
    }
  }, [solicitud, activoId, diagnostico])

  const activoDetailQuery = useQuery({
    ...activoQueries.detail(activoId || solicitud?.activo?.id || ""),
    enabled: Boolean(activoId || solicitud?.activo?.id),
  })
  const activo = activoDetailQuery.data

  const createMutation = useCreateOrdenTrabajoWithActividades()

  // Handler for adding an activity row
  function handleAddActividad() {
    const newItem: ActividadFormItem = {
      id: crypto.randomUUID(),
      actividadMantenimientoId: null,
      descripcion: "",
      realizado: false,
      observacion: "",
    }
    setActividades((prev) => [...prev, newItem])
  }

  function handleUpdateActividad(
    id: string,
    updates: Partial<ActividadFormItem>,
  ) {
    setActividades((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  function handleRemoveActividad(id: string) {
    setActividades((prev) => prev.filter((item) => item.id !== id))
  }

  const isValid = Boolean(
    solicitudMantenimientoId && (activoId || solicitud?.activo?.id) && responsableId,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || createMutation.isPending) return

    // Validar actividades
    const invalidAct = actividades.find((a) => !a.descripcion.trim())
    if (invalidAct) {
      toast.error("Por favor completa la descripción de todas las actividades agregadas")
      return
    }

    const payload: OrdenTrabajoPayload = {
      solicitudMantenimientoId,
      activoId: activoId || solicitud?.activo?.id || "",
      responsableId,
      fechaInicio: fechaInicio ? `${fechaInicio}:00` : null,
      fechaFin: fechaFin ? `${fechaFin}:00` : null,
      diagnostico: diagnostico.trim() || null,
      observacion: observacion.trim() || null,
    }

    const actPayloads = actividades.map((a) => ({
      actividadMantenimientoId: a.actividadMantenimientoId || null,
      descripcion: a.descripcion.trim(),
      realizado: false,
      observacion: a.observacion?.trim() || null,
    }))

    try {
      await createMutation.mutateAsync({
        maestro: payload,
        actividades: actPayloads,
      })

      // Navigate to list
      navigate({
        to: "/mantenimientos/ordenes-trabajo",
      })
    } catch {
      // Error handled by mutation toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-3 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => window.history.back()}
            className="size-8 rounded-lg cursor-pointer hover:bg-muted shrink-0"
            title="Volver"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex size-8.5 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shadow-2xs shrink-0">
            <Wrench className="size-5" />
          </div>

          <div className="min-w-0">
            <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl truncate">
              Nueva Orden de Trabajo
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Crea la orden de trabajo (maestro) y planifica el detalle de sus actividades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="h-8 text-xs font-semibold rounded-lg"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={!isValid || createMutation.isPending}
            onClick={handleSubmit}
            className="h-8 gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando OT...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Guardar Orden de Trabajo</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content: Two Columns Layout (Maestro / Detalle) */}
      <form
        onSubmit={handleSubmit}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-3.5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: MAESTRO (Cabecera de la OT) (5 cols)    */}
          {/* ========================================================= */}
          <div className="space-y-4 lg:col-span-5">
            {/* Card: Solicitud y Activo */}
            <Card className="p-4 space-y-3.5 border-border/80 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400">
                  <FileText className="size-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Solicitud & Activo
                </h2>
              </div>

              {/* Solicitud de Mantenimiento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Solicitud Asignada <span className="text-destructive">*</span>
                </Label>
                <SolicitudAsignadaCombobox
                  value={solicitudMantenimientoId}
                  onValueChange={(val, sol) => {
                    setSolicitudMantenimientoId(val)
                    if (sol?.activo?.id) {
                      setActivoId(sol.activo.id)
                    }
                    if (sol?.descripcion && !diagnostico) {
                      setDiagnostico(sol.descripcion)
                    }
                  }}
                  disabled={Boolean(initialSolicitudId)}
                />
              </div>

              {/* Context Preview of Solicitud if Loaded */}
              {solicitud && (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-semibold text-foreground truncate">
                      {solicitud.titulo}
                    </span>
                    {solicitud.prioridad && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                          getPrioridadBadgeStyles(solicitud.prioridad.nivel ?? 1),
                        )}
                      >
                        {solicitud.prioridad.nombre ?? `Nivel ${solicitud.prioridad.nivel}`}
                      </span>
                    )}
                  </div>
                  {solicitud.tipoMantenimiento && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Wrench className="size-3 text-sky-600" />
                      <span>{solicitud.tipoMantenimiento.nombre}</span>
                      {solicitud.solicitante && (
                        <>
                          <span>•</span>
                          <User className="size-3 text-muted-foreground" />
                          <span className="truncate">
                            {solicitud.solicitante.nombre}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Activo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Activo Principal <span className="text-destructive">*</span>
                </Label>
                <ActivoCombobox
                  value={activoId || solicitud?.activo?.id || ""}
                  onValueChange={(val) => setActivoId(val)}
                  disabled={Boolean(solicitud?.activo?.id)}
                />
              </div>

              {/* Activo Summary Info if available */}
              {activo && (
                <div className="rounded-xl border border-border/70 bg-muted/30 p-2 text-xs flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {activo.codigo?.slice(0, 3) || "ACT"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {activo.nombre}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Código: {activo.codigo}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Card: Responsable & Fechas */}
            <Card className="p-4 space-y-3.5 border-border/80 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <User className="size-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Responsable & Planificación
                </h2>
              </div>

              {/* Responsable / Técnico */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  Responsable / Técnico Asignado{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <EmpleadoCombobox
                  value={responsableId}
                  onValueChange={(val) => setResponsableId(val)}
                  placeholder="Seleccionar técnico o encargado..."
                />
              </div>

              {/* Fechas Programadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fechaInicio"
                    className="text-xs font-medium flex items-center gap-1 text-muted-foreground"
                  >
                    <Calendar className="size-3 text-indigo-500" />
                    Fecha Inicio Estimada
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="fechaFin"
                    className="text-xs font-medium flex items-center gap-1 text-muted-foreground"
                  >
                    <Clock className="size-3 text-indigo-500" />
                    Fecha Fin Estimada
                  </Label>
                  <Input
                    id="fechaFin"
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </Card>

            {/* Card: Diagnóstico y Observaciones */}
            <Card className="p-4 space-y-3.5 border-border/80 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. Diagnóstico & Observaciones
                </h2>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diagnostico" className="text-xs font-medium">
                  Diagnóstico Preliminar
                </Label>
                <Textarea
                  id="diagnostico"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Describe la evaluación preliminar del problema o falla..."
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="observacion" className="text-xs font-medium">
                  Observaciones Generales
                </Label>
                <Textarea
                  id="observacion"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Notas adicionales, requerimientos especiales o precauciones..."
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>
            </Card>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: DETALLE (Actividades de la OT) (7 cols)  */}
          {/* ========================================================= */}
          <div className="space-y-4 lg:col-span-7">
            <Card className="p-4 border-border/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex size-6.5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckSquare className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Tareas / Actividades a Realizar
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Planifica las actividades técnicas que se ejecutarán durante el mantenimiento.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {actividades.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {actividades.length} {actividades.length === 1 ? "tarea" : "tareas"}
                    </span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddActividad}
                    className="h-7 gap-1 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar Tarea</span>
                  </Button>
                </div>
              </div>

              {/* Lista dinámica de Actividades */}
              {actividades.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/90 bg-muted/10 p-8 text-center space-y-2.5">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <CheckSquare className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      No hay actividades agregadas a la orden
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Puedes añadir actividades desde el catálogo o escribir tareas específicas que el técnico debe cumplir.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddActividad}
                    className="h-7 text-xs font-semibold gap-1 rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar primera actividad</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {actividades.map((act, index) => (
                    <div
                      key={act.id}
                      className="group rounded-xl border border-border/80 bg-card/80 p-3 shadow-2xs space-y-2.5 hover:border-border transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5.5 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-foreground">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            Tarea #{index + 1}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveActividad(act.id)}
                          className="size-6 text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Selección del Catálogo (Opcional) */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Catálogo de Actividad (Opcional)
                        </Label>
                        <ActividadMantenimientoCombobox
                          value={act.actividadMantenimientoId}
                          onValueChange={(val, catAct) => {
                            handleUpdateActividad(act.id, {
                              actividadMantenimientoId: val || null,
                              descripcion: act.descripcion
                                ? act.descripcion
                                : catAct?.nombre || "",
                            })
                          }}
                          placeholder="Vincular a actividad del catálogo..."
                        />
                      </div>

                      {/* Descripción de la Actividad */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium flex items-center gap-1">
                          Descripción de la Tarea{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={act.descripcion}
                          onChange={(e) =>
                            handleUpdateActividad(act.id, {
                              descripcion: e.target.value,
                            })
                          }
                          placeholder="Ej: Cambio de aceite, calibración de sensores, limpieza..."
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Observación de la Actividad */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Observación / Nota técnica (Opcional)
                        </Label>
                        <Input
                          value={act.observacion || ""}
                          onChange={(e) =>
                            handleUpdateActividad(act.id, {
                              observacion: e.target.value,
                            })
                          }
                          placeholder="Detalles sobre herramientas, repuestos o tolerancias..."
                          className="h-7 text-xs text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddActividad}
                    className="w-full h-8 border-dashed text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar otra actividad</span>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </form>
    </PageShell>
  )
}
