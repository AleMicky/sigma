import { X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { SearchField } from "@/shared/components/search-field"

type SolicitudFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function SolicitudFilterToolbar({
  searchValue,
  onSearchChange,
  hasActiveFilters,
  onResetFilters,
}: SolicitudFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 pt-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
      {/* Search & Reset Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="w-full sm:w-80">
          <SearchField
            placeholder="Buscar por título, número, activo..."
            value={searchValue}
            onChange={onSearchChange}
            className="w-full h-9 text-xs"
          />
        </div>

        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-9 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <X className="size-3.5" />
            <span>Limpiar filtros</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
