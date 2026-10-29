import { ArrowUpDown, Filter, RotateCcw, X } from "lucide-react"

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
  sortOption?: string
  onSortChange?: (sort: string) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  totalResults?: number
  filteredCount?: number
  onClearAll?: () => void
  placeholder?: string
  className?: string
}

const ESTADOS_DISPONIBLES = [
  { value: "ALL", label: "Todos los estados" },
  { value: "SALIDA", label: "Salida" },
  { value: "LLEGADA", label: "Llegada (Finalizada)" },
  { value: "CANCELADA", label: "Cancelada" },
]

const SORT_OPTIONS = [
  { value: "createdAt:DESC", label: "Más recientes primero" },
  { value: "createdAt:ASC", label: "Más antiguos primero" },
  { value: "numero:DESC", label: "Folio (Mayor a Menor)" },
  { value: "numero:ASC", label: "Folio (Menor a Mayor)" },
]

const PAGE_SIZE_OPTIONS = [
  { value: "10", label: "10 / pág." },
  { value: "20", label: "20 / pág." },
  { value: "50", label: "50 / pág." },
]

export function SalidaVehicularFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  selectedEstadoLabel,
  onClearEstado,
  onSelectEstado,
  sortOption = "createdAt:DESC",
  onSortChange,
  pageSize = 20,
  onPageSizeChange,
  totalResults,
  filteredCount,
  onClearAll,
  placeholder = "Buscar por placa, conductor, destino o folio…",
  className,
}: SalidaVehicularFilterToolbarProps) {
  const isEstadoFiltered = Boolean(selectedEstado && selectedEstado !== "ALL")
  const isSortModified = sortOption !== "createdAt:DESC"
  const hasActiveFilters = Boolean(
    searchQuery.trim() || isEstadoFiltered || isSortModified
  )

  const activeFiltersCount = [
    Boolean(searchQuery.trim()),
    isEstadoFiltered,
    isSortModified,
  ].filter(Boolean).length

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortOption)?.label ?? "Ordenar"

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Lado izquierdo: Búsqueda y Selectores de Filtrado */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[240px] sm:max-w-md">
            <SearchField
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={placeholder}
              className="w-full shadow-2xs"
            />
          </div>

          {onSelectEstado && (
            <Select
              value={selectedEstado || "ALL"}
              onValueChange={(val) => onSelectEstado(val ?? "ALL")}
            >
              <SelectTrigger className="w-[145px] sm:w-[160px] h-9 text-xs rounded-lg shadow-2xs bg-card cursor-pointer">
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

          {onSortChange && (
            <Select
              value={sortOption}
              onValueChange={(val) => {
                if (val) onSortChange(val)
              }}
            >
              <SelectTrigger className="w-[160px] sm:w-[175px] h-9 text-xs rounded-lg shadow-2xs bg-card cursor-pointer gap-1.5">
                <ArrowUpDown className="size-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onPageSizeChange && (
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="w-[95px] h-9 text-xs rounded-lg shadow-2xs bg-card cursor-pointer">
                <SelectValue placeholder="Pág." />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Lado derecho: Conteo de resultados */}
        <div className="flex items-center gap-2 justify-between md:justify-end shrink-0 pt-0.5 md:pt-0">
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
              <span className="max-w-44 truncate">
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

          {isSortModified && onSortChange && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-medium bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all shadow-2xs"
            >
              <span>Orden: {currentSortLabel}</span>
              <button
                type="button"
                onClick={() => onSortChange("createdAt:DESC")}
                className="flex size-3.5 items-center justify-center rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Restablecer orden por defecto"
              >
                <X className="size-2.5" />
                <span className="sr-only">Restablecer orden por defecto</span>
              </button>
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
