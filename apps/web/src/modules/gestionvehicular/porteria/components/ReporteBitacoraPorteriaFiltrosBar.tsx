import {
  Building2,
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
  X,
} from "lucide-react"

import {
  ReporteVehiculoCombobox,
  type ReporteVehiculoItemData,
} from "../../salida-vehicular/components/ReporteVehiculoCombobox"
import { Badge } from "@/shared/components/ui/badge"
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

export interface VehiculoPorteriaMetaInfo {
  nombre?: string
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  tipoVehiculo?: string | null
}

export interface ReporteBitacoraPorteriaFiltrosBarProps {
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
  totalItems?: number
  placaSeleccionada?: string | null
}

export const ESTADOS_PORTERIA = [
  { value: "TODOS", label: "Todos los Estados" },
  { value: "AFUERA", label: "Afuera (En curso)" },
  { value: "COMPLETADO", label: "Completado (Retornó)" },
  { value: "ANULADO", label: "Anulado" },
]

export const TIPOS_PASE_PORTERIA = [
  { value: "TODOS", label: "Internos y Externos" },
  { value: "INTERNO", label: "Solo Personal Interno" },
  { value: "EXTERNO", label: "Solo Visitas / Externos" },
]

export function ReporteBitacoraPorteriaFiltrosBar({
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
  totalItems,
  placaSeleccionada,
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

  return (
    <Card className="border-border/60 shadow-2xs print:hidden">
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* FILA 1: Vehículo + Fechas + Tipo Pase + Estado + Acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
          {/* 1. Selector de Vehículo / Activo */}
          <div className="lg:col-span-3 space-y-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="filtro-porteria-activo"
                className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"
              >
                <Car className="h-3.5 w-3.5 text-primary" />
                Vehículo / Activo
              </Label>
              {activoId && (
                <button
                  type="button"
                  onClick={() => onActivoChange("", null, null)}
                  className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 cursor-pointer"
                  title="Ver todos los vehículos y activos"
                >
                  <X className="h-2.5 w-2.5" />
                  Todos
                </button>
              )}
            </div>
            <ReporteVehiculoCombobox
              id="filtro-porteria-activo"
              value={activoId}
              onValueChange={handleVehiculoSelect}
              placeholder="Todos los vehículos / activos..."
              className="h-8.5 text-xs w-full"
            />
          </div>

          {/* 2. Fecha Desde */}
          <div className="lg:col-span-2 space-y-1">
            <Label
              htmlFor="filtro-porteria-fecha-desde"
              className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Salida Desde
            </Label>
            <Input
              id="filtro-porteria-fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => onFechaDesdeChange(e.target.value)}
              className="h-8.5 text-xs font-mono"
            />
          </div>

          {/* 3. Fecha Hasta */}
          <div className="lg:col-span-2 space-y-1">
            <Label
              htmlFor="filtro-porteria-fecha-hasta"
              className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Salida Hasta
            </Label>
            <Input
              id="filtro-porteria-fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => onFechaHastaChange(e.target.value)}
              className="h-8.5 text-xs font-mono"
            />
          </div>

          {/* 4. Tipo de Pase (Interno / Externo) */}
          <div className="lg:col-span-1 space-y-1">
            <Label
              htmlFor="filtro-porteria-tipo"
              className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1"
            >
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Tipo
            </Label>
            <Select
              value={tipoPase}
              onValueChange={(val) => onTipoPaseChange(val ?? "TODOS")}
            >
              <SelectTrigger id="filtro-porteria-tipo" className="h-8.5 text-xs">
                <SelectValue placeholder="Todos" />
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

          {/* 5. Estado */}
          <div className="lg:col-span-1 space-y-1">
            <Label
              htmlFor="filtro-porteria-estado"
              className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-primary" />
              Estado
            </Label>
            <Select
              value={estado}
              onValueChange={(val) => onEstadoChange(val ?? "TODOS")}
            >
              <SelectTrigger id="filtro-porteria-estado" className="h-8.5 text-xs">
                <SelectValue placeholder="Todos" />
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

          {/* 6. Botones de Consulta y Exportación */}
          <div className="lg:col-span-3 flex items-center gap-1.5 flex-wrap justify-end">
            <Button
              type="button"
              size="sm"
              onClick={onConsultar}
              disabled={isLoading || !fechaDesde || !fechaHasta}
              className="gap-1.5 text-xs h-8.5 flex-1 sm:flex-none cursor-pointer font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Consultar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDescargarPdf}
              disabled={!hasData || isPdfLoading}
              className="gap-1 text-xs h-8.5 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer"
              title="Descargar PDF Oficial de Bitácora de Portería"
            >
              {isPdfLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              <span className="hidden xl:inline">PDF</span>
            </Button>

            {onAbrirPdf && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAbrirPdf}
                disabled={!hasData || isPdfLoading}
                className="gap-1 text-xs h-8.5 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Abrir PDF oficial en pestaña nueva"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onImprimir}
              disabled={!hasData}
              className="gap-1 text-xs h-8.5 px-2.5 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 border-sky-500/30 cursor-pointer"
              title="Imprimir planilla oficial de bitácora"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Imprimir</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportarCsv}
              disabled={!hasData}
              className="gap-1 text-xs h-8.5 px-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
              title="Exportar bitácora a Excel (CSV con UTF-8)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Excel</span>
            </Button>
          </div>
        </div>

        {/* FILA 2: Presets de rango rápido + Búsqueda textual */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
          {/* Presets rápidos */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[10.5px] text-muted-foreground font-medium mr-1 shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Período:
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={setHoy}
              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={setMesActual}
              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Este Mes
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={setMesAnterior}
              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Mes Anterior
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={setUltimos30Dias}
              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Últimos 30 días
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={setAnioActual}
              className="text-[10px] h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Todo el Año
            </Button>
          </div>

          {/* Búsqueda textual sobre los resultados */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por folio, funcionario, placa, activo, destino, guardia..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="h-7 text-xs pl-8 pr-6 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {totalItems != null && totalItems > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-mono h-6 px-2 shrink-0 bg-primary/10 text-primary border-primary/20"
              >
                {totalItems} reg.
              </Badge>
            )}
          </div>
        </div>

        {/* Indicador de filtro activo si se seleccionó vehículo */}
        {activoId && placaSeleccionada && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 p-1.5 px-2.5 rounded-md border border-border/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>
              Filtrando registros de portería asociados al vehículo/activo:{" "}
              <strong className="text-foreground">{placaSeleccionada}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
