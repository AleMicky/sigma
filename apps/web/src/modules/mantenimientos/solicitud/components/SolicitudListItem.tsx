import { Calendar, User, Wrench } from "lucide-react"

import {
  WorkflowListItem,
  useWorkflowActions,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

export type SolicitudListItemProps = {
  solicitud: SolicitudMantenimiento
  onSelect?: (solicitud: SolicitudMantenimiento) => void
  onTraceability?: (solicitud: SolicitudMantenimiento) => void
  onActionSelect?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  className?: string
}

export function SolicitudListItem({
  solicitud,
  onSelect,
  onTraceability,
  onActionSelect,
  className,
}: SolicitudListItemProps) {
  const prioridadNivel = solicitud.prioridad?.nivel ?? 1
  const isCritical = prioridadNivel >= 4

  const { actions, taskName, fields, isLoading: isWorkflowLoading } = useWorkflowActions(
    solicitud.processInstanceId,
    { enabled: Boolean(solicitud.processInstanceId) },
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
      actions={actions}
      taskName={taskName}
      fields={fields}
      isWorkflowLoading={isWorkflowLoading}
      onActionSelect={
        onActionSelect
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
        solicitud.tipoMantenimiento?.nombre ? (
          <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground font-medium border border-border/60">
            {solicitud.tipoMantenimiento.nombre}
          </span>
        ) : null
      }
      onQuickView={onSelect ? () => onSelect(solicitud) : undefined}
      onTraceability={onTraceability ? () => onTraceability(solicitud) : undefined}
      showWorkflowTrigger={Boolean(solicitud.processInstanceId)}
      className={className}
    />
  )
}
