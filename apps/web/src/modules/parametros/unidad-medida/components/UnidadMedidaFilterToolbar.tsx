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

export type DecimalFilterMode = "all" | "decimal" | "integer"
export type ViewMode = "grid" | "table"

type UnidadMedidaFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  decimalFilter: DecimalFilterMode
  onDecimalFilterChange: (mode: DecimalFilterMode) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function UnidadMedidaFilterToolbar({
  searchValue,
  onSearchChange,
  decimalFilter,
  onDecimalFilterChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: UnidadMedidaFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-3 pt-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input */}
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código, nombre o símbolo…"
          aria-label="Buscar unidades de medida"
          className="w-full sm:max-w-xs"
        />

        {/* Decimal Filter */}
        <Select
          value={decimalFilter}
          onValueChange={(val) => onDecimalFilterChange(val as DecimalFilterMode)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo de medida" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las unidades</SelectItem>
            <SelectItem value="decimal">Con decimales (#.#)</SelectItem>
            <SelectItem value="integer">Solo enteras (1, 2, 3)</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-9 gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground sm:self-auto"
          >
            <RotateCcw className="size-3.5" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 self-end sm:self-auto border rounded-lg p-0.5 bg-muted/40">
        <Button
          size="sm"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("grid")}
          className="h-8 px-2.5 text-xs gap-1.5"
          title="Vista en rejilla"
        >
          <LayoutGrid className="size-3.5" />
          <span className="hidden sm:inline">Rejilla</span>
        </Button>

        <Button
          size="sm"
          variant={viewMode === "table" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("table")}
          className="h-8 px-2.5 text-xs gap-1.5"
          title="Vista en tabla"
        >
          <List className="size-3.5" />
          <span className="hidden sm:inline">Tabla</span>
        </Button>
      </div>
    </div>
  )
}
