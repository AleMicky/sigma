import { Filter, FilterX, LayoutGrid, List, Search, X } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

export type ViewMode = "grid" | "table"

type TipoSolicitudFiltersProps = {
  search: string
  setSearch: (value: string) => void
  hasActiveFilters: boolean
  resetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function TipoSolicitudFilters({
  search,
  setSearch,
  hasActiveFilters,
  resetFilters,
  viewMode,
  onViewModeChange,
}: TipoSolicitudFiltersProps) {
  return (
    <div className="flex flex-col bg-card/60 backdrop-blur-md">
      {/* Top Main Toolbar */}
      <div className="flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">
        {/* Left: Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar por código, nombre o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-7 h-8 text-xs rounded-lg bg-background/70 border-border/60 focus-visible:ring-primary/25 placeholder:text-muted-foreground/60 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-0.5 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: View Switcher */}
        <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-2xs">
          <Button
            size="sm"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("table")}
            className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all"
            title="Vista tabular compacta"
          >
            <List className="size-3.5" />
            <span>Tabla</span>
          </Button>

          <Button
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("grid")}
            className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all"
            title="Vista en tarjetas"
          >
            <LayoutGrid className="size-3.5" />
            <span>Tarjetas</span>
          </Button>
        </div>
      </div>

      {/* Active Filters Bar (Chips) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-muted/15 border-b border-border/40 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            <Filter className="size-3" />
            <span>Filtros:</span>
          </div>

          {search && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
            >
              <span>Texto: &quot;{search}&quot;</span>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="hover:text-destructive cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1 ml-auto"
          >
            <FilterX className="size-3" />
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  )
}
