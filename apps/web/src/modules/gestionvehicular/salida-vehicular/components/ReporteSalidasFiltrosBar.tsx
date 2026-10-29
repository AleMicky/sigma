import {
  Calendar,
  Car,
  CheckCircle2,
  ExternalLink,
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
  onAbrirPdf?: () => void
  onImprimir: () => void
  onExportarCsv: () => void
  isLoading?: boolean
  isPdfLoading?: boolean
  hasData?: boolean
  totalSalidas?: number
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
  onAbrirPdf,
  onImprimir,
  onExportarCsv,
  isLoading = false,
  isPdfLoading = false,
  hasData = false,
  totalSalidas,
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

  const isFormValid = Boolean(fechaDesde && fechaHasta && fechaDesde <= fechaHasta)

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-3 sm:p-3.5 space-y-3">
        {/* Encabezado compacto de los filtros con presets de fecha */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Filter className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground">
              Filtros de Consulta
            </span>
            {placaSeleccionada ? (
              <Badge variant="secondary" className="text-[10px] h-4.5 px-2 bg-primary/10 text-primary font-mono font-bold">
                Placa: {placaSeleccionada}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-4.5 px-2 text-muted-foreground">
                Toda la flota (Consolidado)
              </Badge>
            )}
          </div>

          {/* Accesos rápidos de rango compactos */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Período:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2 cursor-pointer font-medium"
              onClick={setMesActual}
            >
              Este Mes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2 cursor-pointer font-medium"
              onClick={setMesAnterior}
            >
              Mes Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2 cursor-pointer font-medium"
              onClick={setUltimos30Dias}
            >
              30 Días
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2 cursor-pointer font-medium"
              onClick={setAnioActual}
            >
              Año Completo
            </Button>
          </div>
        </div>

        {/* Fila principal de controles: Vehículo + Fechas + Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
          {/* Selector de Vehículo */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-4">
            <Label className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
              <Car className="h-3 w-3 text-primary" />
              <span>Vehículo (opcional)</span>
            </Label>
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
              placeholder="Todos los vehículos (o filtrar por placa/nombre)…"
            />
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1 lg:col-span-2">
            <Label htmlFor="rep-fecha-desde" className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Desde</span>
            </Label>
            <Input
              id="rep-fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="text-xs h-8.5 px-2.5"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1 lg:col-span-2">
            <Label htmlFor="rep-fecha-hasta" className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Hasta</span>
            </Label>
            <Input
              id="rep-fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="text-xs h-8.5 px-2.5"
            />
          </div>

          {/* Búsqueda en texto */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-2">
            <Label htmlFor="rep-search" className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
              <Search className="h-3 w-3 text-muted-foreground" />
              <span>Buscar</span>
            </Label>
            <Input
              id="rep-search"
              type="text"
              placeholder="Actividad o conductor..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="text-xs h-8.5 px-2.5"
            />
          </div>

          {/* Botón de Consulta */}
          <div className="lg:col-span-2 flex items-center">
            <Button
              type="button"
              onClick={onConsultar}
              disabled={!isFormValid || isLoading}
              className="w-full h-8.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Consultando...</span>
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

        {/* Barra de Acciones de Exportación Compacta */}
        {hasData && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium text-[11px]">
                {totalSalidas != null ? `${totalSalidas} salidas registradas en el período` : "Formulario Bitácora listo"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExportarCsv}
                className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel (CSV)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onImprimir}
                className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Imprimir</span>
              </Button>

              {onAbrirPdf && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAbrirPdf}
                  disabled={isPdfLoading}
                  className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  <span>Ver PDF</span>
                </Button>
              )}

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onDescargarPdf}
                disabled={isPdfLoading}
                className="h-7 text-xs px-3 gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-2xs"
              >
                {isPdfLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generando...</span>
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

