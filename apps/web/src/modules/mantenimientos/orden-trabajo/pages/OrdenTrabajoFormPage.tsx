import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  ArrowLeft,
  Box,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Info,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  User,
  UserCheck,
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
import { cn, generateId } from "@/shared/lib/utils"

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
  responsableId?: string
}

export function OrdenTrabajoFormPage({
  solicitudId: propSolicitudId,
  activoId: propActivoId,
  responsableId: propResponsableId,
}: OrdenTrabajoFormPageProps) {
  const navigate = useNavigate()

  let searchParams: {
    solicitudId?: string
    activoId?: string
    responsableId?: string
  } = {}
  try {
    searchParams = useSearch({ strict: false }) as {
      solicitudId?: string
      activoId?: string
      responsableId?: string
    }
  } catch {
    // Non-route context fallback
  }

  const initialSolicitudId =
    propSolicitudId || searchParams.solicitudId || ""
  const initialActivoId = propActivoId || searchParams.activoId || ""
  const initialResponsableId =
    propResponsableId || searchParams.responsableId || ""

  // Form State - Maestro
  const [solicitudMantenimientoId, setSolicitudMantenimientoId] =
    useState<string>(initialSolicitudId)
  const [activoId, setActivoId] = useState<string>(initialActivoId)
  const [responsableId, setResponsableId] = useState<string>(
    initialResponsableId,
  )
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
    if (initialResponsableId && !responsableId) {
      setResponsableId(initialResponsableId)
    }
  }, [
    initialSolicitudId,
    initialActivoId,
    initialResponsableId,
    solicitudMantenimientoId,
    activoId,
    responsableId,
  ])

  // Queries for contextual data
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(solicitudMantenimientoId),
    enabled: Boolean(solicitudMantenimientoId),
  })
  const solicitud = solicitudQuery.data

  // When solicitud loads, auto-populate activoId and responsableId if not set
  useEffect(() => {
    if (solicitud?.activo?.id && !activoId) {
      setActivoId(solicitud.activo.id)
    }
    if (solicitud?.responsable?.id && !responsableId) {
      setResponsableId(solicitud.responsable.id)
    }
    if (solicitud?.descripcion && !diagnostico) {
      setDiagnostico(solicitud.descripcion)
    }
  }, [solicitud, activoId, responsableId, diagnostico])

  const activoDetailQuery = useQuery({
    ...activoQueries.detail(activoId || solicitud?.activo?.id || ""),
    enabled: Boolean(activoId || solicitud?.activo?.id),
  })
  const activo = activoDetailQuery.data

  const isCorrectivo =
    Boolean(
      solicitud?.tipoMantenimiento?.codigo?.toUpperCase().includes("CORR") ||
      solicitud?.tipoMantenimiento?.nombre?.toLowerCase().includes("correctiv"),
    )

  const createMutation = useCreateOrdenTrabajoWithActividades()

  // Handler for adding an activity row
  function handleAddActividad() {
    const newItem: ActividadFormItem = {
      id: generateId(),
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

      // Navigate to encargado page
      navigate({
        to: "/mantenimientos/encargado",
      })
    } catch {
      // Error handled by mutation toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-y-auto px-2 sm:px-4 md:px-6 py-2 pb-24 sm:pb-20">
      {/* Top Header Compacto */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b pb-2 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-lg hover:bg-muted"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Wrench className="size-3.5" />
            </div>
            <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight truncate">
              Nueva Orden de Trabajo
            </h1>
            {solicitud?.numero && (
              <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border shrink-0">
                Folio: {solicitud.numero}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="h-7 px-2.5 text-xs font-semibold"
          >
            Cancelar
          </Button>
        </div>
      </header>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="mt-3 space-y-3 max-w-5xl mx-auto">
        {/* Banner Superior: Activo & Solicitud Resumen */}
        <Card className="p-3 border bg-card shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Activo & Solicitud Resumen */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Box className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {(solicitud?.activo?.codigo || activo?.codigo) && (
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {solicitud?.activo?.codigo || activo?.codigo}
                    </span>
                  )}
                  <span className="font-heading text-sm font-bold text-foreground truncate">
                    {solicitud?.activo?.nombre || activo?.nombre || "Activo no especificado"}
                  </span>
                  {solicitud?.prioridad && (
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded border",
                        getPrioridadBadgeStyles(solicitud.prioridad.nivel ?? 1),
                      )}
                    >
                      {solicitud.prioridad.nombre}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  {activo?.ubicacion && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 opacity-70" />
                      {activo.ubicacion.nombre}
                    </span>
                  )}
                  {solicitud?.solicitante && (
                    <span className="truncate">
                      Solicitante: <strong className="text-foreground font-medium">{solicitud.solicitante.nombre}</strong>
                    </span>
                  )}
                  {solicitud?.tipoMantenimiento && (
                    <span className="hidden md:inline truncate">
                      Tipo: <strong className="text-foreground font-medium">{solicitud.tipoMantenimiento.nombre}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Badge Indicador de Orden de Trabajo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold text-xs shadow-2xs shrink-0 self-start sm:self-center">
              <Wrench className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Orden de Trabajo Técnica</span>
            </div>
          </div>

          {/* Selectores en caso de que no venga una solicitud asignada */}
          {!initialSolicitudId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-border/60">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  Solicitud Asignada <span className="text-destructive">*</span>
                </Label>
                <SolicitudAsignadaCombobox
                  value={solicitudMantenimientoId}
                  onValueChange={(val, sol) => {
                    setSolicitudMantenimientoId(val)
                    if (sol?.activo?.id) {
                      setActivoId(sol.activo.id)
                    }
                    if (sol?.responsable?.id) {
                      setResponsableId(sol.responsable.id)
                    }
                    if (sol?.descripcion && !diagnostico) {
                      setDiagnostico(sol.descripcion)
                    }
                  }}
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  Activo Principal <span className="text-destructive">*</span>
                </Label>
                <ActivoCombobox
                  value={activoId || solicitud?.activo?.id || ""}
                  onValueChange={(val) => setActivoId(val)}
                  disabled={Boolean(solicitud?.activo?.id)}
                  className="h-8.5 text-xs"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Responsable y Fechas de Planificación (3 Columnas Compactas) */}
        <Card className="p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-1.5 border-b pb-1.5">
            <UserCheck className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Responsable y Planificación Temporal
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
            {/* Responsable Técnico */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <User className="size-3 text-muted-foreground" />
                <span>Responsable / Técnico</span>
                <span className="text-destructive">*</span>
              </Label>
              <EmpleadoCombobox
                value={responsableId}
                onValueChange={(val) => setResponsableId(val)}
                placeholder="Seleccionar técnico..."
                className="h-8.5 text-xs"
              />
            </div>

            {/* Fecha Inicio Estimada */}
            <div className="space-y-1">
              <Label htmlFor="fechaInicio" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha Inicio Estimada</span>
              </Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-8.5 text-xs font-medium bg-background"
              />
            </div>

            {/* Fecha Fin Estimada */}
            <div className="space-y-1">
              <Label htmlFor="fechaFin" className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                <span>Fecha Fin Estimada</span>
              </Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-8.5 text-xs font-medium bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Diagnóstico y Observaciones (2 Columnas Limpias) */}
        <Card className="p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-1.5 border-b pb-1.5">
            <FileText className="size-3.5 text-primary" />
            <h2 className="font-heading text-xs sm:text-[13px] font-bold text-foreground">
              Diagnóstico y Observaciones
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Diagnóstico */}
            <div className="space-y-1">
              <Label htmlFor="diagnostico" className="text-[11px] font-semibold text-foreground">
                Diagnóstico Preliminar / Alcance
              </Label>
              <Textarea
                id="diagnostico"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Describe la evaluación preliminar del problema o falla..."
                rows={2}
                className="text-xs resize-none bg-background"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-1">
              <Label htmlFor="observacion" className="text-[11px] font-semibold text-foreground">
                Observaciones Generales / Requerimientos
              </Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Notas adicionales, herramientas especiales o precauciones..."
                rows={2}
                className="text-xs resize-none bg-background"
              />
            </div>
          </div>
        </Card>

        {/* Tareas / Actividades a Realizar (Estructura tipo Checklist / Accesorios) */}
        <Card className="p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              <h2 className="font-heading text-xs sm:text-sm font-bold text-foreground">
                Planificación de Actividades / Tareas
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                ({actividades.length} {actividades.length === 1 ? "tarea" : "tareas"})
              </span>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddActividad}
              className="h-7 gap-1 px-2.5 text-xs font-semibold rounded-lg"
            >
              <Plus className="size-3.5" />
              <span>Agregar Tarea</span>
            </Button>
          </div>

          {/* Lista de Actividades como Lista Contigua / Tabla */}
          {actividades.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10 p-4">
              <p className="font-semibold text-foreground">No hay actividades planificadas</p>
              <p className="text-muted-foreground mt-0.5">
                {isCorrectivo
                  ? "Escriba las tareas técnicas específicas que el técnico debe cumplir con el botón '+ Agregar Tarea'."
                  : "Puede añadir actividades desde el catálogo o escribir tareas personalizadas con el botón '+ Agregar Tarea'."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddActividad}
                className="h-7 text-xs font-semibold gap-1 rounded-lg mt-2 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Agregar primera tarea</span>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60 bg-background shadow-2xs">
              {/* Encabezado de la tabla */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                <div className="w-8 text-center shrink-0">#</div>
                {!isCorrectivo && <div className="w-56 shrink-0">Catálogo</div>}
                <div className="flex-1 min-w-0">Descripción de la Tarea <span className="text-destructive">*</span></div>
                <div className="w-48 sm:w-56 shrink-0">Nota / Instrucción</div>
                <div className="w-7 shrink-0"></div>
              </div>

              {/* Filas en formato lista contigua */}
              {actividades.map((act, index) => (
                <div
                  key={act.id}
                  className="p-1.5 sm:px-3 text-xs flex flex-col md:flex-row md:items-center gap-2 hover:bg-muted/15 transition-colors"
                >
                  {/* Número de tarea */}
                  <div className="flex items-center justify-between md:justify-center md:w-8 shrink-0">
                    <span className="flex size-5 items-center justify-center rounded bg-muted font-mono font-bold text-[11px] text-foreground">
                      {index + 1}
                    </span>
                    <span className="font-bold text-foreground text-xs md:hidden">
                      Tarea #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground hover:text-destructive md:hidden cursor-pointer"
                      onClick={() => handleRemoveActividad(act.id)}
                      title="Eliminar tarea"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {/* Catálogo Opcional (solo si no es mantenimiento correctivo) */}
                  {!isCorrectivo && (
                    <div className="w-full md:w-56 shrink-0 space-y-0.5 md:space-y-0">
                      <span className="md:hidden text-[10.5px] font-semibold text-muted-foreground">
                        Catálogo de Actividad:
                      </span>
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
                        placeholder="Catálogo (opcional)..."
                        className="h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Descripción de la tarea */}
                  <div className="w-full md:flex-1 min-w-0 space-y-0.5 md:space-y-0">
                    <span className="md:hidden text-[10.5px] font-semibold text-foreground flex items-center gap-0.5">
                      <span>Descripción</span>
                      <span className="text-destructive">*</span>
                    </span>
                    <Input
                      value={act.descripcion}
                      onChange={(e) =>
                        handleUpdateActividad(act.id, {
                          descripcion: e.target.value,
                        })
                      }
                      placeholder="Descripción de la tarea técnica (obligatorio)..."
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>

                  {/* Observación de la tarea */}
                  <div className="w-full md:w-48 sm:w-56 shrink-0 space-y-0.5 md:space-y-0">
                    <span className="md:hidden text-[10.5px] font-semibold text-muted-foreground">
                      Nota / Instrucción (Opcional):
                    </span>
                    <Input
                      value={act.observacion || ""}
                      onChange={(e) =>
                        handleUpdateActividad(act.id, {
                          observacion: e.target.value,
                        })
                      }
                      placeholder="Nota / Instrucción (opc)..."
                      className="h-8 text-xs bg-background text-muted-foreground"
                    />
                  </div>

                  {/* Eliminar tarea (Desktop) */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive shrink-0 hidden md:flex cursor-pointer"
                    onClick={() => handleRemoveActividad(act.id)}
                    title="Eliminar tarea"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom Sticky Action Bar */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 p-3 rounded-2xl border bg-background/95 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <Info className="size-4 text-primary shrink-0 hidden sm:block" />
            <span>
              Orden de Trabajo • <strong>{actividades.length}</strong> {actividades.length === 1 ? "tarea planificada" : "tareas planificadas"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              disabled={createMutation.isPending}
              className="h-8 px-4 text-xs font-semibold"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isValid || createMutation.isPending}
              className="h-8 gap-2 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
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
        </div>
      </form>
    </PageShell>
  )
}

