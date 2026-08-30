import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Calendar,
  Clock,
  Paperclip,
  Wrench,
} from "lucide-react"

import {
  WorkflowListItem,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import { solicitudQueries } from "../../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import { getTipoMantenimientoBadgeClass } from "../../lib/solicitud.utils"

export type SolicitudAprobacionListItemProps = {
  solicitud: SolicitudMantenimiento
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onActionSelect?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  /**
   * Slot para inyectar botones de acción adicionales a la derecha
   */
  extraActions?: React.ReactNode
}

function getInitials(name?: string | null): string {
  if (!name) return "US"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function SolicitudAprobacionListItem({
  solicitud,
  onQuickView,
  onActionSelect,
  extraActions,
}: SolicitudAprobacionListItemProps) {
  // Query Camunda BPMN workflow actions to display direct buttons
  const actionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitud.processInstanceId),
    enabled: Boolean(solicitud.processInstanceId && onActionSelect),
  })

  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

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
      badges={
        <>
          {/* Tipo Mantenimiento */}
          {solicitud.tipoMantenimiento && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${getTipoMantenimientoBadgeClass(
                solicitud.tipoMantenimiento.nombre,
                false,
              )}`}
            >
              <Wrench className="size-2.5" />
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          )}

          {/* Tipo de Falla / Síntomas */}
          {solicitud.tipoFallas && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-[220px]">
              <AlertTriangle className="size-2.5 shrink-0" />
              <span className="truncate">{solicitud.tipoFallas}</span>
            </span>
          )}
        </>
      }
      extraContent={
        <>
          {solicitud.activo && (
            <div className="flex items-center gap-1.5 truncate max-w-[280px]">
              <Box className="size-3 text-primary shrink-0 opacity-80" />
              <span className="font-mono font-bold text-primary text-[11px]">
                {solicitud.activo.codigo}
              </span>
              <span className="truncate text-foreground font-medium">
                {solicitud.activo.nombre}
              </span>
            </div>
          )}

          {solicitud.solicitante && (
            <div className="flex items-center gap-1.5 truncate">
              <div className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[8.5px] shrink-0 border border-primary/20">
                {getInitials(solicitud.solicitante.nombre)}
              </div>
              <span className="truncate">
                Solicitante:{" "}
                <strong className="text-foreground font-medium">
                  {solicitud.solicitante.nombre}
                </strong>
              </span>
            </div>
          )}

          {solicitud.fechaSolicitud && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3 opacity-70" />
              <span>{formatDateTime(solicitud.fechaSolicitud)}</span>
            </div>
          )}

          {solicitud.fechaEstimadaOt && (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium shrink-0">
              <Clock className="size-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong>
              </span>
            </div>
          )}

          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/15 text-[10.5px]">
              <Paperclip className="size-2.5" />
              <span>
                {adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}
              </span>
            </div>
          )}
        </>
      }
      extraActions={extraActions}
      showWorkflowTrigger={Boolean(solicitud.processInstanceId)}
      actions={actionsQuery.data?.actions}
      taskName={actionsQuery.data?.taskName}
      fields={actionsQuery.data?.fields}
      isWorkflowLoading={actionsQuery.isLoading}
      onActionSelect={(action, taskName, fields) => {
        onActionSelect?.(solicitud, action, taskName, fields)
      }}
      onQuickView={() => onQuickView(solicitud)}
    />
  )
}
