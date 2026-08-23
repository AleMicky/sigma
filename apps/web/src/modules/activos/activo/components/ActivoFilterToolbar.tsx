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
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"

const ALL_TIPOS = "__all__"

type ActivoFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  tipoActivoId: string
  onTipoActivoChange: (value: string) => void
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
    <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar por código o nombre del activo…"
          aria-label="Buscar activos"
          className="w-full sm:flex-1 sm:min-w-[280px]"
        />

        <Select
          value={tipoActivoId}
          onValueChange={(val) => onTipoActivoChange(val ?? ALL_TIPOS)}
        >
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Filtrar por tipo">
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

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
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
  )
}
