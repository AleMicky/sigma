import { LayoutGrid, List, RotateCcw, Search } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

export type ViewMode = "grid" | "table"

type TipoMantenimientoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function TipoMantenimientoFilterToolbar({
  searchValue,
  onSearchChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: TipoMantenimientoFilterToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por código o nombre..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
        <div className="flex items-center rounded-md border border-border bg-muted/30 p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => onViewModeChange("grid")}
            className="size-7"
            title="Vista Cuadrícula"
          >
            <LayoutGrid className="size-3.5" />
            <span className="sr-only">Cuadrícula</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => onViewModeChange("table")}
            className="size-7"
            title="Vista Tabla"
          >
            <List className="size-3.5" />
            <span className="sr-only">Tabla</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
