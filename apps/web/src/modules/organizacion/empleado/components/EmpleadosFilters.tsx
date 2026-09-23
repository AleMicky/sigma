import { Building, FilterX, X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"

type AreaResumen = {
  id: string
  nombre: string
}

type EmpleadosFiltersProps = {
  search: string
  setSearch: (search: string) => void
  selectedAreaId: string
  setSelectedAreaId: (id: string) => void
  areas: AreaResumen[]
  hasActiveFilters: boolean
  resetFilters: () => void
}

export function EmpleadosFilters({
  search,
  setSearch,
  selectedAreaId,
  setSelectedAreaId,
  areas,
  hasActiveFilters,
  resetFilters,
}: EmpleadosFiltersProps) {
  const selectedArea = areas.find((a) => a.id === selectedAreaId)

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-border/40 bg-background/40 backdrop-blur-xl shadow-sm ring-1 ring-black/5 dark:ring-white/5">
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="w-full sm:flex-1 relative">
          <SearchField
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={setSearch}
            inputClassName="h-11 rounded-xl border-input/60 bg-background/50 shadow-xs focus-visible:ring-2 focus-visible:ring-ring/30 transition-all hover:bg-background"
          />
        </div>

        <div className="relative w-full sm:flex-1">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
          <select
            className="flex h-11 w-full appearance-none rounded-xl border border-input/60 bg-background/50 px-3 py-2 text-sm shadow-xs ring-offset-background transition-all hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9 cursor-pointer"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground ml-auto sm:ml-2 h-11 px-3 hover:text-foreground transition-colors shrink-0"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 mt-1 border-t border-border/30">
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
          {selectedArea && (
            <Badge
              variant="secondary"
              className="gap-1.5 h-7 text-xs px-3 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 hover:bg-blue-500/20 transition-colors"
            >
              <span className="opacity-70">Área:</span>{" "}
              <span className="font-medium">{selectedArea.nombre}</span>
              <button
                onClick={() => setSelectedAreaId("")}
                className="rounded-full hover:bg-blue-500/20 p-0.5 -mr-1 transition-colors"
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
