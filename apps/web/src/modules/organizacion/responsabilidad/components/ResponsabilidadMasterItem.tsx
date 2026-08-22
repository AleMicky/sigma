import { Award, ChevronRight, Layers } from "lucide-react"

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
        "group relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-2.5 sm:p-3 transition-all shadow-2xs",
        isSelected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20 dark:bg-primary/10"
          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Avatar / Thumbnail con gradiente idéntico al estilo de referencia */}
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl font-bold text-sm border shadow-2xs transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
              : "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border-primary/20 group-hover:border-primary/40",
          )}
        >
          <Award className="size-5" />
        </div>

        {/* Datos de la Responsabilidad */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <code
              className={cn(
                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0",
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-foreground",
              )}
            >
              {responsabilidad.codigo}
            </code>
            <span
              className={cn(
                "font-bold text-xs sm:text-sm truncate",
                isSelected ? "text-primary" : "text-foreground",
              )}
            >
              {responsabilidad.nombre}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
            <Layers className="size-3 text-primary shrink-0 opacity-80" />
            <span className="truncate">
              {responsabilidad.descripcion || "Responsabilidad organizacional"}
            </span>
            <span className="text-muted-foreground/40 font-bold">•</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground bg-background/80 shrink-0"
            >
              Rol
            </Badge>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
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
