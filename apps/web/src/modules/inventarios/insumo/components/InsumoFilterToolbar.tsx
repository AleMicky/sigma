import { LayoutGrid, List, RotateCcw } from "lucide-react"


import type { CategoriaInsumo } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.service"
import type { TipoInsumo } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.service"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

type InsumoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  tipoInsumoId: string
  onTipoInsumoChange: (value: string) => void
  categoriaInsumoId: string
  onCategoriaInsumoChange: (value: string) => void
  tipos: TipoInsumo[]
  categorias: CategoriaInsumo[]
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: "grid" | "table"
  onViewModeChange: (mode: "grid" | "table") => void
}

export function InsumoFilterToolbar({
  searchValue,
  onSearchChange,
  tipoInsumoId,
  onTipoInsumoChange,
  categoriaInsumoId,
  onCategoriaInsumoChange,
  tipos,
  categorias,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: InsumoFilterToolbarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código, nombre o marca…"
          aria-label="Buscar insumos"
          className="w-full sm:w-64 md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo de Insumo Selector */}
          <Select
            value={tipoInsumoId}
            onValueChange={(val) => onTipoInsumoChange(val ?? "__all__")}
          >
            <SelectTrigger className="h-9 w-44 rounded-xl text-xs">
              <SelectValue placeholder="Tipo de Insumo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los tipos</SelectItem>
              {tipos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Categoría Selector */}
          <Select
            value={categoriaInsumoId}
            onValueChange={(val) => onCategoriaInsumoChange(val ?? "__all__")}
          >
            <SelectTrigger className="h-9 w-44 rounded-xl text-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 gap-1.5 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 self-end sm:self-auto rounded-xl border border-border/60 bg-muted/40 p-1">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={() => onViewModeChange("grid")}
          aria-label="Vista cuadrícula"
          className="rounded-lg"
        >
          <LayoutGrid className="size-3.5" />
        </Button>
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={() => onViewModeChange("table")}
          aria-label="Vista tabla"
          className="rounded-lg"
        >
          <List className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
