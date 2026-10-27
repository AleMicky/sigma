import { Filter, LayoutGrid, RotateCcw, Table, X } from "lucide-react"

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
import { cn } from "@/shared/lib/utils"

export interface SalidaVehicularFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedEstado?: string
  selectedEstadoLabel?: string
  onClearEstado?: () => void
  onSelectEstado?: (estado: string) => void
  totalResults?: number
  filteredCount?: number
  onClearAll?: () => void
  viewMode?: "cards" | "table"
  onViewModeChange?: (mode: "cards" | "table") => void
  placeholder?: string
  className?: string
}

const ESTADOS_DISPONIBLES = [
  { value: "ALL", label: "Todos los estados" },
  { value: "INICIADO", label: "Iniciado / Salida" },
  { value: "EN_TRANSITO", label: "En Tránsito / Destino" },
  { value: "RETORNO", label: "Retorno" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
]

export function SalidaVehicularFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  selectedEstadoLabel,
  onClearEstado,
  onSelectEstado,
  totalResults,
  filteredCount,
  onClearAll,
  viewMode = "cards",
  onViewModeChange,
  placeholder = "Buscar por placa, conductor, destino o folio…",
  className,
}: SalidaVehicularFilterToolbarProps) {
  const isEstadoFiltered = Boolean(selectedEstado && selectedEstado !== "ALL")
  const hasActiveFilters = Boolean(searchQuery.trim() || isEstadoFiltered)

  const activeFiltersCount = [
    Boolean(searchQuery.trim()),
    isEstadoFiltered,
  ].filter(Boolean).length

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Lado izquierdo: Búsqueda y selector de estado */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={placeholder}
            className="w-full shadow-2xs"
          />

          {onSelectEstado && (
            <Select
              value={selectedEstado || "ALL"}
              onValueChange={(val) => onSelectEstado(val ?? "ALL")}
            >
              <SelectTrigger className="w-[160px] h-9 text-xs rounded-lg shadow-2xs bg-card">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_DISPONIBLES.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Lado derecho: Selector de vista y conteo */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          {totalResults !== undefined && (
            <span className="text-[11.5px] text-muted-foreground whitespace-nowrap">
              {hasActiveFilters && filteredCount !== undefined ? (
                <>
                  Mostrando <strong className="text-foreground">{filteredCount}</strong> de {totalResults} salidas
                </>
              ) : (
                <>
                  <strong className="text-foreground">{totalResults}</strong> salidas registradas
                </>
              )}
            </span>
          )}

          {onViewModeChange && (
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40 shadow-2xs">
              <button
                type="button"
                onClick={() => onViewModeChange("cards")}
                className={cn(
                  "flex items-center justify-center size-7 rounded-md text-xs font-medium transition-all cursor-pointer",
                  viewMode === "cards"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                className={cn(
                  "flex items-center justify-center size-7 rounded-md text-xs font-medium transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Vista en Tabla"
              >
                <Table className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Chips de Filtros Activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs animate-in fade-in-50 duration-200">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Filter className="size-3 text-muted-foreground/70" />
            Filtros activos ({activeFiltersCount}):
          </span>

          {searchQuery.trim() && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-medium bg-muted/80 text-foreground border border-border/70 hover:bg-muted transition-all shadow-2xs"
            >
              <span className="max-w-40 truncate">
                Texto: &quot;{searchQuery.trim()}&quot;
              </span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="flex size-3.5 items-center justify-center rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="size-2.5" />
                <span className="sr-only">Limpiar búsqueda</span>
              </button>
            </Badge>
          )}

          {isEstadoFiltered && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-all shadow-2xs"
            >
              <span>
                Estado: {selectedEstadoLabel ?? selectedEstado?.replace(/_/g, " ")}
              </span>
              {onClearEstado && (
                <button
                  type="button"
                  onClick={onClearEstado}
                  className="flex size-3.5 items-center justify-center rounded-full hover:bg-primary/20 text-primary/80 hover:text-primary cursor-pointer transition-colors"
                  title="Quitar filtro de estado"
                >
                  <X className="size-2.5" />
                  <span className="sr-only">Quitar filtro de estado</span>
                </button>
              )}
            </Badge>
          )}

          {onClearAll && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onClearAll}
              className="h-5 px-1.5 text-[10.5px] text-muted-foreground hover:text-foreground font-normal cursor-pointer gap-1"
            >
              <RotateCcw className="size-2.5" />
              <span>Limpiar todos</span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
