import { X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

export interface SolicitudFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedEstado?: string
  selectedEstadoLabel?: string
  onClearEstado?: () => void
  placeholder?: string
  className?: string
}

export function SolicitudFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  selectedEstadoLabel,
  onClearEstado,
  placeholder = "Buscar por número, título, activo o solicitante…",
  className,
}: SolicitudFilterToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={placeholder}
        className="w-full max-w-sm sm:max-w-md shadow-2xs"
      />

      {selectedEstado && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in-50 duration-200">
          <span className="text-[11px] font-medium">Filtrado por:</span>
          <Badge
            variant="secondary"
            className="gap-1.5 pl-2.5 pr-1.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-all shadow-2xs"
          >
            <span>{selectedEstadoLabel ?? selectedEstado.replace(/_/g, " ")}</span>
            {onClearEstado && (
              <button
                type="button"
                onClick={onClearEstado}
                className="flex size-3.5 items-center justify-center rounded-full hover:bg-primary/20 text-primary/80 hover:text-primary cursor-pointer transition-colors"
                title="Quitar filtro de estado"
              >
                <X className="size-2.5" />
                <span className="sr-only">Quitar filtro</span>
              </button>
            )}
          </Badge>
        </div>
      )}
    </div>
  )
}

