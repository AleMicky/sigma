import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import { SolicitudAprobacionListItem } from "./SolicitudAprobacionListItem"

type SolicitudAprobacionListViewProps = {
  solicitudes: SolicitudMantenimiento[]
  onQuickView: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudAprobacionListView({
  solicitudes,
  onQuickView,
}: SolicitudAprobacionListViewProps) {
  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <ul className="divide-y divide-border/50">
        {solicitudes.map((solicitud) => (
          <SolicitudAprobacionListItem
            key={solicitud.id}
            solicitud={solicitud}
            onQuickView={onQuickView}
          />
        ))}
      </ul>
    </div>
  )
}
