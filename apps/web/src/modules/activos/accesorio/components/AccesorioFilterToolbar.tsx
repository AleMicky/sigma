import { useMemo } from "react"
import { FolderTree, LayoutGrid, List, RotateCcw } from "lucide-react"

import type { Categoria } from "@/modules/activos/categoria/api/categoria.service"
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
  selectedCategoriaId: string
  onCategoriaChange: (categoriaId: string) => void
  categorias: Categoria[]
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function AccesorioFilterToolbar({
  searchValue,
  onSearchChange,
  selectedCategoriaId,
  onCategoriaChange,
  categorias,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: AccesorioFilterToolbarProps) {
  const categoriasById = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias],
  )

  const selectedCategoria =
    selectedCategoriaId !== "ALL"
      ? categoriasById.get(selectedCategoriaId)
      : null

  const activeFiltersCount =
    (searchValue.trim() ? 1 : 0) + (selectedCategoriaId !== "ALL" ? 1 : 0)

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

        {/* Categoría Select Dropdown */}
        <Select
          value={selectedCategoriaId}
          onValueChange={(val) => onCategoriaChange(val ?? "ALL")}
        >
          <SelectTrigger className="h-8 w-full sm:w-[240px] text-xs bg-background">
            <SelectValue placeholder="Filtrar por categoría">
              {selectedCategoria ? (
                <div className="flex items-center gap-2 truncate">
                  <FolderTree className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate font-medium text-foreground">
                    {selectedCategoria.nombre}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <FolderTree className="size-3.5 shrink-0" />
                  <span className="truncate">Todas las categorías</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="ALL" className="text-xs cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                <span className="font-medium text-foreground">
                  Todas las categorías
                </span>
              </div>
            </SelectItem>
            {categorias.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.id}
                className="text-xs cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderTree className="size-3 text-muted-foreground shrink-0" />
                  <span className="truncate font-medium text-foreground">
                    {cat.nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({cat.codigo})
                  </span>
                </div>
              </SelectItem>
            ))}
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
