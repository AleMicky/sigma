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

export type SolicitudVehicularFilterState = {
  search: string
  estado?: string
  tipoSolicitudVehicularId?: string
}

type SolicitudVehicularFiltersProps = {
  filters: SolicitudVehicularFilterState
  onFilterChange: (filters: Partial<SolicitudVehicularFilterState>) => void
  onReset: () => void
  tiposList: Array<{ id: string; nombre: string; codigo: string }>
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
}

export function SolicitudVehicularFilters({
  filters,
  onFilterChange,
  onReset,
  tiposList,
  viewMode,
  onViewModeChange,
}: SolicitudVehicularFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search.trim() ||
      (filters.estado && filters.estado !== "TODOS") ||
      filters.tipoSolicitudVehicularId
  )

  const selectedTipo = tiposList.find(
    (t) => t.id === filters.tipoSolicitudVehicularId
  )

  return (
    <div className="flex flex-col bg-card/60 backdrop-blur-md border-b border-border/60">
      <div className="flex flex-col gap-2.5 p-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* 1. Búsqueda */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Buscar por número, motivo o destino..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-8 pr-7 h-8 text-xs rounded-lg bg-background/70 border-border/60 focus-visible:ring-primary/25 placeholder:text-muted-foreground/60 shadow-2xs"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ search: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-0.5 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* 2. Filtro de Estado */}
          <div className="w-[140px]">
            <Select
              value={filters.estado || "TODOS"}
              onValueChange={(val) =>
                onFilterChange({
                  estado: val === "TODOS" || !val ? undefined : val,
                })
              }
            >
              <SelectTrigger className="h-8 text-xs rounded-lg bg-background/70 border-border/60 shadow-2xs">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                <SelectItem value="APROBADO">APROBADO</SelectItem>
                <SelectItem value="EN_CURSO">EN CURSO</SelectItem>
                <SelectItem value="FINALIZADO">FINALIZADO</SelectItem>
                <SelectItem value="RECHAZADO">RECHAZADO</SelectItem>
                <SelectItem value="CANCELADO">CANCELADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Filtro de Tipo de Solicitud */}
          <div className="w-[180px]">
            <Select
              value={filters.tipoSolicitudVehicularId || "TODOS"}
              onValueChange={(val) =>
                onFilterChange({
                  tipoSolicitudVehicularId:
                    val === "TODOS" || !val ? undefined : val,
                })
              }
            >
              <SelectTrigger className="h-8 text-xs rounded-lg bg-background/70 border-border/60 shadow-2xs">
                <SelectValue placeholder="Tipo de Solicitud">
                  {filters.tipoSolicitudVehicularId && filters.tipoSolicitudVehicularId !== "TODOS"
                    ? tiposList.find((t) => t.id === filters.tipoSolicitudVehicularId)?.nombre
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los tipos</SelectItem>
                {tiposList.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. Selector de Vista (Tabla / Tarjetas) */}
        <div className="flex items-center gap-1 self-end lg:self-auto rounded-lg border border-border/60 bg-muted/30 p-0.5 shadow-2xs">
          <Button
            size="sm"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("table")}
            className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all cursor-pointer"
            title="Vista tabular"
          >
            <List className="size-3.5" />
            <span>Tabla</span>
          </Button>

          <Button
            size="sm"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("grid")}
            className="h-6.5 px-2.5 text-xs gap-1.5 rounded-md font-medium transition-all cursor-pointer"
            title="Vista en tarjetas"
          >
            <LayoutGrid className="size-3.5" />
            <span>Tarjetas</span>
          </Button>
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-3.5 py-2 bg-muted/15 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            <Filter className="size-3" />
            <span>Filtros:</span>
          </div>

          {filters.search && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
            >
              <span>Texto: &quot;{filters.search}&quot;</span>
              <button
                type="button"
                onClick={() => onFilterChange({ search: "" })}
                className="hover:text-destructive cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {filters.estado && filters.estado !== "TODOS" && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
            >
              <span>Estado: {filters.estado}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ estado: undefined })}
                className="hover:text-destructive cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {selectedTipo && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 rounded-lg px-2 text-[11px] font-medium bg-background border border-border/60"
            >
              <span>Tipo: {selectedTipo.nombre}</span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ tipoSolicitudVehicularId: undefined })
                }
                className="hover:text-destructive cursor-pointer ml-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1 ml-auto cursor-pointer"
          >
            <FilterX className="size-3" />
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  )
}
