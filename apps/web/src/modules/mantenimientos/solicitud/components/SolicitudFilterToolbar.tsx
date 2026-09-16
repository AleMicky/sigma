import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

export interface SolicitudFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedEstado?: string
  onClearEstado?: () => void
  placeholder?: string
  className?: string
}

export function SolicitudFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  onClearEstado,
  placeholder = "Buscar por número o título…",
  className,
}: SolicitudFilterToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={placeholder}
        className="w-full max-w-sm sm:max-w-md"
      />

      {selectedEstado && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Filtrado por:</span>
          <Badge variant="secondary" className="gap-1 text-xs capitalize">
            {selectedEstado.replace("_", " ")}
            {onClearEstado && (
              <button
                type="button"
                onClick={onClearEstado}
                className="ml-0.5 rounded hover:bg-muted-foreground/20 px-1 py-0.2 cursor-pointer font-bold leading-none"
                title="Quitar filtro de estado"
              >
                ×
              </button>
            )}
          </Badge>
        </div>
      )}
    </div>
  )
}
