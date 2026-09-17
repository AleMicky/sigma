import { useMemo } from "react"
import {
  AlertTriangle,
  Calendar,
  ClipboardCheck,
  Eye,
  HardHat,
  Paperclip,
  Pencil,
  Tag,
  Trash2,
  User,
  Wrench,
} from "lucide-react"

import {
  WorkflowListItem,
  useWorkflowActions,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { Button } from "@/shared/components/ui/button"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

export type SolicitudListItemProps = {
  solicitud: SolicitudMantenimiento
  onViewDetail?: (solicitud: SolicitudMantenimiento) => void
  onSelect?: (solicitud: SolicitudMantenimiento) => void
  onEdit?: (solicitud: SolicitudMantenimiento) => void
  onDelete?: (solicitud: SolicitudMantenimiento) => void
  onTraceability?: (solicitud: SolicitudMantenimiento) => void
  onRegistrarControlActivo?: (solicitud: SolicitudMantenimiento) => void
  onGestionarOrdenTrabajo?: (solicitud: SolicitudMantenimiento) => void
  onActionSelect?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  onlyWorkflowActionsOnBorrador?: boolean
  showWorkflowActions?: boolean
  className?: string
}

export function SolicitudListItem({
  solicitud,
  onViewDetail,
  onSelect,
  onEdit,
  onDelete,
  onTraceability,
  onRegistrarControlActivo,
  onGestionarOrdenTrabajo,
  onActionSelect,
  onlyWorkflowActionsOnBorrador = false,
  showWorkflowActions,
  className,
}: SolicitudListItemProps) {
  const prioridadNivel = solicitud.prioridad?.nivel ?? 1
  const isCritical = prioridadNivel >= 4

  const estadoNorm = (solicitud.estado ?? "").trim().toLowerCase()
  const isBorrador = estadoNorm === "borrador"
  const isTrabajoRealizado =
    estadoNorm === "trabajo_realizado" ||
    estadoNorm === "trabajo realizado" ||
    estadoNorm === "trabajo-realizado"
  const isObservado = estadoNorm === "observado"

  const shouldShowWorkflowActions =
    showWorkflowActions !== undefined
      ? showWorkflowActions
      : onlyWorkflowActionsOnBorrador
        ? isBorrador || isTrabajoRealizado || isObservado
        : true

  const { actions, taskName, fields, isLoading: isWorkflowLoading } = useWorkflowActions(
    solicitud.processInstanceId,
    { enabled: Boolean(solicitud.processInstanceId && shouldShowWorkflowActions) },
  )

  const solicitanteNombre =
    solicitud.solicitante?.nombreCompleto ||
    solicitud.solicitante?.nombre ||
    ""

  const responsableNombre =
    solicitud.responsable?.nombreCompleto ||
    solicitud.responsable?.nombre ||
    ""

  const formattedDate = useMemo(() => {
    if (!solicitud.fechaSolicitud) return null
    try {
      const d = new Date(solicitud.fechaSolicitud)
      if (isNaN(d.getTime())) return null
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d)
    } catch {
      return null
    }
  }, [solicitud.fechaSolicitud])

  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const handleViewDetail = onViewDetail || onSelect

  return (
    <WorkflowListItem
      code={solicitud.numero}
      status={solicitud.estado}
      statusLabel={solicitud.estado ? solicitud.estado.replace(/_/g, " ") : undefined}
      processInstanceId={solicitud.processInstanceId}
      title={solicitud.titulo}
      description={solicitud.descripcion}
      isCritical={isCritical}
      priority={
        solicitud.prioridad
          ? {
              level: prioridadNivel,
              label: solicitud.prioridad.nombre,
              isCritical,
            }
          : undefined
      }
      badges={
        <>
          {solicitud.tipoMantenimiento?.nombre && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 text-[10.5px] font-medium text-foreground/80 border border-border/70 shrink-0 shadow-2xs">
              <Tag className="size-2.5 opacity-60 shrink-0" />
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          )}

          {estadoNorm === "asignado" && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0 shadow-2xs"
              title="Requiere registrar Acta de Entrega y Orden de Trabajo para iniciar"
            >
              <AlertTriangle className="size-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Requiere Entrega y OT</span>
            </span>
          )}

          {adjuntosCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground border border-border/60 shrink-0"
              title={`${adjuntosCount} archivo(s) adjunto(s)`}
            >
              <Paperclip className="size-2.5 opacity-70 shrink-0" />
              <span>{adjuntosCount}</span>
            </span>
          )}
        </>
      }
      actions={shouldShowWorkflowActions ? actions : []}
      taskName={shouldShowWorkflowActions ? taskName : null}
      fields={shouldShowWorkflowActions ? fields : []}
      isWorkflowLoading={shouldShowWorkflowActions ? isWorkflowLoading : false}
      onActionSelect={
        onActionSelect && shouldShowWorkflowActions
          ? (action, tName, flds) => onActionSelect(solicitud, action, tName, flds)
          : undefined
      }
      extraContent={
        <>
          {solicitud.activo && (
            <span
              className="inline-flex items-center gap-1.5 font-medium text-foreground/90 max-w-xs truncate"
              title={`Activo: ${solicitud.activo.codigo} - ${solicitud.activo.nombre}`}
            >
              <Wrench className="size-3 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground/95">{solicitud.activo.codigo}</span>
              <span className="text-muted-foreground">·</span>
              <span className="truncate">{solicitud.activo.nombre}</span>
            </span>
          )}

          {solicitanteNombre && (
            <span
              className="inline-flex items-center gap-1 text-muted-foreground"
              title={`Solicitado por: ${solicitanteNombre}${solicitud.solicitante?.cargo ? ` (${solicitud.solicitante.cargo})` : ""}`}
            >
              <User className="size-3 text-muted-foreground shrink-0" />
              <span className="truncate">{solicitanteNombre}</span>
            </span>
          )}

          {responsableNombre && (
            <span
              className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 font-medium"
              title={`Responsable técnico: ${responsableNombre}`}
            >
              <HardHat className="size-3 text-sky-500 shrink-0" />
              <span className="truncate">{responsableNombre}</span>
            </span>
          )}

          {formattedDate && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3 text-muted-foreground shrink-0" />
              <span>{formattedDate}</span>
            </span>
          )}
        </>
      }
      extraActions={
        <>
          {handleViewDetail && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetail(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/90 hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Ver detalles completos de la solicitud"
            >
              <Eye className="size-3 text-primary shrink-0" />
              <span>Ver Detalle</span>
            </Button>
          )}

          {!isBorrador && onRegistrarControlActivo && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onRegistrarControlActivo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/90 hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-500/30 dark:hover:text-sky-400 text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Registrar o consultar acta de control de activo"
            >
              <ClipboardCheck className="size-3 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Control Activo</span>
            </Button>
          )}

          {!isBorrador && onGestionarOrdenTrabajo && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onGestionarOrdenTrabajo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/90 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 dark:hover:text-amber-400 text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Gestionar o consultar órdenes de trabajo vinculadas"
            >
              <Wrench className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Orden Trabajo</span>
            </Button>
          )}

          {isBorrador && onEdit && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/90 hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Editar borrador de solicitud"
            >
              <Pencil className="size-3 text-muted-foreground shrink-0" />
              <span>Editar</span>
            </Button>
          )}

          {isBorrador && onDelete && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 border-destructive/30 shadow-2xs cursor-pointer transition-all"
              title="Eliminar borrador de solicitud"
            >
              <Trash2 className="size-3 text-destructive shrink-0" />
              <span>Eliminar</span>
            </Button>
          )}
        </>
      }
      onTraceability={onTraceability ? () => onTraceability(solicitud) : undefined}
      showWorkflowTrigger={shouldShowWorkflowActions && Boolean(solicitud.processInstanceId)}
      className={className}
    />
  )
}

export function SolicitudListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/70 p-3 sm:p-4 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-md bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted/80" />
          <div className="h-5 w-16 rounded-md bg-muted/60 hidden sm:inline-block" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6.5 w-20 rounded-md bg-muted/70" />
          <div className="h-6.5 w-16 rounded-md bg-muted/50 hidden xs:inline-block" />
        </div>
      </div>
      <div className="space-y-1.5 my-0.5">
        <div className="h-5 w-3/5 max-w-sm rounded-md bg-muted/90" />
        <div className="h-3.5 w-4/5 max-w-lg rounded-md bg-muted/60" />
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1.5 border-t border-border/40">
        <div className="h-4 w-36 rounded-md bg-muted/50" />
        <div className="h-4 w-28 rounded-md bg-muted/50" />
        <div className="h-4 w-20 rounded-md bg-muted/40 ml-auto" />
      </div>
    </div>
  )
}


