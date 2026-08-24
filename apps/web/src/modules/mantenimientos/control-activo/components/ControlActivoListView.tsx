import type { ControlActivo } from "../api/control-activo.service"
import { ControlActivoListItem } from "./ControlActivoListItem"

type ControlActivoListViewProps = {
  controles: ControlActivo[]
  onDelete: (id: string) => void
}

export function ControlActivoListView({
  controles,
  onDelete,
}: ControlActivoListViewProps) {
  return (
    <div className="space-y-2">
      {controles.map((ctrl) => (
        <ControlActivoListItem
          key={ctrl.id}
          control={ctrl}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
