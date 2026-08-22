import { RotateCcw } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export type DescriptionFilterMode = "all" | "with_desc" | "without_desc"

type CargoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  descriptionFilter: DescriptionFilterMode
  onDescriptionFilterChange: (mode: DescriptionFilterMode) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function CargoFilterToolbar({
  searchValue,
  onSearchChange,
  descriptionFilter,
  onDescriptionFilterChange,
  hasActiveFilters,
  onResetFilters,
}: CargoFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 pt-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input */}
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar cargos"
          className="w-full sm:max-w-xs"
        />

        {/* Description Filter */}
        <Select
          value={descriptionFilter}
          onValueChange={(val) =>
            onDescriptionFilterChange(val as DescriptionFilterMode)
          }
        >
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder="Estado de descripción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cargos</SelectItem>
            <SelectItem value="with_desc">Con descripción</SelectItem>
            <SelectItem value="without_desc">Sin descripción</SelectItem>
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
    </div>
  )
}
