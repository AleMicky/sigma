import {
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  List,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export type MenuViewMode = "tree" | "table"
export type MenuStatusFilter = "all" | "active" | "inactive"

type MenuFilterToolbarProps = {
  searchValue: string
  onSearchChange: (val: string) => void
  statusFilter: MenuStatusFilter
  onStatusFilterChange: (val: MenuStatusFilter) => void
  viewMode: MenuViewMode
  onViewModeChange: (mode: MenuViewMode) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  onExpandAll?: () => void
  onCollapseAll?: () => void
}

export function MenuFilterToolbar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onResetFilters,
  onExpandAll,
  onCollapseAll,
}: MenuFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
      {/* Left: Search input and Status filter */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por nombre, código o ruta del menú…"
          aria-label="Buscar menús"
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusFilterChange(val as MenuStatusFilter)}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span>Todos los estados</span>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>Solo Activos</span>
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-1.5 text-destructive">
                  <ShieldAlert className="size-3.5" />
                  <span>Solo Inactivos</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Right: Expand/Collapse (Tree mode) and View Switcher */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        {viewMode === "tree" && (
          <div className="flex items-center gap-1">
            {onExpandAll && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={onExpandAll}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                title="Expandir todos los niveles"
              >
                <ChevronsDown className="size-3.5" />
                <span className="hidden md:inline">Expandir</span>
              </Button>
            )}
            {onCollapseAll && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={onCollapseAll}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                title="Colapsar todos los niveles"
              >
                <ChevronsUp className="size-3.5" />
                <span className="hidden md:inline">Colapsar</span>
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
          <Button
            type="button"
            size="xs"
            variant={viewMode === "tree" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("tree")}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <FolderTree className="size-3.5" />
            <span>Árbol</span>
          </Button>
          <Button
            type="button"
            size="xs"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            onClick={() => onViewModeChange("table")}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <List className="size-3.5" />
            <span>Tabla</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
