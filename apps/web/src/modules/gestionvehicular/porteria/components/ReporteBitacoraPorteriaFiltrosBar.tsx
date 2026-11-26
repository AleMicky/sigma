import {
  Building2,
  Calendar,
  Car,
  Filter,
  Search,
  UserRound,
  X,
} from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
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

import {
  ESTADOS_PORTERIA,
  TIPOS_PASE_PORTERIA,
} from "../lib/reporte-bitacora.constants"
import {
  ReporteVehiculoCombobox,
  type ReporteVehiculoItemData,
} from "../../salida-vehicular/components/ReporteVehiculoCombobox"

export interface VehiculoPorteriaMetaInfo {
  nombre?: string
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  tipoVehiculo?: string | null
}

export interface ReporteBitacoraPorteriaFiltrosBarProps {
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  empleadoId: string
  onEmpleadoChange: (id: string) => void
  activoId: string
  onActivoChange: (
    id: string,
    placa?: string | null,
    meta?: VehiculoPorteriaMetaInfo | null
  ) => void
  fechaDesde: string
  onFechaDesdeChange: (date: string) => void
  fechaHasta: string
  onFechaHastaChange: (date: string) => void
  estado: string
  onEstadoChange: (estado: string) => void
  tipoPase: string
  onTipoPaseChange: (tipo: string) => void
  onLimpiarFiltros: () => void
}

export function ReporteBitacoraPorteriaFiltrosBar({
  searchQuery,
  onSearchQueryChange,
  empleadoId,
  onEmpleadoChange,
  activoId,
  onActivoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  estado,
  onEstadoChange,
  tipoPase,
  onTipoPaseChange,
  onLimpiarFiltros,
}: Readonly<ReporteBitacoraPorteriaFiltrosBarProps>) {
  const setHoy = () => {
    const today = new Date().toISOString().split("T")[0]
    onFechaDesdeChange(today)
    onFechaHastaChange(today)
  }

  const setMesActual = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    onFechaDesdeChange(firstDay.toISOString().split("T")[0])
    onFechaHastaChange(lastDay.toISOString().split("T")[0])
  }

  const setMesAnterior = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
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

  const setAnioActual = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), 0, 1)
    const lastDay = new Date(now.getFullYear(), 11, 31)
    onFechaDesdeChange(firstDay.toISOString().split("T")[0])
    onFechaHastaChange(lastDay.toISOString().split("T")[0])
  }

  const handleVehiculoSelect = (
    id: string,
    item?: ReporteVehiculoItemData | null
  ) => {
    if (!id) {
      onActivoChange("", null, null)
      return
    }
    const meta: VehiculoPorteriaMetaInfo = {
      nombre: item?.nombre,
      placa: item?.placa,
      marca: item?.marca,
      modelo: item?.modelo,
      tipoVehiculo: item?.tipoVehiculo,
    }
    onActivoChange(id, item?.placa ?? null, meta)
  }

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      empleadoId ||
      activoId ||
      estado !== "TODOS" ||
      tipoPase !== "TODOS" ||
      fechaDesde ||
      fechaHasta
  )

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-4 space-y-3">
        {/* Cabecera de filtros */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Filtros
            </h2>
            <span className="hidden md:inline text-xs text-muted-foreground">
              · Se aplican automáticamente
            </span>
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLimpiarFiltros}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Fila 1 de Filtros: Búsqueda rápida, Funcionario, Vehículo/Activo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Búsqueda general */}
          <div className="space-y-1.5">
            <Label
              htmlFor="search-bitacora-porteria"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              Búsqueda rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search-bitacora-porteria"
                type="text"
                placeholder="Nº folio, persona, placa, activo, destino, guardia..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-8 pr-7 h-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Funcionario */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-primary" />
                Funcionario
              </Label>
              {empleadoId && (
                <button
                  type="button"
                  onClick={() => onEmpleadoChange("")}
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                  Todos
                </button>
              )}
            </div>
            <EmpleadoCombobox
              value={empleadoId}
              onValueChange={(val) => onEmpleadoChange(val || "")}
              placeholder="Todos los funcionarios..."
            />
          </div>

          {/* Vehículo / Activo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-primary" />
                Vehículo / Activo
              </Label>
              {activoId && (
                <button
                  type="button"
                  onClick={() => onActivoChange("", null, null)}
                  className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                >
                  <X className="h-2.5 w-2.5" />
                  Todos
                </button>
              )}
            </div>
            <ReporteVehiculoCombobox
              value={activoId}
              onValueChange={handleVehiculoSelect}
              placeholder="Todos los vehículos / activos..."
              className="h-9 text-xs w-full"
            />
          </div>
        </div>

        {/* Fila 2 de Filtros: Tipo de Pase, Estado, Fecha Desde, Fecha Hasta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tipo de Pase */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Tipo de Pase
            </Label>
            <Select
              value={tipoPase}
              onValueChange={(val) => onTipoPaseChange(val ?? "TODOS")}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PASE_PORTERIA.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              Estado del Registro
            </Label>
            <Select
              value={estado}
              onValueChange={(val) => onEstadoChange(val ?? "TODOS")}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_PORTERIA.map((est) => (
                  <SelectItem key={est.value} value={est.value} className="text-xs">
                    {est.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1.5">
            <Label
              htmlFor="filtro-porteria-desde"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Fecha Desde
            </Label>
            <Input
              id="filtro-porteria-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1.5">
            <Label
              htmlFor="filtro-porteria-hasta"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Fecha Hasta
            </Label>
            <Input
              id="filtro-porteria-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        {/* Atajos rápidos de período */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/30 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium mr-1 text-foreground/80">
            Períodos rápidos:
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setHoy}
            className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer"
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setMesActual}
            className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer"
          >
            Este Mes
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setMesAnterior}
            className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer"
          >
            Mes Anterior
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setUltimos30Dias}
            className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer"
          >
            Últimos 30 días
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={setAnioActual}
            className="h-6 px-2.5 text-[11px] rounded-full cursor-pointer"
          >
            Todo el Año
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
