import type { OrdenTrabajo } from "../api/orden-trabajo.service"
import { OrdenTrabajoListItem } from "./OrdenTrabajoListItem"

type OrdenTrabajoListViewProps = {
  ordenesTrabajo: OrdenTrabajo[]
  onQuickView: (ot: OrdenTrabajo) => void
  onEdit: (ot: OrdenTrabajo) => void
  onDelete: (id: string) => void
}

export function OrdenTrabajoListView({
  ordenesTrabajo,
  onQuickView,
  onEdit,
  onDelete,
}: OrdenTrabajoListViewProps) {
  return (
    <div className="space-y-2">
      {ordenesTrabajo.map((ot) => (
        <OrdenTrabajoListItem
          key={ot.id}
          ordenTrabajo={ot}
          onQuickView={onQuickView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
