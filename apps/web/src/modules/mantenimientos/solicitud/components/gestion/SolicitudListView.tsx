import type { WorkflowAction, WorkflowField } from "@/modules/workflow"
import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import { SolicitudListItem } from "./SolicitudListItem"

type SolicitudListViewProps = {
  solicitudes: SolicitudMantenimiento[]
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onDelete: (solicitud: SolicitudMantenimiento) => void
  onEnviar?: (solicitud: SolicitudMantenimiento) => void
  onWorkflowAction?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}

export function SolicitudListView({
  solicitudes,
  onEdit,
  onQuickView,
  onDelete,
  onEnviar,
  onWorkflowAction,
}: SolicitudListViewProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <ul className="divide-y divide-border/40">
        {solicitudes.map((solicitud) => (
          <SolicitudListItem
            key={solicitud.id}
            solicitud={solicitud}
            onEdit={onEdit}
            onQuickView={onQuickView}
            onDelete={onDelete}
            onEnviar={onEnviar}
            onWorkflowAction={onWorkflowAction}
          />
        ))}
      </ul>
    </div>
  )
}
