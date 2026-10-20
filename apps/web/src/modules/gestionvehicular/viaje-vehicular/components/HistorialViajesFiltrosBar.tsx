import {
  Calendar,
  FileSpreadsheet,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react"

import { ConductorCombobox } from "@/modules/gestionvehicular/conductor/components/ConductorCombobox"
import { VehiculoResponsableCombobox } from "@/modules/gestionvehicular/asignacion-vehicular/components/VehiculoResponsableCombobox"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import type { EstadoViajeVehicular } from "../api/viaje-vehicular.service"

export interface HistorialViajesFiltrosBarProps {
  search: string
  onSearchChange: (search: string) => void
  activoId?: string | null
  onActivoChange: (id: string | null) => void
  conductorId?: string | null
  onConductorChange: (id: string | null) => void
  estado?: EstadoViajeVehicular | ""
  onEstadoChange: (estado: EstadoViajeVehicular | "") => void
  fechaDesde: string
  onFechaDesdeChange: (date: string) => void
  fechaHasta: string
  onFechaHastaChange: (date: string) => void
  onLimpiarFiltros: () => void
  onExportarExcel: () => void
  isExportingExcel?: boolean
}

export function HistorialViajesFiltrosBar({
  search,
  onSearchChange,
  activoId,
  onActivoChange,
  conductorId,
  onConductorChange,
  estado,
  onEstadoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onLimpiarFiltros,
  onExportarExcel,
  isExportingExcel = false,
}: Readonly<HistorialViajesFiltrosBarProps>) {
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

  const hasActiveFilters = Boolean(
    search ||
      activoId ||
      conductorId ||
      estado ||
      fechaDesde ||
      fechaHasta
  )

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Cabecera de filtros y acciones de exportación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Filtros de Búsqueda y Consulta
              </h2>
              <p className="text-xs text-muted-foreground">
                Consulte por vehículo, conductor, estado y rango de fechas de viaje
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimpiarFiltros}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpiar
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onExportarExcel}
              disabled={isExportingExcel}
              className="h-8 text-xs border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all font-medium"
            >
              {isExportingExcel ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              )}
              Exportar a Excel
            </Button>
          </div>
        </div>

        {/* Primera Fila: Búsqueda de texto, Vehículo y Conductor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Búsqueda general */}
          <div className="space-y-1.5">
            <Label htmlFor="search-input" className="text-xs font-medium text-foreground">
              Búsqueda Rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Nº solicitud, motivo, destino..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Vehículo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Vehículo / Activo
            </Label>
            <VehiculoResponsableCombobox
              value={activoId ?? ""}
              onValueChange={(val) => onActivoChange(val || null)}
              placeholder="Todos los vehículos..."
              className="w-full text-xs"
            />
          </div>

          {/* Conductor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Conductor
            </Label>
            <ConductorCombobox
              value={conductorId ?? ""}
              onValueChange={(val) => onConductorChange(val || null)}
              placeholder="Todos los conductores..."
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Segunda Fila: Estado y Rango de Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Estado del Viaje
            </Label>
            <Select
              value={estado || "TODOS"}
              onValueChange={(val) =>
                onEstadoChange(val === "TODOS" ? "" : (val as EstadoViajeVehicular))
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="PROGRAMADO">● Programado</SelectItem>
                <SelectItem value="EN_CURSO">● En Tránsito</SelectItem>
                <SelectItem value="FINALIZADO">● Finalizado</SelectItem>
                <SelectItem value="CANCELADO">● Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1.5">
            <Label htmlFor="fecha-desde" className="text-xs font-medium text-foreground">
              Fecha Desde
            </Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1.5">
            <Label htmlFor="fecha-hasta" className="text-xs font-medium text-foreground">
              Fecha Hasta
            </Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {/* Atajos Rápidos */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Atajos de Fecha
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setMesActual}
                className="h-9 text-[11px] px-1.5 font-normal"
              >
                Este Mes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setUltimos30Dias}
                className="h-9 text-[11px] px-1.5 font-normal"
              >
                30 Días
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
