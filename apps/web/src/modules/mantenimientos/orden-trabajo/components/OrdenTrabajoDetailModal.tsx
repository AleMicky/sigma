import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertCircle,
  Box,
  Calendar,
  Camera,
  CheckCircle2,
  CheckSquare,
  Download,
  Edit2,
  Eye,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  RefreshCw,
  Trash2,
  User,
  Wrench,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"

import { solicitudQueries } from "@/modules/mantenimientos/solicitud/api/solicitud.queries"
import {
  useDeleteOrdenTrabajoActividad,
  useDeleteOrdenTrabajoActividadEvidencia,
  useDeleteOrdenTrabajoAdjunto,
  useToggleOrdenTrabajoActividadRealizado,
} from "../api/orden-trabajo.mutations"
import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
import type {
  OrdenTrabajo,
  OrdenTrabajoActividad,
  OrdenTrabajoActividadEvidencia,
  OrdenTrabajoAdjunto,
} from "../api/orden-trabajo.service"
import { OrdenTrabajoActividadDialog } from "./OrdenTrabajoActividadDialog"
import { OrdenTrabajoAdjuntoDialog } from "./OrdenTrabajoAdjuntoDialog"
import { OrdenTrabajoEvidenciaDialog } from "./OrdenTrabajoEvidenciaDialog"
import { OrdenTrabajoFormDialog } from "./OrdenTrabajoFormDialog"

