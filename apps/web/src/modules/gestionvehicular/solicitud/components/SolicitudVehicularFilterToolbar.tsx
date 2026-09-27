import { Filter, Layers, RotateCcw, X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

export interface SolicitudVehicularTipoOption {
  id: string
  nombre: string
}

export interface SolicitudVehicularFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedEstado?: string
  selectedEstadoLabel?: string
  onClearEstado?: () => void
  selectedTipoId?: string
  onSelectTipoId?: (id: string) => void
  tiposSolicitud?: SolicitudVehicularTipoOption[]
  totalResults?: number
  filteredCount?: number
  onClearAll?: () => void
  placeholder?: string
  className?: string
}

export function SolicitudVehicularFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  selectedEstadoLabel,
  onClearEstado,
  selectedTipoId,
  onSelectTipoId,
  tiposSolicitud = [],
  totalResults,
  filteredCount,
  onClearAll,
  placeholder = "Buscar por número, motivo, solicitante o destino…",
  className,
}: SolicitudVehicularFilterToolbarProps) {
  const selectedTipo = tiposSolicitud.find((t) => t.id === selectedTipoId)
  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedEstado || selectedTipoId
  )

  const activeFiltersCount = [
    Boolean(searchQuery.trim()),
    Boolean(selectedEstado),
    Boolean(selectedTipoId),
  ].filter(Boolean).length

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <SearchField
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={placeholder}
            className="w-full shadow-2xs"
          />

          {/* Menú de Filtro Avanzado por Tipo de Solicitud */}
          {tiposSolicitud.length > 0 && onSelectTipoId && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 px-2.5 text-xs font-medium rounded-lg cursor-pointer shrink-0 transition-all",
                      selectedTipoId
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                        : "bg-background/80 hover:bg-muted text-muted-foreground"
                    )}
                  />
                }
              >
                <Layers className="size-3.5" />
                <span className="hidden sm:inline-block">
                  {selectedTipo ? selectedTipo.nombre : "Tipo Solicitud"}
                </span>
                <span className="sm:hidden">Tipo</span>
                {selectedTipoId && (
                  <span className="flex size-1.5 rounded-full bg-primary" />
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Tipo de Solicitud
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => onSelectTipoId("")}
                    className={cn(
                      "cursor-pointer text-xs font-medium",
                      !selectedTipoId && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <span>Todos los tipos</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {tiposSolicitud.map((tipo) => (
                    <DropdownMenuItem
                      key={tipo.id}
                      onClick={() => onSelectTipoId(tipo.id)}
                      className={cn(
                        "cursor-pointer text-xs font-medium truncate",
                        selectedTipoId === tipo.id &&
                          "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      <span className="truncate">{tipo.nombre}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Contador de resultados */}
        {totalResults !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-between sm:justify-end">
            <span className="text-[11.5px]">
              {hasActiveFilters && filteredCount !== undefined ? (
                <>
                  Mostrando <strong className="text-foreground">{filteredCount}</strong> de {totalResults} solicitudes
                </>
              ) : (
                <>
                  <strong className="text-foreground">{totalResults}</strong> solicitudes registradas
                </>
              )}
            </span>
          </div>
        )}
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

          {selectedEstado && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-all shadow-2xs"
            >
              <span>
                Estado: {selectedEstadoLabel ?? selectedEstado.replace(/_/g, " ")}
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

          {selectedTipo && onSelectTipoId && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 hover:bg-purple-500/15 transition-all shadow-2xs"
            >
              <span className="max-w-44 truncate">
                Tipo: {selectedTipo.nombre}
              </span>
              <button
                type="button"
                onClick={() => onSelectTipoId("")}
                className="flex size-3.5 items-center justify-center rounded-full hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 cursor-pointer transition-colors"
                title="Quitar filtro de tipo"
              >
                <X className="size-2.5" />
                <span className="sr-only">Quitar filtro de tipo</span>
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
