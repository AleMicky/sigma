import type { OrdenTrabajo } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.service"
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
  onCreateOT?: (solicitud: SolicitudMantenimiento) => void
  showControlActivo?: boolean
  onViewControlActivo?: (solicitud: SolicitudMantenimiento) => void
  onViewOT?: (solicitud: SolicitudMantenimiento, ot?: OrdenTrabajo | null) => void
}

export function SolicitudAprobacionListView({
  solicitudes,
  onQuickView,
  onActionSelect,
  onCreateOT,
  showControlActivo,
  onViewControlActivo,
  onViewOT,
}: SolicitudAprobacionListViewProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <ul className="divide-y divide-border/50">
        {solicitudes.map((solicitud) => (
          <SolicitudAprobacionListItem
            key={solicitud.id}
            solicitud={solicitud}
            onQuickView={onQuickView}
            onActionSelect={onActionSelect}
            onCreateOT={onCreateOT}
            showControlActivo={showControlActivo}
            onViewControlActivo={onViewControlActivo}
            onViewOT={onViewOT}
          />
        ))}
      </ul>
    </div>
  )
}