type OrdenTrabajoDetailModalProps = {
  ordenTrabajo?: OrdenTrabajo | null
  solicitudId?: string | null
  solicitudNumero?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function OrdenTrabajoDetailModal({
  ordenTrabajo,
  solicitudId,
  solicitudNumero,
  open,
  onOpenChange,
  onUpdated,
}: OrdenTrabajoDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>("actividades")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)

  // Sub-dialogs state
  const [actividadModal, setActividadModal] = useState<{
    open: boolean
    actividad?: OrdenTrabajoActividad | null
  }>({ open: false })

  const [adjuntoModal, setAdjuntoModal] = useState<{
    open: boolean
    adjuntoToReplace?: OrdenTrabajoAdjunto | null
  }>({ open: false })

  const [evidenciaModal, setEvidenciaModal] = useState<{
    open: boolean
    actividadId: string
    actividadNombre?: string
    evidenciaToReplace?: OrdenTrabajoActividadEvidencia | null
  }>({ open: false, actividadId: "" })

  // Si se pasa solicitudId y no ordenTrabajo, consultar la OT directamente
  const otsForSolicitudQuery = useQuery({
    ...ordenTrabajoQueries.list({
      solicitudMantenimientoId: solicitudId ?? undefined,
      size: 1,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: Boolean(solicitudId && !ordenTrabajo?.id && open),
  })

  const fetchedOT = otsForSolicitudQuery.data?.content?.[0] ?? null
  const targetOT = ordenTrabajo ?? fetchedOT
  const otId = targetOT?.id ?? ""

  // Queries
  const otQuery = useQuery({
    ...ordenTrabajoQueries.detail(otId),
    enabled: Boolean(otId && open),
  })
  const currentOT = otQuery.data ?? targetOT

  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(otId),
    enabled: Boolean(otId && open),
  })
  const actividades = actividadesQuery.data?.content ?? []

  const adjuntosQuery = useQuery({
    ...ordenTrabajoQueries.adjuntosList(otId),
    enabled: Boolean(otId && open),
  })
  const adjuntos = adjuntosQuery.data?.content ?? []

  // Check solicitud estado to determine if OT is in read-only phase (FINALIZADO / CANCELADO)
  const currentSolicitudId =
    currentOT?.solicitudMantenimientoId || solicitudId || ""
  const solicitudQuery = useQuery({
    ...solicitudQueries.detail(currentSolicitudId),
    enabled: Boolean(currentSolicitudId && open),
  })
  const solicitud = solicitudQuery.data
  const estadoSolicitudNorm = (solicitud?.estado ?? "").toUpperCase().trim()
  const isReadOnly =
    estadoSolicitudNorm === "FINALIZADO" ||
    estadoSolicitudNorm === "CANCELADO" ||
    estadoSolicitudNorm === "RECHAZADO"

  // Modo planificación solo si aún está en SOLICITADO antes de asignar
  const isEnPlanificacion = estadoSolicitudNorm === "SOLICITADO"

  // Mutations
  const toggleActividadMutation = useToggleOrdenTrabajoActividadRealizado()
  const deleteActividadMutation = useDeleteOrdenTrabajoActividad()
  const deleteAdjuntoMutation = useDeleteOrdenTrabajoAdjunto()
  const deleteEvidenciaMutation = useDeleteOrdenTrabajoActividadEvidencia()

  const isInitialLoading =
    Boolean(solicitudId && !ordenTrabajo?.id && otsForSolicitudQuery.isLoading)

  const totalActividades = actividades.length
  const completadasCount = actividades.filter((a) => a.realizado).length
  const progressPercent =
    totalActividades > 0
      ? Math.round((completadasCount / totalActividades) * 100)
      : 0

  function handleToggleRealizado(act: OrdenTrabajoActividad) {
    if (isReadOnly) return
    toggleActividadMutation.mutate({
      id: act.id,
      payload: {
        ordenTrabajoId: otId,
        actividadMantenimientoId: act.actividadMantenimiento?.id || null,
        descripcion: act.descripcion,
        realizado: !act.realizado,
        observacion: act.observacion || null,
        fechaRealizacion: !act.realizado
          ? new Date().toISOString().slice(0, 19)
          : null,
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-sky-600" />
              <p className="text-xs font-semibold">Cargando orden de trabajo...</p>
            </div>
          ) : !currentOT ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
              <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <Wrench className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Sin Orden de Trabajo
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Esta solicitud no tiene una orden de trabajo asociada aún.
                </p>
              </div>
              {solicitudId && (
                <Link
                  to="/mantenimientos/ordenes-trabajo/nuevo"
                  search={{ solicitudId }}
                  onClick={() => onOpenChange(false)}
                >
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer mt-1 shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Crear Orden de Trabajo</span>
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <DialogHeader className="px-5 pt-4 pb-3 border-b shrink-0 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      <Wrench className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <DialogTitle className="text-base sm:text-lg font-bold">
                          {currentOT.numero || "Orden de Trabajo"}
                        </DialogTitle>
                        {(solicitudNumero || solicitud?.numero) && (
                          <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded border border-border">
                            Folio: {solicitudNumero || solicitud?.numero}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide",
                            progressPercent === 100
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : progressPercent > 0
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {progressPercent === 100
                            ? "Completada"
                            : progressPercent > 0
                              ? `En Ejecución (${progressPercent}%)`
                              : "Pendiente"}
                        </Badge>
                      </div>
                      <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 truncate">
                        <span>
                          Activo: <strong className="text-foreground">{currentOT.activo?.codigo} - {currentOT.activo?.nombre}</strong>
                        </span>
                        {currentOT.responsable?.nombre && (
                          <>
                            <span>•</span>
                            <span>Resp: <strong className="text-foreground">{currentOT.responsable.nombre}</strong></span>
                          </>
                        )}
                      </DialogDescription>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="h-7 text-xs gap-1 px-2.5 shrink-0"
                  >
                    <Edit2 className="size-3" />
                    <span>Editar</span>
                  </Button>
                </div>

            {/* Progress bar */}
            {totalActividades > 0 && (
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    Progreso de Actividades: <strong>{completadasCount} de {totalActividades} completadas</strong>
                  </span>
                  <span className="font-bold text-xs text-foreground">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      progressPercent === 100 ? "bg-emerald-500" : "bg-sky-500",
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Body Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <div className="px-5 pt-2 border-b shrink-0 bg-background">
              <TabsList className="h-8 bg-muted/60 p-0.5 rounded-lg">
                <TabsTrigger
                  value="actividades"
                  className="text-xs px-3 h-7 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <CheckSquare className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Actividades / Tareas</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
                    {totalActividades}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="general"
                  className="text-xs px-3 h-7 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <FileText className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Detalles & Diagnóstico</span>
                </TabsTrigger>
                <TabsTrigger
                  value="adjuntos"
                  className="text-xs px-3 h-7 rounded-md gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Paperclip className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Adjuntos Generales</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
                    {adjuntos.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: ACTIVIDADES & TAREAS */}
            <TabsContent
              value="actividades"
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 m-0"
            >
              {isEnPlanificacion && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      Modo Planificación (Solicitud Asignada)
                    </p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      Puedes crear, editar o eliminar las tareas planificadas. Para comenzar a marcar actividades realizadas o subir evidencias fotográficas, primero debes hacer clic en <strong>"Iniciar mantenimiento"</strong> en la solicitud.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tareas de la Orden ({completadasCount}/{totalActividades})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setActividadModal({ open: true, actividad: null })
                  }
                  className="h-7 text-xs font-semibold gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  <Plus className="size-3.5" />
                  <span>Agregar Tarea</span>
                </Button>
              </div>

              {actividades.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-muted/10">
                  <CheckSquare className="size-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Sin tareas registradas
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                    Agrega las tareas y actividades técnicas que deben ejecutarse en esta orden de trabajo.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActividadModal({ open: true, actividad: null })
                    }
                    className="mt-3 h-7 text-xs font-semibold gap-1"
                  >
                    <Plus className="size-3" />
                    <span>Agregar Primera Tarea</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {actividades.map((act) => (
                    <ActividadItemCard
                      key={act.id}
                      actividad={act}
                      isEnPlanificacion={isEnPlanificacion}
                      onToggleRealizado={() => handleToggleRealizado(act)}
                      onEdit={() =>
                        setActividadModal({ open: true, actividad: act })
                      }
                      onDelete={() => deleteActividadMutation.mutate(act.id)}
                      onAddEvidencia={() =>
                        setEvidenciaModal({
                          open: true,
                          actividadId: act.id,
                          actividadNombre: act.descripcion,
                          evidenciaToReplace: null,
                        })
                      }
                      onReplaceEvidencia={(ev) =>
                        setEvidenciaModal({
                          open: true,
                          actividadId: act.id,
                          actividadNombre: act.descripcion,
                          evidenciaToReplace: ev,
                        })
                      }
                      onDeleteEvidencia={(evId) =>
                        deleteEvidenciaMutation.mutate({
                          actividadId: act.id,
                          id: evId,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: INFORMACIÓN GENERAL & DIAGNÓSTICO */}
            <TabsContent
              value="general"
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 m-0"
            >
              {/* Fechas & Activo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3 bg-card/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Box className="size-3 text-sky-500" />
                    <span>Activo Intervenido</span>
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {currentOT.activo?.codigo} - {currentOT.activo?.nombre}
                  </p>
                </div>

                <div className="rounded-xl border p-3 bg-card/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User className="size-3 text-emerald-500" />
                    <span>Responsable Técnico</span>
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {currentOT.responsable?.nombre || "No especificado"}
                  </p>
                </div>

                <div className="rounded-xl border p-3 bg-card/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-amber-500" />
                    <span>Fecha Inicio</span>
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {currentOT.fechaInicio
                      ? new Date(currentOT.fechaInicio).toLocaleString()
                      : "No registrada"}
                  </p>
                </div>

                <div className="rounded-xl border p-3 bg-card/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-blue-500" />
                    <span>Fecha Fin</span>
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {currentOT.fechaFin
                      ? new Date(currentOT.fechaFin).toLocaleString()
                      : "En curso / No finalizada"}
                  </p>
                </div>
              </div>

              {/* Diagnóstico */}
              <div className="rounded-xl border p-3 bg-card/60 space-y-1">
                <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-500" />
                  <span>Diagnóstico Técnico</span>
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {currentOT.diagnostico || "Sin diagnóstico especificado."}
                </p>
              </div>

              {/* Trabajo Realizado */}
              <div className="rounded-xl border p-3 bg-card/60 space-y-1">
                <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="size-3.5 text-emerald-500" />
                  <span>Trabajo Realizado / Procedimiento</span>
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {currentOT.trabajoRealizado || "Sin trabajo reportado aún."}
                </p>
              </div>

              {/* Observaciones */}
              <div className="rounded-xl border p-3 bg-card/60 space-y-1">
                <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-sky-500" />
                  <span>Observaciones y Recomendaciones</span>
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {currentOT.observacion || "Sin observaciones."}
                </p>
              </div>
            </TabsContent>

            {/* TAB 3: ADJUNTOS GENERALES */}
            <TabsContent
              value="adjuntos"
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 m-0"
            >
              {isEnPlanificacion && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      Modo Planificación (Solicitud Asignada)
                    </p>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                      La carga de archivos de ejecución y evidencias técnicas estará disponible cuando la solicitud pase a <strong>"En Mantenimiento"</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Documentos y Archivos de la OT ({adjuntos.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isEnPlanificacion}
                  onClick={() =>
                    setAdjuntoModal({ open: true, adjuntoToReplace: null })
                  }
                  className={cn(
                    "h-7 text-xs font-semibold gap-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20",
                    isEnPlanificacion && "opacity-50 cursor-not-allowed",
                  )}
                  title={
                    isEnPlanificacion
                      ? "Solo se pueden subir adjuntos de ejecución cuando la orden esté en mantenimiento"
                      : "Subir archivo adjunto"
                  }
                >
                  <Plus className="size-3.5" />
                  <span>Subir Adjunto</span>
                </Button>
              </div>

              {adjuntos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl bg-muted/10">
                  <Paperclip className="size-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Sin adjuntos registrados
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                    Puedes adjuntar manuales, informes o garantías en PDF, Word o imágenes una vez iniciado el mantenimiento.
                  </p>
                  {!isEnPlanificacion && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setAdjuntoModal({ open: true, adjuntoToReplace: null })
                      }
                      className="mt-3 h-7 text-xs font-semibold gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Subir Primer Adjunto</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {adjuntos.map((adj) => (
                    <div
                      key={adj.id}
                      className="flex items-center justify-between gap-2.5 rounded-xl border p-2.5 bg-card/60 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          <Paperclip className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate" title={adj.nombreArchivo}>
                            {adj.nombreArchivo}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {adj.descripcion || "Sin descripción"} • {adj.tamanio ? `${(adj.tamanio / 1024).toFixed(1)} KB` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {adj.url && (
                          <a
                            href={adj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Descargar / Ver archivo"
                          >
                            <Download className="size-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setAdjuntoModal({
                              open: true,
                              adjuntoToReplace: adj,
                            })
                          }
                          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                          title="Reemplazar archivo"
                        >
                          <RefreshCw className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            deleteAdjuntoMutation.mutate({
                              ordenTrabajoId: otId,
                              id: adj.id,
                            })
                          }
                          className="inline-flex size-6 items-center justify-center rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Main OT Dialog */}
      <OrdenTrabajoFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        ordenTrabajo={currentOT}
        onSuccess={() => {
          otQuery.refetch()
          onUpdated?.()
        }}
      />

      {/* Add / Edit Actividad Dialog */}
      <OrdenTrabajoActividadDialog
        open={actividadModal.open}
        onOpenChange={(op) => setActividadModal((prev) => ({ ...prev, open: op }))}
        ordenTrabajoId={otId}
        actividad={actividadModal.actividad}
        onSuccess={() => {
          actividadesQuery.refetch()
          onUpdated?.()
        }}
      />

      {/* Upload / Replace Adjunto Dialog */}
      <OrdenTrabajoAdjuntoDialog
        open={adjuntoModal.open}
        onOpenChange={(op) => setAdjuntoModal((prev) => ({ ...prev, open: op }))}
        ordenTrabajoId={otId}
        adjuntoToReplace={adjuntoModal.adjuntoToReplace}
        onSuccess={() => {
          adjuntosQuery.refetch()
        }}
      />

      {/* Upload / Replace Evidencia Dialog */}
      <OrdenTrabajoEvidenciaDialog
        open={evidenciaModal.open}
        onOpenChange={(op) =>
          setEvidenciaModal((prev) => ({ ...prev, open: op }))
        }
        actividadId={evidenciaModal.actividadId}
        actividadNombre={evidenciaModal.actividadNombre}
        evidenciaToReplace={evidenciaModal.evidenciaToReplace}
        onSuccess={() => {
          actividadesQuery.refetch()
        }}
      />
    </>
  )
}

// Sub-component for each Actividad item with embedded Evidencias query
function ActividadItemCard({
  actividad,
  isEnPlanificacion,
  onToggleRealizado,
  onEdit,
  onDelete,
  onAddEvidencia,
  onReplaceEvidencia,
  onDeleteEvidencia,
}: {
  actividad: OrdenTrabajoActividad
  isEnPlanificacion?: boolean
  onToggleRealizado: () => void
  onEdit: () => void
  onDelete: () => void
  onAddEvidencia: () => void
  onReplaceEvidencia: (ev: OrdenTrabajoActividadEvidencia) => void
  onDeleteEvidencia: (evId: string) => void
}) {
  const evidenciasQuery = useQuery(
    ordenTrabajoQueries.evidenciasList(actividad.id),
  )
  const evidencias = evidenciasQuery.data?.content ?? []

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all",
        actividad.realizado
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-card/70 border-border/80 hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={actividad.realizado}
            disabled={isEnPlanificacion}
            onChange={onToggleRealizado}
            className={cn(
              "size-4 mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer",
              isEnPlanificacion && "opacity-50 cursor-not-allowed",
            )}
            title={
              actividad.realizado
                ? "Marcar como pendiente"
                : "Marcar como realizada"
            }
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {actividad.actividadMantenimiento?.codigo && (
                <code className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-foreground">
                  {actividad.actividadMantenimiento.codigo}
                </code>
              )}
              <span
                className={cn(
                  "text-xs font-semibold text-foreground",
                  actividad.realizado && "line-through text-muted-foreground",
                )}
              >
                {actividad.descripcion}
              </span>
            </div>

            {actividad.observacion && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {actividad.observacion}
              </p>
            )}

            {actividad.fechaRealizacion && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                <span>
                  Realizado: {new Date(actividad.fechaRealizacion).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isEnPlanificacion}
            onClick={onAddEvidencia}
            className={cn(
              "size-6 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md cursor-pointer",
              isEnPlanificacion && "opacity-40 cursor-not-allowed",
            )}
            title="Adjuntar evidencia fotográfica"
          >
            <Camera className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onEdit}
            className="size-6 text-muted-foreground hover:text-foreground rounded-md"
            title="Editar tarea"
          >
            <Edit2 className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onDelete}
            className="size-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md"
            title="Eliminar tarea"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Evidencias de la Actividad */}
      {evidencias.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Camera className="size-3" />
              <span>Evidencias ({evidencias.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {evidencias.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-1.5 rounded-lg border bg-background/80 p-1.5 text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <ImageIcon className="size-3.5 text-amber-500 shrink-0" />
                  <span className="truncate font-medium text-foreground text-[10px]" title={ev.nombreArchivo}>
                    {ev.nombreArchivo}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Ver evidencia"
                    >
                      <Eye className="size-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onReplaceEvidencia(ev)}
                    className="size-5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Reemplazar archivo"
                  >
                    <RefreshCw className="size-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEvidencia(ev.id)}
                    className="size-5 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive/70 hover:text-destructive cursor-pointer"
                    title="Eliminar evidencia"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
