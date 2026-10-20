import {
  Calendar,
  FileSpreadsheet,
  Fuel,
  Loader2,
  Search,
  X,
} from "lucide-react"

import { VehiculoResponsableCombobox } from "@/modules/gestionvehicular/asignacion-vehicular/components/VehiculoResponsableCombobox"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export interface ConsumoCombustibleFiltrosBarProps {
  search: string
  onSearchChange: (search: string) => void
  activoId?: string | null
  onActivoChange: (id: string | null) => void
  fechaDesde: string
  onFechaDesdeChange: (date: string) => void
  fechaHasta: string
  onFechaHastaChange: (date: string) => void
  onLimpiarFiltros: () => void
  onExportarExcel: () => void
  isExportingExcel?: boolean
}

export function ConsumoCombustibleFiltrosBar({
  search,
  onSearchChange,
  activoId,
  onActivoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onLimpiarFiltros,
  onExportarExcel,
  isExportingExcel = false,
}: Readonly<ConsumoCombustibleFiltrosBarProps>) {
  // Atajos rápidos de fechas
  const setMesActual = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    onFechaDesdeChange(firstDay.toISOString().split("T")[0])
    onFechaHastaChange(lastDay.toISOString().split("T")[0])
  }

  const setUltimos30Dias = () => {
    const now = new Date()
    const past = new Date()
    past.setDate(now.getDate() - 30)
    onFechaDesdeChange(past.toISOString().split("T")[0])
    onFechaHastaChange(now.toISOString().split("T")[0])
  }

  const setEsteAno = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), 0, 1)
    onFechaDesdeChange(firstDay.toISOString().split("T")[0])
    onFechaHastaChange(now.toISOString().split("T")[0])
  }

  const hasActiveFilters = Boolean(
    search ||
      activoId ||
      fechaDesde ||
      fechaHasta
  )

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Cabecera de filtros y acciones de exportación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Fuel className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Filtros de Búsqueda y Consumos
              </h2>
              <p className="text-xs text-muted-foreground">
                Filtre por factura/vale, vehículo asignado y rango de fechas de recarga
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimpiarFiltros}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onExportarExcel}
              disabled={isExportingExcel}
              className="h-8 text-xs font-medium border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
            >
              {isExportingExcel ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {isExportingExcel ? "Generando Excel..." : "Exportar a Excel"}
            </Button>
          </div>
        </div>

        {/* Formulario de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Búsqueda por texto */}
          <div className="space-y-1.5">
            <Label htmlFor="search-combustible" className="text-xs font-medium text-foreground">
              Búsqueda rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search-combustible"
                placeholder="Nº Factura, vale, insumo..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Vehículo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Vehículo / Activo
            </Label>
            <VehiculoResponsableCombobox
              value={activoId ?? ""}
              onValueChange={(val: string) => onActivoChange(val || null)}
              placeholder="Todos los vehículos..."
              className="w-full text-xs"
            />
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1.5">
            <Label htmlFor="fecha-desde-comb" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              Fecha desde
            </Label>
            <Input
              id="fecha-desde-comb"
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1.5">
            <Label htmlFor="fecha-hasta-comb" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              Fecha hasta
            </Label>
            <Input
              id="fecha-hasta-comb"
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Atajos de rango de fechas */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/30 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium mr-1 text-foreground/80">
            Periodos rápidos:
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setMesActual}
            className="h-6 px-2.5 text-[11px] rounded-full"
          >
            Mes actual
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setUltimos30Dias}
            className="h-6 px-2.5 text-[11px] rounded-full"
          >
            Últimos 30 días
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setEsteAno}
            className="h-6 px-2.5 text-[11px] rounded-full"
          >
            Este año
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
