import { useMemo } from "react"
import { LayoutGrid, List, RotateCcw, Tags } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
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

export type ViewMode = "grid" | "table"

type AccesorioFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  selectedTipoActivoId: string
  onTipoActivoChange: (tipoActivoId: string) => void
  tiposActivo: TipoActivo[]
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function AccesorioFilterToolbar({
  searchValue,
  onSearchChange,
  selectedTipoActivoId,
  onTipoActivoChange,
  tiposActivo,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: AccesorioFilterToolbarProps) {
  const tiposActivoById = useMemo(
    () => new Map(tiposActivo.map((t) => [t.id, t])),
    [tiposActivo],
  )

  const selectedTipo =
    selectedTipoActivoId !== "ALL"
      ? tiposActivoById.get(selectedTipoActivoId)
      : null

  const activeFiltersCount =
    (searchValue.trim() ? 1 : 0) + (selectedTipoActivoId !== "ALL" ? 1 : 0)

  return (
    <div className="flex flex-col gap-2 pt-2 pb-1.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input */}
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar accesorio por código o nombre…"
          aria-label="Buscar accesorios"
          className="w-full sm:max-w-xs h-8 text-xs"
        />

        {/* Tipo de Activo Select Dropdown */}
        <Select
          value={selectedTipoActivoId}
          onValueChange={(val) => onTipoActivoChange(val ?? "ALL")}
        >
          <SelectTrigger className="h-8 w-full sm:w-[240px] text-xs bg-background">
            <SelectValue placeholder="Filtrar por tipo de activo">
              {selectedTipo ? (
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="size-2 rounded-full shrink-0 shadow-2xs"
                    style={{
                      backgroundColor:
                        selectedTipo.color || DEFAULT_TIPO_ACTIVO_COLOR,
                    }}
                  />
                  <span className="truncate font-medium text-foreground">
                    {selectedTipo.nombre}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <Tags className="size-3.5 shrink-0" />
                  <span className="truncate">Todos los tipos de activo</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="ALL" className="text-xs cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="font-medium text-foreground">
                  Todos los tipos de activo
                </span>
              </div>
            </SelectItem>
            {tiposActivo.map((tipo) => {
              const Icon = getTipoActivoIcon(tipo.icono)
              const color = tipo.color || DEFAULT_TIPO_ACTIVO_COLOR
              return (
                <SelectItem
                  key={tipo.id}
                  value={tipo.id}
                  className="text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded text-white shadow-2xs"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="size-2.5" />
                    </span>
                    <span className="truncate font-medium text-foreground">
                      {tipo.nombre}
                    </span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Reset Active Filters Button */}
        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-8 gap-1.5 self-start px-2 text-xs text-muted-foreground hover:text-foreground sm:self-auto"
          >
            <RotateCcw className="size-3" />
            <span>Limpiar filtros</span>
            {activeFiltersCount > 0 ? (
              <Badge
                variant="secondary"
                className="size-4 p-0 flex items-center justify-center text-[9px] rounded-full"
              >
                {activeFiltersCount}
              </Badge>
            ) : null}
          </Button>
        ) : null}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-0.5 self-end sm:self-auto border rounded-md p-0.5 bg-muted/40 shadow-2xs">
        <Button
          size="sm"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("grid")}
          className="h-7 px-2 text-xs gap-1"
          title="Vista en rejilla"
        >
          <LayoutGrid className="size-3" />
          <span className="hidden sm:inline text-xs">Rejilla</span>
        </Button>

        <Button
          size="sm"
          variant={viewMode === "table" ? "secondary" : "ghost"}
          type="button"
          onClick={() => onViewModeChange("table")}
          className="h-7 px-2 text-xs gap-1"
          title="Vista en tabla"
        >
          <List className="size-3" />
          <span className="hidden sm:inline text-xs">Tabla</span>
        </Button>
      </div>
    </div>
  )
}
