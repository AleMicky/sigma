import { Building } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteArea } from "../api/area.mutations"
import type { Area } from "../api/area.service"

type AreaListItemProps = {
  area: Area
  onEdit: (area: Area) => void
  onDelete: (area: Area) => void
}

export function AreaListItem({
  area,
  onEdit,
  onDelete,
}: AreaListItemProps) {
  const deleteMutation = useDeleteArea()

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40">
      {/* Información del Área */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(area)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {area.nombre}
            </button>
            <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {area.codigo}
            </code>
          </div>

          {area.descripcion ? (
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {area.descripcion}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground/40 italic hidden lg:inline">
              Sin descripción
            </span>
          )}
        </div>
      </div>

      {/* Auditoría y Acciones */}
      <div className="flex shrink-0 items-center gap-3">
        <AuditInfo
          data={area}
          compact
          className="hidden sm:inline-block max-w-[200px] text-right"
        />

        <RowActions
          className="shrink-0"
          editLabel="Editar área"
          deleteLabel="Eliminar área"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(area)}
          onDelete={() => onDelete(area)}
        />
      </div>
    </li>
  )
}
