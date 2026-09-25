import { FilterX, Search } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

type ConductoresFiltersProps = {
  search: string
  setSearch: (value: string) => void
  categoria: string
  setCategoria: (value: string) => void
  estado: string
  setEstado: (value: string) => void
  hasActiveFilters: boolean
  resetFilters: () => void
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
}: ConductoresFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/60 backdrop-blur-sm p-3.5 rounded-2xl border border-border/60 shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          placeholder="Buscar por licencia, código o nombre de conductor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs rounded-xl bg-background/80 border-border/50 focus-visible:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Categoría Filter */}
        <Select
          value={categoria || "ALL"}
          onValueChange={(val) => setCategoria(val === "ALL" || !val ? "" : val)}
        >
          <SelectTrigger className="h-9 w-[150px] text-xs rounded-xl bg-background/80 border-border/50">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            <SelectItem value="M">Categoría M</SelectItem>
            <SelectItem value="P">Categoría P</SelectItem>
            <SelectItem value="A">Categoría A</SelectItem>
            <SelectItem value="B">Categoría B</SelectItem>
            <SelectItem value="C">Categoría C</SelectItem>
            <SelectItem value="T">Categoría T</SelectItem>
          </SelectContent>
        </Select>

        {/* Estado Filter */}
        <Select
          value={estado || "ALL"}
          onValueChange={(val) => setEstado(val === "ALL" || !val ? "" : val)}
        >
          <SelectTrigger className="h-9 w-[130px] text-xs rounded-xl bg-background/80 border-border/50">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="rounded-xl text-xs">
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVO">Activos</SelectItem>
            <SelectItem value="INACTIVO">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 text-xs gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <FilterX className="size-3.5" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
