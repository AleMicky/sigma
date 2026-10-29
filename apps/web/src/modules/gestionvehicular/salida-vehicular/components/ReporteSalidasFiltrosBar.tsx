import {
  Calendar,
  Car,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react"

import {
  ReporteVehiculoCombobox,
  type ReporteVehiculoItemData,
} from "./ReporteVehiculoCombobox"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export interface VehiculoMetaInfo {
  nombre?: string
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  tipoVehiculo?: string | null
}

export interface ReporteSalidasFiltrosBarProps {
  activoId: string
  onActivoChange: (
    id: string,
    placa?: string | null,
    meta?: VehiculoMetaInfo | null
  ) => void
  fechaDesde: string
  onFechaDesdeChange: (date: string) => void
  fechaHasta: string
  onFechaHastaChange: (date: string) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onConsultar: () => void
  onDescargarPdf: () => void
  onImprimir: () => void
  onExportarCsv: () => void
  isLoading?: boolean
  isPdfLoading?: boolean
  hasData?: boolean
  placaSeleccionada?: string | null
}

export function ReporteSalidasFiltrosBar({
  activoId,
  onActivoChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  searchQuery,
  onSearchQueryChange,
  onConsultar,
  onDescargarPdf,
  onImprimir,
  onExportarCsv,
  isLoading = false,
  isPdfLoading = false,
  hasData = false,
  placaSeleccionada,
}: Readonly<ReporteSalidasFiltrosBarProps>) {
  // Presets de fechas
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

  const isFormValid = Boolean(activoId && fechaDesde && fechaHasta)

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Encabezado de los filtros con presets de fecha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Filtros de Bitácora de Vehículos
              </h2>
              <p className="text-xs text-muted-foreground">
                Filtre por vehículo y rango de fechas para generar la bitácora oficial de salidas.
              </p>
            </div>
          </div>

          {/* Accesos rápidos de rango */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Período:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 cursor-pointer"
              onClick={setMesActual}
            >
              Este Mes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 cursor-pointer"
              onClick={setMesAnterior}
            >
              Mes Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 cursor-pointer"
              onClick={setUltimos30Dias}
            >
              Últimos 30 días
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 cursor-pointer"
              onClick={setAnioActual}
            >
              Año Completo
            </Button>
          </div>
        </div>

        {/* Fila principal de controles: Vehículo + Fechas + Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Selector de Vehículo */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-primary" />
                <span>Vehículo (Activo)</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              {placaSeleccionada && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary">
                  Placa: {placaSeleccionada}
                </Badge>
              )}
            </div>
            <ReporteVehiculoCombobox
              value={activoId}
              onValueChange={(val: string, item?: ReporteVehiculoItemData | null) => {
                if (item) {
                  onActivoChange(val, item.placa, {
                    nombre: item.nombre,
                    placa: item.placa,
                    marca: item.marca,
                    modelo: item.modelo,
                    tipoVehiculo: item.tipoVehiculo,
                  })
                } else {
                  onActivoChange("", null, null)
                }
              }}
              placeholder="Buscar vehículo por placa, nombre o código…"
            />
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="rep-fecha-desde" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Fecha Inicio</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="rep-fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="rep-fecha-hasta" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Fecha Fin</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="rep-fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Búsqueda en texto (filtro local de actividad o conductor) */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="rep-search" className="text-xs font-medium flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Filtrar texto</span>
            </Label>
            <Input
              id="rep-search"
              type="text"
              placeholder="Conductor, actividad..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Botón de Consulta */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <Button
              type="button"
              onClick={onConsultar}
              disabled={!isFormValid || isLoading}
              className="w-full h-9 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Consultar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Barra de Acciones de Exportación */}
        {hasData && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Formulario Bitácora preparado listo para visualizar o exportar</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExportarCsv}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Exportar Excel (CSV)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onImprimir}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Imprimir</span>
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onDescargarPdf}
                disabled={isPdfLoading}
                className="h-8 text-xs gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
              >
                {isPdfLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5" />
                    <span>Descargar PDF Oficial</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

