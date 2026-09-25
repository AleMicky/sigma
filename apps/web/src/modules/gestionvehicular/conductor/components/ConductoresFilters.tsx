import { Filter, FilterX, LayoutGrid, List, Search, X } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export type ViewMode = "grid" | "table"

type ConductoresFiltersProps = {
  search: string
  setSearch: (value: string) => void
  categoria: string
  setCategoria: (value: string) => void
  estado: string
  setEstado: (value: string) => void
  hasActiveFilters: boolean
  resetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ConductoresFilters({
  search,
  setSearch,
  categoria,
  setCategoria,
  estado,
  setEstado,
  hasActiveFilters,
  resetFilters,
  viewMode,
  onViewModeChange,
}: ConductoresFiltersProps) {
  return (
    <div className="flex flex-col bg-card/60 backdrop-blur-md">
      {/* Top Main Toolbar */}
      <div className="flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">
        {/* Left: Search & Dropdowns */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar conductor, licencia o código…"
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

          {/* Categoría Selector */}
          <Select
            value={categoria || "ALL"}
            onValueChange={(val) => setCategoria(val === "ALL" || !val ? "" : val)}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs rounded-lg bg-background/70 border-border/60 shadow-2xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-muted-foreground font-normal">Cat:</span>
                <SelectValue placeholder="Todas" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              <SelectItem value="M">Categoría M (Motocicletas)</SelectItem>
              <SelectItem value="P">Categoría P (Particular)</SelectItem>
              <SelectItem value="A">Categoría A (Profesional)</SelectItem>
              <SelectItem value="B">Categoría B (Carga/Pasajeros)</SelectItem>
              <SelectItem value="C">Categoría C (Pesada/Articulados)</SelectItem>
              <SelectItem value="T">Categoría T (Tractores/Maquinaria)</SelectItem>
            </SelectContent>
          </Select>

          {/* Estado Selector */}
          <Select
            value={estado || "ALL"}
            onValueChange={(val) => setEstado(val === "ALL" || !val ? "" : val)}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg bg-background/70 border-border/60 shadow-2xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-muted-foreground font-normal">Estado:</span>
                <SelectValue placeholder="Todos" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="ACTIVO">Habilitados</SelectItem>
              <SelectItem value="INACTIVO">Inactivos</SelectItem>
            </SelectContent>
          </Select>
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

          {categoria && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
            >
              <span>Categoría {categoria}</span>
              <button
                type="button"
                onClick={() => setCategoria("")}
                className="hover:text-destructive cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {estado && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
            >
              <span>Estado: {estado === "ACTIVO" ? "Habilitado" : "Inactivo"}</span>
              <button
                type="button"
                onClick={() => setEstado("")}
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
