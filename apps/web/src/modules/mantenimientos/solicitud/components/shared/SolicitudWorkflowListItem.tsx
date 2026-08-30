import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"

import { WorkflowListItem, type WorkflowAction, type WorkflowField } from "@/modules/workflow"
import { solicitudQueries } from "../../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../../api/solicitud.service"

export type SolicitudWorkflowListItemProps = {
  solicitud: SolicitudMantenimiento
  badges?: ReactNode
  extraContent?: ReactNode
  extraActions?: ReactNode
  onQuickView?: () => void
  onActionSelect?: (
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  className?: string
}

export function SolicitudWorkflowListItem({
  solicitud,
  badges,
  extraContent,
  extraActions,
  onQuickView,
  onActionSelect,
  className,
}: SolicitudWorkflowListItemProps) {
  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4

  // Consulta automática y dinámica de las acciones reales del proceso de Camunda
  const { data: wfData, isLoading: isWorkflowLoading } = useQuery({
    ...solicitudQueries.workflowActions(solicitud.processInstanceId),
    enabled: Boolean(solicitud.processInstanceId),
  })

  return (
    <WorkflowListItem
      code={solicitud.numero}
      status={solicitud.estado}
      processInstanceId={solicitud.processInstanceId}
      title={solicitud.titulo}
      description={solicitud.descripcion}
      priority={
        solicitud.prioridad
          ? {
              level: solicitud.prioridad.nivel,
              label: solicitud.prioridad.nombre,
              isCritical: isCritica,
            }
          : undefined
      }
      isCritical={isCritica}
      badges={badges}
      extraContent={extraContent}
      extraActions={extraActions}
      actions={wfData?.actions ?? []}
      taskName={wfData?.taskName}
      fields={wfData?.fields ?? []}
      isWorkflowLoading={isWorkflowLoading}
      onActionSelect={onActionSelect}
      onQuickView={onQuickView}
      className={className}
    />
  )
}
