import { Award, ChevronRight } from "lucide-react"

import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
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
        "group relative flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 sm:p-3.5 transition-all shadow-2xs",
        isSelected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20 dark:bg-primary/10"
          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors shadow-2xs mt-0.5",
            isSelected
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          <Award className="size-4" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "truncate text-xs font-semibold sm:text-sm",
                isSelected ? "text-primary font-bold" : "text-foreground",
              )}
            >
              {responsabilidad.nombre}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px] px-1.5 py-0 font-normal",
                isSelected
                  ? "border-primary/30 text-primary bg-primary/5"
                  : "text-muted-foreground bg-muted/60",
              )}
            >
              {responsabilidad.codigo}
            </Badge>
          </div>

          {responsabilidad.descripcion ? (
            <p className="line-clamp-1 text-[11px] text-muted-foreground mt-0.5">
              {responsabilidad.descripcion}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0 pt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <RowActions
          editLabel="Editar responsabilidad"
          deleteLabel="Eliminar responsabilidad"
          onEdit={() => onEdit(responsabilidad)}
          onDelete={() => onDelete(responsabilidad)}
        />
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5",
            isSelected && "text-primary translate-x-0.5 opacity-100",
          )}
        />
      </div>
    </li>
  )
}
