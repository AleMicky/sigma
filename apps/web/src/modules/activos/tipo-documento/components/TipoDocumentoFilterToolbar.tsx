import { LayoutGrid, List, RotateCcw } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export type VencimientoFilterMode = "all" | "vencimiento" | "permanente"
export type ViewMode = "grid" | "table"

type TipoDocumentoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  vencimientoFilter: VencimientoFilterMode
  onVencimientoFilterChange: (mode: VencimientoFilterMode) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function TipoDocumentoFilterToolbar({
  searchValue,
  onSearchChange,
  vencimientoFilter,
  onVencimientoFilterChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: TipoDocumentoFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-2 pt-2 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input */}
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar tipos de documento"
          className="w-full sm:max-w-xs h-8 text-xs"
        />

        {/* Expiration Filter */}
        <Select
          value={vencimientoFilter}
          onValueChange={(val) =>
            onVencimientoFilterChange(val as VencimientoFilterMode)
          }
        >
          <SelectTrigger className="h-8 w-full sm:w-[190px] text-xs">
            <SelectValue placeholder="Control de vencimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="vencimiento">Requiere vencimiento</SelectItem>
            <SelectItem value="permanente">Vigencia permanente</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-8 gap-1 self-start px-2 text-xs text-muted-foreground hover:text-foreground sm:self-auto"
          >
            <RotateCcw className="size-3" />
            Limpiar
          </Button>
        ) : null}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-0.5 self-end sm:self-auto border rounded-md p-0.5 bg-muted/40">
        <Button
          size="sm"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("grid")}
          className="h-7 px-2 text-xs gap-1"
          title="Vista en rejilla"
        >
          <LayoutGrid className="size-3" />
          <span className="hidden sm:inline text-xs">Rejilla</span>
        </Button>

        <Button
          size="sm"
          variant={viewMode === "table" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("table")}
          className="h-7 px-2 text-xs gap-1"
          title="Vista en tabla"
        >
          <List className="size-3" />
          <span className="hidden sm:inline text-xs">Tabla</span>
        </Button>
      </div>
    </div>
  )
}
