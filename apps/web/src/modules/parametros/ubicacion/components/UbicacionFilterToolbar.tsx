import { Filter, FolderTree, LayoutGrid, List, Map, RotateCcw } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import type { TipoUbicacion } from "../api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "./TipoUbicacionBadge"

const ALL_TIPOS = "__all__"

export type ViewMode = "tree" | "grid" | "table" | "map"

type UbicacionFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  tipo: string
  onTipoChange: (value: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function UbicacionFilterToolbar({
  searchValue,
  onSearchChange,
  tipo,
  onTipoChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: UbicacionFilterToolbarProps) {
  const tiposKeys = Object.keys(TIPO_UBICACION_CONFIG) as TipoUbicacion[]

  return (
    <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between border-b">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar ubicaciones"
          className="w-full sm:max-w-xs"
        />

        <Select
          value={tipo}
          onValueChange={(val) => onTipoChange(val ?? ALL_TIPOS)}
        >
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filtrar por tipo de ubicación">
            <div className="flex items-center gap-2 truncate">
              <Filter className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Todos los tipos">
                {tipo === ALL_TIPOS ? (
                  "Todos los tipos"
                ) : (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium">
                      {TIPO_UBICACION_CONFIG[tipo as TipoUbicacion]?.label || tipo}
                    </span>
                  </div>
                )}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
            {tiposKeys.map((key) => {
              const cfg = TIPO_UBICACION_CONFIG[key]
              const Icon = cfg.icon
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span>{cfg.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="size-3.5" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-border/80 bg-muted/30 p-1">
        <Button
          size="icon-xs"
          variant={viewMode === "tree" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("tree")}
          title="Vista en Árbol Jerárquico"
          aria-label="Vista en Árbol Jerárquico"
        >
          <FolderTree className="size-4" />
        </Button>
        <Button
          size="icon-xs"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("grid")}
          title="Vista Cuadrícula"
          aria-label="Vista Cuadrícula"
        >
          <LayoutGrid className="size-4" />
        </Button>
        <Button
          size="icon-xs"
          variant={viewMode === "table" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("table")}
          title="Vista Tabla"
          aria-label="Vista Tabla"
        >
          <List className="size-4" />
        </Button>
        <Button
          size="icon-xs"
          variant={viewMode === "map" ? "secondary" : "ghost"}
          onClick={() => onViewModeChange("map")}
          title="Vista en Mapa Interactive (Leaflet)"
          aria-label="Vista en Mapa Interactive (Leaflet)"
        >
          <Map className="size-4" />
        </Button>
      </div>
    </div>
  )
}
