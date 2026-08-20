import { LayoutGrid, Table, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { SearchField } from "@/shared/components/search-field"

export type ViewMode = "grid" | "table"

type SolicitudFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusValue: string
  onStatusChange: (status: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const ESTADOS = [
  { value: "all", label: "Todos los estados" },
  { value: "borrador", label: "Borrador" },
  { value: "solicitado", label: "Solicitado" },
  { value: "aprobado", label: "Aprobado" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "finalizado", label: "Finalizado" },
  { value: "rechazado", label: "Rechazado" },
]

export function SolicitudFilterToolbar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  hasActiveFilters,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: SolicitudFilterToolbarProps) {
  return (
    <div className="flex flex-col gap-2 pt-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <SearchField
            placeholder="Buscar por título, número, descripción..."
            value={searchValue}
            onChange={onSearchChange}
            className="w-full"
          />
        </div>

        <div className="w-40">
          <Select
            value={statusValue || "all"}
            onValueChange={(val) => onStatusChange(val === "all" ? "" : (val ?? ""))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {ESTADOS.map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-xs">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            <span>Limpiar</span>
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <div className="flex items-center rounded-md border border-border/80 bg-muted/40 p-0.5">
          <Button
            size="icon-xs"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("grid")}
            className="size-7 rounded-sm"
            title="Vista de tarjetas"
          >
            <LayoutGrid className="size-3.5" />
            <span className="sr-only">Tarjetas</span>
          </Button>
          <Button
            size="icon-xs"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            type="button"
            onClick={() => onViewModeChange("table")}
            className="size-7 rounded-sm"
            title="Vista de tabla"
          >
            <Table className="size-3.5" />
            <span className="sr-only">Tabla</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
