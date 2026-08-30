import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Box,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { ordenTrabajoQueries } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.queries"
import type {
  OrdenTrabajo,
  OrdenTrabajoActividad,
} from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.service"
import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"
import { WorkflowActionDialog } from "./WorkflowActionDialog"

type SupervisorRevisionModalProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SupervisorRevisionModal({
  solicitud,
  open,
  onOpenChange,
  onSuccess,
}: SupervisorRevisionModalProps) {
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null)

  // Dialog state for confirming validation or entering observation note
  const [actionDialogState, setActionDialogState] = useState<{
    open: boolean
    action: WorkflowAction | null
    taskName?: string
    fields?: WorkflowField[]
  }>({
    open: false,
    action: null,
  })

  const solicitudId = solicitud?.id ?? ""

  // Queries
  const solicitudDetailQuery = useQuery({
    ...solicitudQueries.detail(solicitudId),
    enabled: Boolean(solicitudId && open),
  })
  const currentSolicitud = solicitudDetailQuery.data ?? solicitud

  // Query OT list and find matching OT by solicitudId
  const otListQuery = useQuery({
    ...ordenTrabajoQueries.list({ size: 100 }),
    enabled: Boolean(solicitudId && open),
  })

  const ordenTrabajo: OrdenTrabajo | null = useMemo(() => {
    const list = otListQuery.data?.content ?? []
    return (
      list.find((ot) => ot.solicitudMantenimientoId === solicitudId) ?? null
    )
  }, [otListQuery.data?.content, solicitudId])

  const otId = ordenTrabajo?.id ?? ""

  // Query actividades for the OT
  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(otId),
    enabled: Boolean(otId && open),
  })
  const actividades = actividadesQuery.data?.content ?? []

  // Query adjuntos for the OT
  const adjuntosQuery = useQuery({
    ...ordenTrabajoQueries.adjuntosList(otId),
    enabled: Boolean(otId && open),
  })
  const adjuntos = adjuntosQuery.data?.content ?? []

  // Query Control de Activo
  const controlActivoListQuery = useQuery({
    ...controlActivoQueries.list({ size: 100 }),
    enabled: Boolean(solicitudId && open),
  })
  const controlActivo = useMemo(() => {
    const list = controlActivoListQuery.data?.content ?? []
    return (
      list.find((ca) => ca.solicitudMantenimientoId === solicitudId) ?? null
    )
  }, [controlActivoListQuery.data?.content, solicitudId])

  // Query Flowable workflow actions
  const actionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitudId),
    enabled: Boolean(solicitudId && open),
  })
  const workflowActions = actionsQuery.data?.actions ?? []
  const taskName = actionsQuery.data?.taskName

  if (!currentSolicitud) return null

  const estadoBadgeClass = getEstadoBadgeStyles(currentSolicitud.estado)
  const prioridadBadgeClass = getPrioridadBadgeStyles(
    currentSolicitud.prioridad?.nivel ?? 1,
  )
  const isEnRevision =
    (currentSolicitud.estado ?? "").toUpperCase() === "EN_REVISION"
  const isValidado =
    (currentSolicitud.estado ?? "").toUpperCase() === "VALIDADO"
  const isObservado =
    (currentSolicitud.estado ?? "").toUpperCase() ===
    "OBSERVADO_MANTENIMIENTO"

  // Filter specific validation actions (VALIDAR / OBSERVAR)
  const validarAction = workflowActions.find((a) => {
    const val = (a.value ?? "").toUpperCase()
    const name = (a.name ?? "").toLowerCase()
    return val.includes("VALID") || name.includes("validar") || name.includes("aprobar")
  })

  const observarAction = workflowActions.find((a) => {
    const val = (a.value ?? "").toUpperCase()
    const name = (a.name ?? "").toLowerCase()
    return val.includes("OBSERV") || name.includes("observar") || val.includes("CORREG") || name.includes("corregir")
  })

  const totalActividades = actividades.length
  const actividadesRealizadas = actividades.filter((a) => a.realizado).length

  function handleTriggerAction(action: WorkflowAction) {
    setActionDialogState({
      open: true,
      action,
      taskName,
      fields: actionsQuery.data?.fields,
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl shadow-xl">
          {/* Header */}
          <DialogHeader className="px-5 pt-4 pb-3 border-b shrink-0 bg-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                    <ShieldCheck className="size-4" />
                  </div>
                  <DialogTitle className="text-base sm:text-lg font-heading font-bold text-foreground">
                    Revisión Técnica de Mantenimiento
                  </DialogTitle>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted border border-border/80 text-foreground">
                    {currentSolicitud.numero}
                  </span>
                </div>
                <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                  Supervisa y valida la ejecución técnica, tareas realizadas y evidencias fotográficas.
                </DialogDescription>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold capitalize border",
                    estadoBadgeClass,
                  )}
                >
                  {currentSolicitud.estado?.toLowerCase().replace(/_/g, " ")}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border",
                    prioridadBadgeClass,
                  )}
                >
                  {currentSolicitud.prioridad?.nombre ?? "Media"}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
            {/* Resumen Superior: Activo + Responsable + Solicitante */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Activo Fijo */}
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Box className="size-3.5 text-primary" />
                  <span>Activo Fijo</span>
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {currentSolicitud.activo?.nombre ?? "Activo no especificado"}
                  </p>
                  <code className="text-[11px] font-mono text-primary font-semibold">
                    {currentSolicitud.activo?.codigo ?? "—"}
                  </code>
                </div>
              </div>

              {/* Card 2: Técnico Responsable */}
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <User className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Técnico Responsable</span>
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {currentSolicitud.responsable?.nombre ?? "No asignado"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Técnico de Mantenimiento
                  </p>
                </div>
              </div>

              {/* Card 3: Solicitante & Fechas */}
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Calendar className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Solicitante & Fechas</span>
                </div>
                <div className="text-[11.5px] space-y-0.5 text-muted-foreground">
                  <p className="truncate">
                    Por: <strong className="text-foreground">{currentSolicitud.solicitante?.nombre}</strong>
                  </p>
                  {currentSolicitud.fechaSolicitud && (
                    <p className="text-[11px]">
                      Solicitud: {formatDate(currentSolicitud.fechaSolicitud)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnóstico / Título y Descripción del Problema */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-foreground">
                  {currentSolicitud.titulo}
                </p>
                {currentSolicitud.tipoMantenimiento?.nombre && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10.5px] font-bold border",
                      getTipoMantenimientoBadgeClass(
                        currentSolicitud.tipoMantenimiento.nombre,
                        false,
                      ),
                    )}
                  >
                    {currentSolicitud.tipoMantenimiento.nombre}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {currentSolicitud.descripcion || "Sin descripción adicional."}
              </p>
            </div>

            {/* Control de Activo: Acta de Entrega */}
            {controlActivo && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                    <FileCheck2 className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Control de Activo Registrado
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Entrega verificada para inicio de trabajos.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Listo
                </span>
              </div>
            )}

            {/* Sección: Orden de Trabajo y Detalle de Actividades */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b pb-1.5">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Orden de Trabajo: {ordenTrabajo ? ordenTrabajo.numero : "Sin OT"}
                  </h3>
                </div>
                {ordenTrabajo && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    Tareas: <strong className="text-indigo-600 dark:text-indigo-400">{actividadesRealizadas}</strong> de {totalActividades} completadas
                  </span>
                )}
              </div>

              {/* Lista de Actividades y Evidencias */}
              {actividadesQuery.isLoading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Cargando actividades y evidencias...</span>
                </div>
              ) : actividades.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground bg-muted/10">
                  <Clock className="size-6 text-muted-foreground/50 mx-auto mb-1.5" />
                  <p className="font-semibold text-foreground">No hay actividades registradas en la OT</p>
                  <p className="text-[11px]">El técnico no ha cargado tareas para este mantenimiento.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actividades.map((act, index) => (
                    <SupervisorActividadCard
                      key={act.id}
                      actividad={act}
                      index={index + 1}
                      onPreviewImage={(url) => setActiveImagePreview(url)}
                    />
                  ))}
                </div>
              )}

              {/* Adjuntos Generales de la OT */}
              {adjuntos.length > 0 && (
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-2 mt-3 shadow-2xs">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Paperclip className="size-3.5 text-muted-foreground" />
                    <span>Documentos y Adjuntos de la Orden ({adjuntos.length})</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {adjuntos.map((adj) => (
                      <div
                        key={adj.id}
                        className="flex items-center justify-between gap-2 rounded-lg border bg-muted/20 p-2 text-xs"
                      >
                        <span className="truncate font-medium text-foreground text-[11.5px]" title={adj.nombreArchivo}>
                          {adj.nombreArchivo}
                        </span>
                        {adj.url && (
                          <a
                            href={adj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10.5px] text-primary hover:underline shrink-0"
                          >
                            <Eye className="size-3" />
                            <span>Ver</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Decision Footer */}
          <DialogFooter className="px-5 py-3 border-t shrink-0 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldAlert className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                {isEnRevision
                  ? "Evalúa las evidencias y emite tu decisión como supervisor."
                  : isValidado
                    ? "Este mantenimiento ya fue validado y aprobado técnicamente."
                    : isObservado
                      ? "Este mantenimiento está en corrección por el técnico."
                      : "Estado actual de supervisión."}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cerrar
              </Button>

              {/* Botón Observar (Ámbar) */}
              {isEnRevision && observarAction && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleTriggerAction(observarAction)}
                  className="text-xs h-8 font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Observar Mantenimiento</span>
                </Button>
              )}

              {/* Botón Validar (Verde/Teal) */}
              {isEnRevision && validarAction && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleTriggerAction(validarAction)}
                  className="text-xs h-8 font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Validar Mantenimiento</span>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox / Image Preview Modal */}
      {activeImagePreview && (
        <Dialog
          open={Boolean(activeImagePreview)}
          onOpenChange={(open) => !open && setActiveImagePreview(null)}
        >
          <DialogContent className="max-w-3xl p-2 bg-black/95 border-none text-white">
            <div className="relative flex items-center justify-center p-2">
              <img
                src={activeImagePreview}
                alt="Evidencia técnica"
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sub-dialog Workflow Action (Validar / Observar) */}
      <WorkflowActionDialog
        open={actionDialogState.open}
        onOpenChange={(open) =>
          setActionDialogState((prev) => ({ ...prev, open }))
        }
        solicitud={currentSolicitud}
        action={actionDialogState.action}
        taskName={actionDialogState.taskName}
        fields={actionDialogState.fields}
        onSuccess={() => {
          onOpenChange(false)
          onSuccess?.()
        }}
      />
    </>
  )
}

function SupervisorActividadCard({
  actividad,
  index,
  onPreviewImage,
}: {
  actividad: OrdenTrabajoActividad
  index: number
  onPreviewImage: (url: string) => void
}) {
  const evidenciasQuery = useQuery({
    ...ordenTrabajoQueries.evidenciasList(actividad.id),
  })
  const evidencias = evidenciasQuery.data?.content ?? []

  return (
    <div
      className={cn(
        "rounded-xl border p-3 shadow-2xs transition-all",
        actividad.realizado
          ? "bg-card border-border/80 hover:border-emerald-500/40"
          : "bg-muted/20 border-border/60",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Check de Realizado */}
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold mt-0.5",
              actividad.realizado
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-muted text-muted-foreground border border-border/60",
            )}
          >
            {actividad.realizado ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="text-[11px] font-mono">{index}</span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground">
                {actividad.actividadMantenimiento?.nombre || actividad.descripcion || `Tarea #${index}`}
              </span>
              {actividad.realizado ? (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                  Realizada
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                  Pendiente
                </span>
              )}
            </div>

            {actividad.observacion && (
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {actividad.observacion}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Evidencias fotográficas / adjuntos de la tarea */}
      {evidencias.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-border/50">
          <p className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1.5">
            <Camera className="size-3" />
            <span>Evidencias Fotográficas ({evidencias.length})</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {evidencias.map((ev) => (
              <div
                key={ev.id}
                onClick={() => ev.url && onPreviewImage(ev.url)}
                className="group relative flex items-center gap-2 rounded-lg border bg-muted/30 p-1.5 text-xs hover:border-primary/50 cursor-pointer transition-all"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-600">
                  <ImageIcon className="size-3.5" />
                </div>
                <span className="truncate text-[10.5px] font-medium text-foreground group-hover:text-primary" title={ev.nombreArchivo}>
                  {ev.nombreArchivo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
