import { FilterX, X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

type CargosFiltersProps = {
  search: string
  setSearch: (search: string) => void
  hasActiveFilters: boolean
  resetFilters: () => void
}

export function CargosFilters({
  search,
  setSearch,
  hasActiveFilters,
  resetFilters,
}: CargosFiltersProps) {
  return (
    <div className="flex flex-col gap-3 w-full mb-3">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="w-full sm:flex-1 relative">
          <SearchField
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={setSearch}
            inputClassName="bg-background shadow-sm h-10"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-xs h-10 px-3 ml-auto sm:ml-0 text-muted-foreground hover:text-foreground shrink-0"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1 uppercase tracking-wider">
            <FilterX className="size-3.5" />
            Filtros:
          </span>
          {search && (
            <Badge
              variant="secondary"
              className="gap-1.5 h-7 text-xs px-3 rounded-full bg-background border border-border/50 hover:bg-muted transition-colors"
            >
              <span className="text-muted-foreground">Búsqueda:</span>{" "}
              <span className="font-medium">{search}</span>
              <button
                onClick={() => setSearch("")}
                className="rounded-full hover:bg-background/80 hover:text-foreground text-muted-foreground p-0.5 -mr-1 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
