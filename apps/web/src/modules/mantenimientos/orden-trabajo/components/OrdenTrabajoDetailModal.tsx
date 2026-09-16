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
  readOnly?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function OrdenTrabajoDetailModal({
  ordenTrabajo,
  solicitudId,
  solicitudNumero,
  readOnly = false,
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
    readOnly ||
    estadoSolicitudNorm === "FINALIZADO" ||
    estadoSolicitudNorm === "CANCELADO" ||
    estadoSolicitudNorm === "RECHAZADO"

  // Se eliminó el modo planificación para que en estado ASIGNADO se pueda marcar tareas y subir adjuntos
  const isEnPlanificacion = false

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
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-2.5 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-sky-600" />
              <p className="text-xs font-semibold">Cargando orden de trabajo...</p>
            </div>
          ) : !currentOT ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-2.5">
              <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <Wrench className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  Sin Orden de Trabajo
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Esta solicitud no tiene una orden de trabajo asociada aún.
                </p>
              </div>
              {solicitudId && !isReadOnly && (
                <Link
                  to="/mantenimientos/ordenes-trabajo/nuevo"
                  search={{ solicitudId }}
                  onClick={() => onOpenChange(false)}
                >
                  <Button
                    type="button"
                    size="sm"
                    className="h-7.5 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg cursor-pointer mt-1 shadow-xs"
                  >
                    <Plus className="size-3" />
                    <span>Crear Orden de Trabajo</span>
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <DialogHeader className="px-4 py-2.5 sm:px-4.5 sm:py-2.5 border-b shrink-0 bg-muted/20">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      <Wrench className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <DialogTitle className="text-sm sm:text-base font-bold leading-tight">
                          {currentOT.numero || "Orden de Trabajo"}
                        </DialogTitle>
                        {(solicitudNumero || solicitud?.numero) && (
                          <span className="text-[9.5px] font-mono font-bold bg-muted px-1 py-0.5 rounded border border-border">
                            Folio: {solicitudNumero || solicitud?.numero}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9.5px] font-bold px-1.5 py-0 uppercase tracking-wide",
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
                      <DialogDescription className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
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

                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditDialogOpen(true)}
                      className="h-6.5 text-[11px] gap-1 px-2 shrink-0 font-semibold cursor-pointer"
                    >
                      <Edit2 className="size-2.5" />
                      <span>Editar</span>
                    </Button>
                  )}
                </div>

                {/* Progress bar */}
                {totalActividades > 0 && (
                  <div className="mt-2 space-y-0.5">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-muted-foreground">
                        Progreso: <strong>{completadasCount}/{totalActividades} completadas</strong>
                      </span>
                      <span className="font-bold text-[11px] text-foreground">{progressPercent}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
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
                <div className="px-4 pt-1.5 border-b shrink-0 bg-background">
                  <TabsList className="h-7 bg-muted/60 p-0.5 rounded-lg">
                    <TabsTrigger
                      value="actividades"
                      className="text-[11px] px-2.5 h-6 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                      <CheckSquare className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Actividades / Tareas</span>
                      <Badge variant="secondary" className="ml-0.5 text-[9.5px] px-1 py-0 h-3.5">
                        {totalActividades}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="general"
                      className="text-[11px] px-2.5 h-6 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                      <FileText className="size-3 text-sky-600 dark:text-sky-400" />
                      <span>Detalles & Diagnóstico</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="adjuntos"
                      className="text-[11px] px-2.5 h-6 rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                    >
                      <Paperclip className="size-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Adjuntos Generales</span>
                      <Badge variant="secondary" className="ml-0.5 text-[9.5px] px-1 py-0 h-3.5">
                        {adjuntos.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* TAB 1: ACTIVIDADES & TAREAS */}
                <TabsContent
                  value="actividades"
                  className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 m-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tareas de la Orden ({completadasCount}/{totalActividades})
                    </h4>
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setActividadModal({ open: true, actividad: null })
                        }
                        className="h-6.5 text-[11px] font-semibold gap-1 px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>Agregar Tarea</span>
                      </Button>
                    )}
                  </div>

                  {actividades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-xl bg-muted/10">
                      <CheckSquare className="size-6 text-muted-foreground/50 mb-1.5" />
                      <p className="text-xs font-semibold text-foreground">
                        Sin tareas registradas
                      </p>
                      <p className="text-[10.5px] text-muted-foreground max-w-xs mt-0.5">
                        {isReadOnly
                          ? "Esta orden de trabajo no contiene actividades registradas."
                          : "Agrega las tareas técnicas que deben ejecutarse en esta orden de trabajo."}
                      </p>
                      {!isReadOnly && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActividadModal({ open: true, actividad: null })
                          }
                          className="mt-2.5 h-6.5 text-[11px] font-semibold gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          <span>Agregar Primera Tarea</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {actividades.map((act) => (
                        <ActividadItemCard
                          key={act.id}
                          actividad={act}
                          isReadOnly={isReadOnly}
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
                  className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 m-0"
                >
                  {/* Fechas & Activo */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg border p-2 bg-card/60 space-y-0.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Box className="size-2.5 text-sky-500" />
                        <span>Activo</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground truncate" title={`${currentOT.activo?.codigo} - ${currentOT.activo?.nombre}`}>
                        {currentOT.activo?.codigo}
                      </p>
                    </div>

                    <div className="rounded-lg border p-2 bg-card/60 space-y-0.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <User className="size-2.5 text-emerald-500" />
                        <span>Responsable</span>
                      </p>
                      <p className="text-xs font-semibold text-foreground truncate" title={currentOT.responsable?.nombre || ""}>
                        {currentOT.responsable?.nombre || "No asignado"}
                      </p>
                    </div>

                    <div className="rounded-lg border p-2 bg-card/60 space-y-0.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-2.5 text-amber-500" />
                        <span>Inicio</span>
                      </p>
                      <p className="text-xs font-medium text-foreground truncate">
                        {currentOT.fechaInicio
                          ? new Date(currentOT.fechaInicio).toLocaleDateString()
                          : "Pendiente"}
                      </p>
                    </div>

                    <div className="rounded-lg border p-2 bg-card/60 space-y-0.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-2.5 text-blue-500" />
                        <span>Fin</span>
                      </p>
                      <p className="text-xs font-medium text-foreground truncate">
                        {currentOT.fechaFin
                          ? new Date(currentOT.fechaFin).toLocaleDateString()
                          : "En curso"}
                      </p>
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="rounded-lg border p-2.5 bg-card/60 space-y-0.5">
                    <p className="text-[10.5px] font-bold text-foreground flex items-center gap-1">
                      <AlertCircle className="size-3 text-amber-500" />
                      <span>Diagnóstico Técnico</span>
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {currentOT.diagnostico || "Sin diagnóstico especificado."}
                    </p>
                  </div>

                  {/* Trabajo Realizado */}
                  <div className="rounded-lg border p-2.5 bg-card/60 space-y-0.5">
                    <p className="text-[10.5px] font-bold text-foreground flex items-center gap-1">
                      <FileCheck2 className="size-3 text-emerald-500" />
                      <span>Trabajo Realizado / Procedimiento</span>
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {currentOT.trabajoRealizado || "Sin trabajo reportado aún."}
                    </p>
                  </div>

                  {/* Observaciones */}
                  <div className="rounded-lg border p-2.5 bg-card/60 space-y-0.5">
                    <p className="text-[10.5px] font-bold text-foreground flex items-center gap-1">
                      <FileText className="size-3 text-sky-500" />
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
                  className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 m-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Documentos y Archivos ({adjuntos.length})
                    </h4>
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isEnPlanificacion}
                        onClick={() =>
                          setAdjuntoModal({ open: true, adjuntoToReplace: null })
                        }
                        className={cn(
                          "h-6.5 text-[11px] font-semibold gap-1 px-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20 cursor-pointer",
                          isEnPlanificacion && "opacity-50 cursor-not-allowed",
                        )}
                        title="Subir archivo adjunto"
                      >
                        <Plus className="size-3" />
                        <span>Subir Adjunto</span>
                      </Button>
                    )}
                  </div>

                  {adjuntos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-xl bg-muted/10">
                      <Paperclip className="size-6 text-muted-foreground/50 mb-1.5" />
                      <p className="text-xs font-semibold text-foreground">
                        Sin adjuntos registrados
                      </p>
                      <p className="text-[10.5px] text-muted-foreground max-w-xs mt-0.5">
                        {isReadOnly
                          ? "Esta orden de trabajo no contiene adjuntos registrados."
                          : "Puedes adjuntar manuales, informes o garantías en PDF, Word o imágenes."}
                      </p>
                      {!isReadOnly && !isEnPlanificacion && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setAdjuntoModal({ open: true, adjuntoToReplace: null })
                          }
                          className="mt-2.5 h-6.5 text-[11px] font-semibold gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          <span>Subir Primer Adjunto</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {adjuntos.map((adj) => (
                        <div
                          key={adj.id}
                          className="flex items-center justify-between gap-2 rounded-lg border p-2 bg-card/60 hover:bg-muted/30 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                              <FileText className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1 leading-tight">
                              <p
                                className="text-xs font-bold text-foreground truncate"
                                title={adj.nombreArchivo}
                              >
                                {adj.nombreArchivo}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                {adj.descripcion && (
                                  <span className="font-medium text-foreground truncate max-w-[120px]">
                                    {adj.descripcion}
                                  </span>
                                )}
                                {adj.tamanio && (
                                  <span>{(adj.tamanio / 1024).toFixed(0)} KB</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            {adj.url && (
                              <a
                                href={adj.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex size-5.5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Descargar / Ver archivo"
                              >
                                <Eye className="size-3" />
                              </a>
                            )}
                            {!isReadOnly && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAdjuntoModal({
                                      open: true,
                                      adjuntoToReplace: adj,
                                    })
                                  }
                                  className="inline-flex size-5.5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                  title="Reemplazar archivo"
                                >
                                  <RefreshCw className="size-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteAdjuntoMutation.mutate({
                                      ordenTrabajoId: otId,
                                      id: adj.id,
                                    })
                                  }
                                  className="inline-flex size-5.5 items-center justify-center rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="Eliminar archivo"
                                >
                                  <Trash2 className="size-2.5" />
                                </button>
                              </>
                            )}
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
  isReadOnly = false,
  isEnPlanificacion,
  onToggleRealizado,
  onEdit,
  onDelete,
  onAddEvidencia,
  onReplaceEvidencia,
  onDeleteEvidencia,
}: {
  actividad: OrdenTrabajoActividad
  isReadOnly?: boolean
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
        "rounded-xl border p-2.5 transition-all",
        actividad.realizado
          ? "bg-emerald-500/5 border-emerald-500/30"
          : "bg-card/70 border-border/80 hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={actividad.realizado}
            disabled={isReadOnly || isEnPlanificacion}
            onChange={onToggleRealizado}
            className={cn(
              "size-3.5 mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer",
              (isReadOnly || isEnPlanificacion) && "opacity-50 cursor-not-allowed",
            )}
            title={
              isReadOnly
                ? "Modo solo lectura"
                : actividad.realizado
                  ? "Marcar como pendiente"
                  : "Marcar como realizada"
            }
          />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 flex-wrap">
              {actividad.actividadMantenimiento?.codigo && (
                <code className="text-[9.5px] font-mono font-bold bg-muted px-1 py-0.5 rounded text-foreground">
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
              <p className="text-[10.5px] text-muted-foreground mt-0.5">
                {actividad.observacion}
              </p>
            )}

            {actividad.fechaRealizacion && (
              <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="size-2.5" />
                <span>
                  Realizado: {new Date(actividad.fechaRealizacion).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={isEnPlanificacion}
              onClick={onAddEvidencia}
              className={cn(
                "size-5.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md cursor-pointer",
                isEnPlanificacion && "opacity-40 cursor-not-allowed",
              )}
              title="Adjuntar evidencia fotográfica"
            >
              <Camera className="size-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onEdit}
              className="size-5.5 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
              title="Editar tarea"
            >
              <Edit2 className="size-2.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              className="size-5.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
              title="Eliminar tarea"
            >
              <Trash2 className="size-2.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Evidencias de la Actividad */}
      {evidencias.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-border/50">
          <div className="flex items-center justify-between text-[9.5px] font-semibold text-muted-foreground mb-1">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Camera className="size-2.5" />
              <span>Evidencias ({evidencias.length})</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {evidencias.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-1 rounded-md border bg-background/80 p-1 text-[10px]"
              >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <ImageIcon className="size-3 text-amber-500 shrink-0" />
                  <span className="truncate font-medium text-foreground text-[9.5px]" title={ev.nombreArchivo}>
                    {ev.nombreArchivo}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-4.5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Ver evidencia"
                    >
                      <Eye className="size-2.5" />
                    </a>
                  )}
                  {!isReadOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => onReplaceEvidencia(ev)}
                        className="size-4.5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Reemplazar archivo"
                      >
                        <RefreshCw className="size-2" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvidencia(ev.id)}
                        className="size-4.5 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive/70 hover:text-destructive cursor-pointer"
                        title="Eliminar evidencia"
                      >
                        <Trash2 className="size-2" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
