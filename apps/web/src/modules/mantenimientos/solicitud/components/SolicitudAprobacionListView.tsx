import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import { SolicitudAprobacionListItem } from "./SolicitudAprobacionListItem"

type SolicitudAprobacionListViewProps = {
  solicitudes: SolicitudMantenimiento[]
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onActionSelect: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  onEdit?: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudAprobacionListView({
  solicitudes,
  onQuickView,
  onActionSelect,
  onEdit,
}: SolicitudAprobacionListViewProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <ul className="divide-y divide-border/40">
        {solicitudes.map((solicitud) => (
          <SolicitudAprobacionListItem
            key={solicitud.id}
            solicitud={solicitud}
            onQuickView={onQuickView}
            onActionSelect={onActionSelect}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  )
}
