import { Building, FilterX, X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

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
    <div className="flex flex-col gap-3 w-full mb-3">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="w-full sm:flex-1 relative">
          <SearchField
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={setSearch}
            inputClassName="bg-background shadow-sm h-10"
          />
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Select
            value={selectedAreaId || "all"}
            onValueChange={(val) => setSelectedAreaId(!val || val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-full bg-background shadow-sm h-10 pl-9 relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
              <SelectValue placeholder="Todas las áreas">
                {selectedAreaId && selectedAreaId !== "all" && selectedArea 
                  ? selectedArea.nombre 
                  : "Todas las áreas"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" label="Todas las áreas">Todas las áreas</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id} label={area.nombre}>
                  {area.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
