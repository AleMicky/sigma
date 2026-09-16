import { Calendar, Pencil, Trash2, User, Wrench } from "lucide-react"

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
  onSelect?: (solicitud: SolicitudMantenimiento) => void
  onEdit?: (solicitud: SolicitudMantenimiento) => void
  onDelete?: (solicitud: SolicitudMantenimiento) => void
  onTraceability?: (solicitud: SolicitudMantenimiento) => void
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
  onSelect,
  onEdit,
  onDelete,
  onTraceability,
  onActionSelect,
  onlyWorkflowActionsOnBorrador = false,
  showWorkflowActions,
  className,
}: SolicitudListItemProps) {
  const prioridadNivel = solicitud.prioridad?.nivel ?? 1
  const isCritical = prioridadNivel >= 4

  const estadoNorm = (solicitud.estado ?? "").trim().toLowerCase()
  const isBorrador = estadoNorm === "borrador"
  const shouldShowWorkflowActions =
    showWorkflowActions !== undefined
      ? showWorkflowActions
      : onlyWorkflowActionsOnBorrador
        ? isBorrador
        : true

  const { actions, taskName, fields, isLoading: isWorkflowLoading } = useWorkflowActions(
    solicitud.processInstanceId,
    { enabled: Boolean(solicitud.processInstanceId && shouldShowWorkflowActions) },
  )

  const solicitanteNombre =
    solicitud.solicitante?.nombreCompleto ||
    solicitud.solicitante?.nombre ||
    ""

  const formattedDate = solicitud.fechaSolicitud
    ? new Date(solicitud.fechaSolicitud).toLocaleDateString()
    : null

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
            <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
              <Wrench className="size-3 text-muted-foreground shrink-0" />
              <span>
                {solicitud.activo.codigo} - {solicitud.activo.nombre}
              </span>
            </span>
          )}

          {solicitanteNombre && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3 text-muted-foreground shrink-0" />
              <span>{solicitanteNombre}</span>
            </span>
          )}

          {formattedDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3 text-muted-foreground shrink-0" />
              <span>{formattedDate}</span>
            </span>
          )}
        </>
      }
      extraActions={
        <>
          {solicitud.tipoMantenimiento?.nombre && (
            <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground font-medium border border-border/60">
              {solicitud.tipoMantenimiento.nombre}
            </span>
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
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/80 hover:bg-muted/80 text-foreground border-border/80 shadow-2xs cursor-pointer"
              title="Editar solicitud"
            >
              <Pencil className="size-3 text-muted-foreground" />
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
              className="h-6.5 gap-1 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 shadow-2xs cursor-pointer"
              title="Eliminar solicitud"
            >
              <Trash2 className="size-3 text-destructive" />
              <span>Eliminar</span>
            </Button>
          )}
        </>
      }
      onQuickView={onSelect ? () => onSelect(solicitud) : undefined}
      onTraceability={onTraceability ? () => onTraceability(solicitud) : undefined}
      showWorkflowTrigger={shouldShowWorkflowActions && Boolean(solicitud.processInstanceId)}
      className={className}
    />
  )
}
