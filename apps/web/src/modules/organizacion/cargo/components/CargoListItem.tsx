import { Briefcase } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { RowActions } from "@/shared/components/row-actions"

import { useDeleteCargo } from "../api/cargo.mutations"
import type { Cargo } from "../api/cargo.service"

type CargoListItemProps = {
  cargo: Cargo
  onEdit: (cargo: Cargo) => void
  onDelete: (cargo: Cargo) => void
}

export function CargoListItem({
  cargo,
  onEdit,
  onDelete,
}: CargoListItemProps) {
  const deleteMutation = useDeleteCargo()

  return (
    <li className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40">
      {/* Información del Cargo */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => onEdit(cargo)}
              className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {cargo.nombre}
            </button>
            <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {cargo.codigo}
            </code>
          </div>

          {cargo.descripcion ? (
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {cargo.descripcion}
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
          data={cargo}
          compact
          className="hidden sm:inline-block max-w-[200px] text-right"
        />

        <RowActions
          className="shrink-0"
          editLabel="Editar cargo"
          deleteLabel="Eliminar cargo"
          deleteDisabled={deleteMutation.isPending}
          onEdit={() => onEdit(cargo)}
          onDelete={() => onDelete(cargo)}
        />
      </div>
    </li>
  )
}
