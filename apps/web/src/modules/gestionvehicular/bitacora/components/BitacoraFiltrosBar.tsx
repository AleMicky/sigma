import {
  Calendar,
  Car,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  Loader2,
  Printer,
  User,
} from "lucide-react"

import { ConductorCombobox } from "@/modules/gestionvehicular/conductor/components/ConductorCombobox"
import {
  extractPlaca,
  VehiculoResponsableCombobox,
} from "@/modules/gestionvehicular/asignacion-vehicular/components/VehiculoResponsableCombobox"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export interface BitacoraFiltrosBarProps {
  activoId: string
  onActivoChange: (id: string, placa?: string | null, nombre?: string | null) => void
  fechaInicio: string
  onFechaInicioChange: (date: string) => void
  fechaFin: string
  onFechaFinChange: (date: string) => void
  conductorId?: string | null
  onConductorChange: (id: string | null) => void
  onConsultar: () => void
  onDescargarPdf: () => void
  isLoading?: boolean
  isPdfLoading?: boolean
  hasData?: boolean
  placaSeleccionada?: string | null
}

export function BitacoraFiltrosBar({
  activoId,
  onActivoChange,
  fechaInicio,
  onFechaInicioChange,
  fechaFin,
  onFechaFinChange,
  conductorId,
  onConductorChange,
  onConsultar,
  onDescargarPdf,
  isLoading = false,
  isPdfLoading = false,
  hasData = false,
  placaSeleccionada,
}: Readonly<BitacoraFiltrosBarProps>) {
  // Accesos rápidos a rangos de fechas
  const setMesActual = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    onFechaInicioChange(firstDay.toISOString().split("T")[0])
    onFechaFinChange(lastDay.toISOString().split("T")[0])
  }

  const setMesAnterior = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    onFechaInicioChange(firstDay.toISOString().split("T")[0])
    onFechaFinChange(lastDay.toISOString().split("T")[0])
  }

  const setUltimos30Dias = () => {
    const now = new Date()
    const past = new Date()
    past.setDate(now.getDate() - 30)
    onFechaInicioChange(past.toISOString().split("T")[0])
    onFechaFinChange(now.toISOString().split("T")[0])
  }

  const isFormValid = Boolean(activoId && fechaInicio && fechaFin)

  return (
    <Card className="border-border/60 shadow-sm print:hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Filtros de Bitácora de Vehículo
              </h2>
              <p className="text-xs text-muted-foreground">
                Seleccione el vehículo activo (obligatorio) y el rango de fechas para consultar el reporte mensual
              </p>
            </div>
          </div>

          {/* Botones de selección rápida de período */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Rápido:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={setMesActual}
            >
              Este Mes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={setMesAnterior}
            >
              Mes Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={setUltimos30Dias}
            >
              Últimos 30 días
            </Button>
          </div>
        </div>

        {/* Formulario de Filtros con Botón Inline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* 1. Selector de Vehículo (Obligatorio) */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
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
            <VehiculoResponsableCombobox
              value={activoId}
              onValueChange={(val, item) => {
                if (item && "vehiculo" in item && item.vehiculo) {
                  onActivoChange(val, extractPlaca(item.vehiculo.descripcion), item.vehiculo.nombre)
                } else if (item && "nombre" in item) {
                  onActivoChange(val, extractPlaca(item.descripcion), item.nombre)
                } else {
                  onActivoChange(val, null, null)
                }
              }}
              placeholder="Buscar vehículo por código o placa..."
            />
          </div>

          {/* 2. Fecha Inicio (Obligatorio) */}
          <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
            <Label htmlFor="fechaInicio" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Fecha Inicio</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* 3. Fecha Fin (Obligatorio) */}
          <div className="space-y-1.5 sm:col-span-1 lg:col-span-2">
            <Label htmlFor="fechaFin" className="text-xs font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Fecha Fin</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* 4. Conductor (Opcional) */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Conductor</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              {conductorId && (
                <button
                  type="button"
                  onClick={() => onConductorChange(null)}
                  className="text-[11px] text-primary hover:underline"
                >
                  Limpiar conductor
                </button>
              )}
            </div>
            <ConductorCombobox
              value={conductorId ?? ""}
              onValueChange={(val) => onConductorChange(val || null)}
              placeholder="Todos los conductores..."
            />
          </div>

          {/* 5. Botón Generar Reporte Inline */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!isFormValid || isLoading}
              onClick={onConsultar}
              className="w-full h-9 px-3 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Generar Reporte</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Acciones de Exportación cuando hay datos cargados */}
        {hasData && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/40">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Reporte generado correctamente
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPdfLoading}
                onClick={onDescargarPdf}
                className="flex-1 sm:flex-initial h-8 px-3 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                title="Generar e imprimir reporte oficial en PDF"
              >
                {isPdfLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir PDF</span>
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
