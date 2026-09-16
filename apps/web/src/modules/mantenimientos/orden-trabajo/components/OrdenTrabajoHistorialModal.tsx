import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Plus,
  Trash2,
  User,
  Wrench,
} from "lucide-react"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import {
  useDeleteOrdenTrabajo,
  useDeleteOrdenTrabajoActividad,
  useToggleOrdenTrabajoActividadRealizado,
} from "../api/orden-trabajo.mutations"
import { ordenTrabajoKeys } from "../api/orden-trabajo.keys"
import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
import type {
  OrdenTrabajo,
  OrdenTrabajoActividad,
} from "../api/orden-trabajo.service"
import { OrdenTrabajoActividadDialog } from "./OrdenTrabajoActividadDialog"
import { OrdenTrabajoDetailModal } from "./OrdenTrabajoDetailModal"
import { OrdenTrabajoEvidenciaDialog } from "./OrdenTrabajoEvidenciaDialog"
import { OrdenTrabajoFormDialog } from "./OrdenTrabajoFormDialog"

export type OrdenTrabajoHistorialModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitudId?: string | null
  solicitudNumero?: string | null
  solicitudActivoId?: string | null
  onSelectOT?: (ot: OrdenTrabajo) => void
}

function OTItemCard({
  ot,
  onSelectOT,
  onEditOT,
  onDeleteOT,
  onEditActividad,
  onDeleteActividad,
  onAddActividad,
  onToggleRealizado,
  onOpenEvidencia,
}: {
  ot: OrdenTrabajo
  onSelectOT?: (ot: OrdenTrabajo) => void
  onEditOT: (ot: OrdenTrabajo) => void
  onDeleteOT: (ot: OrdenTrabajo) => void
  onEditActividad: (ordenTrabajoId: string, actividad: OrdenTrabajoActividad) => void
  onDeleteActividad: (ordenTrabajoId: string, actividad: OrdenTrabajoActividad) => void
  onAddActividad: (ordenTrabajoId: string) => void
  onToggleRealizado: (ordenTrabajoId: string, act: OrdenTrabajoActividad) => void
  onOpenEvidencia: (act: OrdenTrabajoActividad) => void
}) {
  const [expanded, setExpanded] = useState(true)

  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(ot.id),
    enabled: expanded,
  })

  const actividades = actividadesQuery.data?.content ?? []
  const totalActividades = actividades.length
  const completadas = actividades.filter((a) => a.realizado).length
  const porcentaje =
    totalActividades > 0
      ? Math.round((completadas / totalActividades) * 100)
      : 0

  return (
    <div className="rounded-xl border bg-card shadow-2xs overflow-hidden transition-all hover:border-border">
      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 font-bold text-xs shadow-xs">
            <Wrench className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {ot.numero || "OT"}
              </span>
              <span className="font-heading text-sm font-bold text-foreground">
                Orden de Trabajo
              </span>
              {ot.activo && (
                <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground">
                  {ot.activo.codigo ? `${ot.activo.codigo} - ` : ""}{ot.activo.nombre}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {ot.responsable && (
                <span className="flex items-center gap-1">
                  <User className="size-3 text-muted-foreground" />
                  Técnico: <strong className="text-foreground font-medium">{ot.responsable.nombre}</strong>
                </span>
              )}
              {ot.fechaInicio && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  {formatDate(ot.fechaInicio)}
                </span>
              )}
              {ot.fechaFin && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  Fin: {formatDate(ot.fechaFin)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap justify-end">
          {/* Botón Ver Detalle */}
          {onSelectOT && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onSelectOT(ot)}
              className="h-7 text-xs font-semibold gap-1 bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/20 cursor-pointer"
            >
              <Eye className="size-3.5" />
              <span>Ver Detalle</span>
            </Button>
          )}

          {/* Botón Editar OT */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEditOT(ot)}
            className="h-7 text-xs font-semibold gap-1 hover:bg-muted cursor-pointer"
            title="Editar Orden de Trabajo"
          >
            <Edit2 className="size-3 text-muted-foreground" />
            <span>Editar OT</span>
          </Button>

          {/* Botón Eliminar OT */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onDeleteOT(ot)}
            className="h-7 text-xs font-semibold gap-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Eliminar Orden de Trabajo"
          >
            <Trash2 className="size-3 text-destructive" />
            <span>Eliminar</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((prev) => !prev)}
            className="h-7 text-xs font-semibold gap-1 cursor-pointer"
          >
            <span>{expanded ? "Ocultar tareas" : "Ver tareas"}</span>
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {ot.diagnostico && (
        <div className="px-3.5 pb-2.5 text-xs text-muted-foreground bg-muted/20 border-t pt-2">
          <strong className="text-foreground font-medium">Diagnóstico:</strong> {ot.diagnostico}
        </div>
      )}

      {/* Tareas Desplegables */}
      {expanded && (
        <div className="border-t bg-muted/40 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Actividades Planificadas
            </h4>

            <div className="flex items-center gap-2">
              {totalActividades > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {completadas}/{totalActividades} ({porcentaje}%)
                </span>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddActividad(ot.id)}
                className="h-6 px-2 text-[11px] font-bold gap-1 bg-background shadow-2xs hover:bg-accent cursor-pointer"
              >
                <Plus className="size-3 text-primary" />
                <span>Agregar Actividad</span>
              </Button>
            </div>
          </div>

          {actividadesQuery.isLoading ? (
            <div className="flex items-center gap-2 py-4 justify-center text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando actividades de la orden...</span>
            </div>
          ) : actividades.length === 0 ? (
            <div className="rounded-lg border border-dashed p-3 text-center bg-card/50">
              <p className="text-xs text-muted-foreground italic">
                No hay actividades registradas en esta orden de trabajo.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onAddActividad(ot.id)}
                className="h-6 text-xs text-primary font-semibold gap-1 mt-1 cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Registrar primera actividad</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5 pt-0.5">
              {actividades.map((act, idx) => (
                <div
                  key={act.id}
                  className="rounded-lg border bg-card p-2 text-xs shadow-2xs flex items-center justify-between gap-2 hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted font-mono text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className={cn("font-medium text-foreground truncate", act.realizado && "line-through text-muted-foreground")}>
                      {act.descripcion}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Botón Check Realizado */}
                    <button
                      type="button"
                      onClick={() => onToggleRealizado(ot.id, act)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer select-none",
                        act.realizado
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-muted text-muted-foreground border-border/80 hover:bg-muted/80",
                      )}
                      title={act.realizado ? "Click para marcar como pendiente" : "Click para marcar como realizada"}
                    >
                      <CheckCircle2 className={cn("size-3", act.realizado ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
                      <span>{act.realizado ? "Realizada" : "Pendiente"}</span>
                    </button>

                    {/* Botón Subir Evidencia */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onOpenEvidencia(act)}
                      className="size-6 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer rounded"
                      title="Subir / Ver evidencias fotográficas"
                    >
                      <Camera className="size-3" />
                    </Button>

                    {/* Botón Editar Actividad */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onEditActividad(ot.id, act)}
                      className="size-6 text-muted-foreground hover:text-foreground cursor-pointer rounded"
                      title="Editar actividad"
                    >
                      <Edit2 className="size-3" />
                    </Button>

                    {/* Botón Eliminar Actividad */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteActividad(ot.id, act)}
                      className="size-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function OrdenTrabajoHistorialModal({
  open,
  onOpenChange,
  solicitudId,
  solicitudNumero,
  solicitudActivoId,
  onSelectOT,
}: OrdenTrabajoHistorialModalProps) {
  const queryClient = useQueryClient()
  const toggleActividadMutation = useToggleOrdenTrabajoActividadRealizado()
  const deleteOTMutation = useDeleteOrdenTrabajo()
  const deleteActividadMutation = useDeleteOrdenTrabajoActividad()

  // Estado para creación y edición de Orden de Trabajo
  const [formOTDialog, setFormOTDialog] = useState<{
    open: boolean
    ordenTrabajo: OrdenTrabajo | null
  }>({ open: false, ordenTrabajo: null })

  // Estado para visualización de detalle de Orden de Trabajo
  const [detailOT, setDetailOT] = useState<OrdenTrabajo | null>(null)

  // Estado para eliminación de OT
  const [otToDelete, setOtToDelete] = useState<OrdenTrabajo | null>(null)

  // Estado para agregar / editar Actividad
  const [actividadDialog, setActividadDialog] = useState<{
    open: boolean
    ordenTrabajoId: string
    actividad?: OrdenTrabajoActividad | null
  }>({ open: false, ordenTrabajoId: "" })

  // Estado para eliminación de Actividad
  const [actividadToDelete, setActividadToDelete] = useState<{
    ordenTrabajoId: string
    actividad: OrdenTrabajoActividad
  } | null>(null)

  // Estado para Evidencias
  const [evidenciaDialog, setEvidenciaDialog] = useState<{
    open: boolean
    actividadId: string
    actividadNombre: string
  }>({ open: false, actividadId: "", actividadNombre: "" })

  const otsQuery = useQuery({
    ...ordenTrabajoQueries.list({
      solicitudMantenimientoId: solicitudId ?? undefined,
      size: 50,
      sortBy: "createdAt",
      direction: "DESC",
    }),
    enabled: open && Boolean(solicitudId),
  })

  const rawOrdenes = otsQuery.data?.content ?? []
  const ordenes = useMemo(() => {
    if (!solicitudId) return rawOrdenes
    return rawOrdenes.filter(
      (ot) =>
        !ot.solicitudMantenimientoId ||
        ot.solicitudMantenimientoId.toLowerCase() === solicitudId.toLowerCase(),
    )
  }, [rawOrdenes, solicitudId])

  function handleOpenCreateOT() {
    setFormOTDialog({
      open: true,
      ordenTrabajo: null,
    })
  }

  function handleOpenEditOT(ot: OrdenTrabajo) {
    setFormOTDialog({
      open: true,
      ordenTrabajo: ot,
    })
  }

  function handleOpenDeleteOT(ot: OrdenTrabajo) {
    setOtToDelete(ot)
  }

  async function handleConfirmDeleteOT() {
    if (!otToDelete) return
    await deleteOTMutation.mutateAsync(otToDelete.id)
    setOtToDelete(null)
    otsQuery.refetch()
    queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
  }

  function handleOpenEditActividad(
    ordenTrabajoId: string,
    actividad: OrdenTrabajoActividad,
  ) {
    setActividadDialog({
      open: true,
      ordenTrabajoId,
      actividad,
    })
  }

  function handleOpenDeleteActividad(
    ordenTrabajoId: string,
    actividad: OrdenTrabajoActividad,
  ) {
    setActividadToDelete({
      ordenTrabajoId,
      actividad,
    })
  }

  async function handleConfirmDeleteActividad() {
    if (!actividadToDelete) return
    await deleteActividadMutation.mutateAsync({
      ordenTrabajoId: actividadToDelete.ordenTrabajoId,
      actividadId: actividadToDelete.actividad.id,
    })
    const otId = actividadToDelete.ordenTrabajoId
    setActividadToDelete(null)
    otsQuery.refetch()
    queryClient.invalidateQueries({
      queryKey: ordenTrabajoKeys.actividadesByOT(otId),
    })
  }

  function handleOpenAddActividad(ordenTrabajoId: string) {
    setActividadDialog({
      open: true,
      ordenTrabajoId,
      actividad: null,
    })
  }

  function handleOpenEvidencia(act: OrdenTrabajoActividad) {
    setEvidenciaDialog({
      open: true,
      actividadId: act.id,
      actividadNombre: act.descripcion,
    })
  }

  function handleToggleRealizado(
    ordenTrabajoId: string,
    act: OrdenTrabajoActividad,
  ) {
    toggleActividadMutation.mutate(
      {
        id: act.id,
        payload: {
          ordenTrabajoId,
          actividadMantenimientoId: act.actividadMantenimiento?.id || null,
          descripcion: act.descripcion,
          realizado: !act.realizado,
          observacion: act.observacion || null,
          fechaRealizacion: !act.realizado
            ? new Date().toISOString().slice(0, 19)
            : null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ordenTrabajoKeys.actividadesByOT(ordenTrabajoId),
          })
          otsQuery.refetch()
        },
      },
    )
  }

  function handleOTSaved() {
    otsQuery.refetch()
    queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
  }

  function handleActividadUpdated() {
    otsQuery.refetch()
    queryClient.invalidateQueries({
      queryKey: ordenTrabajoKeys.actividadesAll,
    })
    if (actividadDialog.ordenTrabajoId) {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesByOT(
          actividadDialog.ordenTrabajoId,
        ),
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl sm:max-w-4xl md:max-w-5xl lg:max-w-5xl max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                  <Wrench className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    Órdenes de Trabajo Registradas
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Órdenes técnicas vinculadas a la solicitud de mantenimiento{" "}
                    <strong className="text-foreground font-mono">
                      {solicitudNumero || "N/A"}
                    </strong>
                  </DialogDescription>
                </div>
              </div>

              {solicitudId && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenCreateOT}
                    className="h-8 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-xs cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Registrar OT</span>
                  </Button>

                  <Link
                    to="/mantenimientos/ordenes-trabajo/nuevo"
                    search={{ solicitudId }}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                      title="Abrir formulario completo en página dedicada"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Formulario Completo</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-0">
            {otsQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <Loader2 className="size-6 animate-spin text-sky-600" />
                <p className="text-xs">Cargando órdenes de trabajo...</p>
              </div>
            ) : ordenes.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center space-y-3 bg-muted/10">
                <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mx-auto">
                  <Wrench className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    No hay órdenes de trabajo registradas
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    Aún no se ha generado ninguna orden de trabajo técnica para esta solicitud.
                  </p>
                </div>
                {solicitudId && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenCreateOT}
                    className="h-8 text-xs font-bold gap-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg mt-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Crear Orden de Trabajo Ahora</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {ordenes.map((ot) => (
                  <OTItemCard
                    key={ot.id}
                    ot={ot}
                    onSelectOT={(selected) => {
                      if (onSelectOT) {
                        onOpenChange(false)
                        onSelectOT(selected)
                      } else {
                        setDetailOT(selected)
                      }
                    }}
                    onEditOT={handleOpenEditOT}
                    onDeleteOT={handleOpenDeleteOT}
                    onEditActividad={handleOpenEditActividad}
                    onDeleteActividad={handleOpenDeleteActividad}
                    onAddActividad={handleOpenAddActividad}
                    onToggleRealizado={handleToggleRealizado}
                    onOpenEvidencia={handleOpenEvidencia}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Creación / Edición de Orden de Trabajo */}
      <OrdenTrabajoFormDialog
        open={formOTDialog.open}
        onOpenChange={(isOpen) =>
          setFormOTDialog((prev) => ({ ...prev, open: isOpen }))
        }
        ordenTrabajo={formOTDialog.ordenTrabajo}
        initialSolicitudId={solicitudId ?? undefined}
        initialActivoId={solicitudActivoId ?? undefined}
        onSuccess={() => {
          handleOTSaved()
          setFormOTDialog({ open: false, ordenTrabajo: null })
        }}
      />

      {/* Modal Detalle Completo de Orden de Trabajo */}
      {detailOT && (
        <OrdenTrabajoDetailModal
          open={Boolean(detailOT)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDetailOT(null)
          }}
          ordenTrabajo={detailOT}
          solicitudId={solicitudId}
          solicitudNumero={solicitudNumero}
        />
      )}

      {/* Modal Creación / Edición de Actividad */}
      <OrdenTrabajoActividadDialog
        open={actividadDialog.open}
        onOpenChange={(isOpen) =>
          setActividadDialog((prev) => ({ ...prev, open: isOpen }))
        }
        ordenTrabajoId={actividadDialog.ordenTrabajoId}
        actividad={actividadDialog.actividad}
        onSuccess={handleActividadUpdated}
      />

      {/* Modal Subida / Gestión de Evidencias */}
      <OrdenTrabajoEvidenciaDialog
        open={evidenciaDialog.open}
        onOpenChange={(isOpen) =>
          setEvidenciaDialog((prev) => ({ ...prev, open: isOpen }))
        }
        actividadId={evidenciaDialog.actividadId}
        actividadNombre={evidenciaDialog.actividadNombre}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ordenTrabajoKeys.actividadesAll,
          })
          queryClient.invalidateQueries({
            queryKey: ordenTrabajoKeys.evidenciasAll(),
          })
        }}
      />

      {/* Confirmación de Eliminación de OT */}
      <ConfirmDeleteDialog
        open={Boolean(otToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOtToDelete(null)
        }}
        title="Eliminar Orden de Trabajo"
        description={`¿Estás seguro de que deseas eliminar la Orden de Trabajo "${otToDelete?.numero || ""}"? Esta acción eliminará permanentemente sus actividades y adjuntos asociados.`}
        isPending={deleteOTMutation.isPending}
        onConfirm={handleConfirmDeleteOT}
      />

      {/* Confirmación de Eliminación de Actividad */}
      <ConfirmDeleteDialog
        open={Boolean(actividadToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setActividadToDelete(null)
        }}
        title="Eliminar Actividad"
        description={`¿Estás seguro de que deseas eliminar la actividad "${actividadToDelete?.actividad.descripcion || ""}"?`}
        isPending={deleteActividadMutation.isPending}
        onConfirm={handleConfirmDeleteActividad}
      />
    </>
  )
}
