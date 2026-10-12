import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, BookOpen, Car, FileSpreadsheet, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

import { bitacoraQueries } from "../api/bitacora.queries"
import {
  descargarBitacoraVehicularPdf,
  type BitacoraVehicularFiltros,
} from "../api/bitacora.service"
import { BitacoraDataTable } from "../components/BitacoraDataTable"
import { BitacoraFiltrosBar } from "../components/BitacoraFiltrosBar"
import { BitacoraHeaderCard } from "../components/BitacoraHeaderCard"
import { BitacoraResumenMetrics } from "../components/BitacoraResumenMetrics"

function getPrimerDiaMes(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}-01`
}

function getFechaActual(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function BitacoraVehicularPage() {
  const [activoId, setActivoId] = useState<string>("")
  const [placaSeleccionada, setPlacaSeleccionada] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState<string>(getPrimerDiaMes())
  const [fechaFin, setFechaFin] = useState<string>(getFechaActual())
  const [conductorId, setConductorId] = useState<string | null>(null)

  // Filtros confirmados para la consulta activa
  const [filtrosActivos, setFiltrosActivos] = useState<BitacoraVehicularFiltros | null>(null)
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Consulta TanStack Query
  const {
    data: reporte,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(bitacoraQueries.reporte(filtrosActivos))

  const handleActivoChange = (id: string, placa?: string | null) => {
    setActivoId(id)
    setPlacaSeleccionada(placa ?? null)
  }

  const handleConsultar = () => {
    if (!activoId) {
      toast.error("Debe seleccionar un vehículo obligatoriamente.")
      return
    }
    if (!fechaInicio || !fechaFin) {
      toast.error("Debe especificar las fechas de inicio y fin.")
      return
    }
    if (fechaInicio > fechaFin) {
      toast.error("La fecha de inicio no puede ser posterior a la fecha de fin.")
      return
    }

    const nuevosFiltros: BitacoraVehicularFiltros = {
      activoId,
      fechaInicio,
      fechaFin,
      conductorId: conductorId || undefined,
    }

    setFiltrosActivos(nuevosFiltros)
  }

  const handleDescargarPdf = async () => {
    const filtrosAUsar = filtrosActivos ?? (activoId && fechaInicio && fechaFin ? {
      activoId,
      fechaInicio,
      fechaFin,
      conductorId: conductorId || undefined,
    } : null)

    if (!filtrosAUsar) {
      toast.error("Seleccione un vehículo y rango de fechas para exportar el reporte.")
      return
    }

    try {
      setIsPdfLoading(true)
      toast.info("Generando reporte oficial en PDF...")
      await descargarBitacoraVehicularPdf(filtrosAUsar, placaSeleccionada)
      toast.success("Reporte oficial descargado correctamente.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al descargar el PDF"
      toast.error(`No se pudo generar el PDF: ${message}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  const handleImprimir = () => {
    if (!reporte) {
      toast.info("Consulte la bitácora antes de imprimir.")
      return
    }
    window.print()
  }

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-4 pb-8">
      {/* Título de la Sección en Pantalla (oculto al imprimir) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3 print:hidden">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bitácora Mensual de Vehículos
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-9">
            Reporte operativo unificado de recorridos, odómetros, combustible y vistos buenos según el formulario oficial ENDE CORANI.
          </p>
        </div>
      </div>

      {/* Barra de Filtros (oculta al imprimir) */}
      <BitacoraFiltrosBar
        activoId={activoId}
        onActivoChange={handleActivoChange}
        fechaInicio={fechaInicio}
        onFechaInicioChange={setFechaInicio}
        fechaFin={fechaFin}
        onFechaFinChange={setFechaFin}
        conductorId={conductorId}
        onConductorChange={setConductorId}
        onConsultar={handleConsultar}
        onDescargarPdf={handleDescargarPdf}
        onImprimir={handleImprimir}
        isLoading={isLoading || isFetching}
        isPdfLoading={isPdfLoading}
        hasData={Boolean(reporte && reporte.items.length > 0)}
        placaSeleccionada={placaSeleccionada}
      />

      {/* Estado: Error en la consulta */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive print:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Error al consultar la bitácora</p>
              <p className="text-xs text-destructive/90">{error instanceof Error ? error.message : "Ocurrió un error inesperado."}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 ml-4"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Estado: Cargando datos */}
      {(isLoading || isFetching) && (
        <div className="space-y-4 print:hidden">
          <div className="h-28 rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {/* Estado Inicial: Sin vehículo o sin consultar */}
      {!filtrosActivos && !isLoading && (
        <Card className="border-dashed border-2 border-border/80 bg-muted/10 print:hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="p-3.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Car className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-semibold text-base text-foreground">
                Seleccione un Vehículo para Consultar
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seleccione el vehículo activo (obligatorio) y defina el rango de fechas para generar la bitácora mensual de operaciones, registros de odómetro y cargas de combustible.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-md">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>Permite visualizar en pantalla, exportar en PDF oficial o imprimir.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado: Reporte Cargado */}
      {reporte && !isLoading && (
        <div className="space-y-4">
          {/* Tarjeta de Encabezado Oficial ENDE CORANI */}
          <BitacoraHeaderCard
            vehiculo={reporte.vehiculo}
            periodo={reporte.periodo}
            conductorFiltroNombre={reporte.conductorFiltroNombre}
          />

          {/* Tarjetas de Métricas Resumen (ocultas en impresión) */}
          <BitacoraResumenMetrics resumen={reporte.resumen} />

          {/* Planilla Tabular de Registros de Bitácora */}
          <BitacoraDataTable
            items={reporte.items}
            resumen={reporte.resumen}
            vehiculo={reporte.vehiculo}
          />
        </div>
      )}
    </PageShell>
  )
}
