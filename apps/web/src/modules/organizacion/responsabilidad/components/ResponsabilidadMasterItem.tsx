import { Award, ChevronRight } from "lucide-react"

import { RowActions } from "@/shared/components/row-actions"
import { cn } from "@/shared/lib/utils"

import type { Responsabilidad } from "../api/responsabilidad.service"

type ResponsabilidadMasterItemProps = {
  responsabilidad: Responsabilidad
  isSelected: boolean
  onSelect: (responsabilidad: Responsabilidad) => void
  onEdit: (responsabilidad: Responsabilidad) => void
  onDelete: (responsabilidad: Responsabilidad) => void
}

export function ResponsabilidadMasterItem({
  responsabilidad,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ResponsabilidadMasterItemProps) {
  return (
    <li
      onClick={() => onSelect(responsabilidad)}
      className={cn(
        "group relative flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 transition-all shadow-2xs",
        isSelected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20 dark:bg-primary/10"
          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          <Award className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-xs font-semibold sm:text-sm",
                isSelected ? "text-primary font-bold" : "text-foreground",
              )}
            >
              {responsabilidad.nombre}
            </span>
          </div>

          <code className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {responsabilidad.codigo}
          </code>

          {responsabilidad.descripcion ? (
            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
              {responsabilidad.descripcion}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <RowActions
          editLabel="Editar responsabilidad"
          deleteLabel="Eliminar responsabilidad"
          onEdit={() => onEdit(responsabilidad)}
          onDelete={() => onDelete(responsabilidad)}
        />
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5",
            isSelected && "text-primary translate-x-0.5",
          )}
        />
      </div>
    </li>
  )
}
