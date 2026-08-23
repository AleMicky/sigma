import { FileSpreadsheet, Filter, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"

const ALL_TIPOS = "__all__"

export type StatusFilter = "all" | "active" | "inactive"

type ActivoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  tipoActivoId: string
  onTipoActivoChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  statusCounts?: {
    all: number
    active: number
    inactive: number
  }
  tipos: TipoActivo[]
  tiposById: Map<string, TipoActivo>
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export function ActivoFilterToolbar({
  searchValue,
  onSearchChange,
  tipoActivoId,
  onTipoActivoChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  tipos,
  tiposById,
  hasActiveFilters,
  onResetFilters,
}: ActivoFilterToolbarProps) {
  function handleExportExcel() {
    toast.info("Exportación a Excel", {
      description:
        "La generación de reportes y exportación en formato Excel (.xlsx) estará disponible próximamente.",
    })
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 py-3 sm:py-4 border-b">
      {/* Top row: Search, Type filter, Status tabs & Actions */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Field */}
          <SearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Buscar por código o nombre del activo…"
            aria-label="Buscar activos"
            className="w-full sm:flex-1 sm:min-w-[260px] lg:max-w-md"
          />

          {/* Tipo de Activo Select */}
          <Select
            value={tipoActivoId}
            onValueChange={(val) => onTipoActivoChange(val ?? ALL_TIPOS)}
          >
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filtrar por tipo">
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todos los tipos">
                  {tipoActivoId === ALL_TIPOS ? (
                    "Todos los tipos"
                  ) : (
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            tiposById.get(tipoActivoId)?.color ||
                            DEFAULT_TIPO_ACTIVO_COLOR,
                        }}
                      />
                      <span className="truncate">{tiposById.get(tipoActivoId)?.nombre}</span>
                    </div>
                  )}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
              {tipos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: tipo.color || DEFAULT_TIPO_ACTIVO_COLOR,
                      }}
                    />
                    <span>{tipo.nombre}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Tabs (Todos / De alta / De baja) */}
          <div className="flex w-full sm:w-auto items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => onStatusFilterChange("all")}
              className={cn(
                "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <span>Todos</span>
              {statusCounts !== undefined && (
                <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                  {statusCounts.all}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange("active")}
              className={cn(
                "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                statusFilter === "active"
                  ? "bg-background text-emerald-700 dark:text-emerald-400 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>De alta</span>
              {statusCounts !== undefined && (
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  {statusCounts.active}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onStatusFilterChange("inactive")}
              className={cn(
                "flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                statusFilter === "inactive"
                  ? "bg-background text-amber-700 dark:text-amber-400 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>De baja</span>
              {statusCounts !== undefined && (
                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.2 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                  {statusCounts.inactive}
                </span>
              )}
            </button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0 h-8 px-2.5 gap-1.5 transition-colors"
            >
              <RotateCcw className="size-3.5 text-muted-foreground" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>

        {/* Right side: Export button */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="h-8 px-2.5 text-xs font-medium gap-1.5 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
