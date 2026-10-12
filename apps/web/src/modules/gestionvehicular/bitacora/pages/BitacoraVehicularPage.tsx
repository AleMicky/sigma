import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  BookOpen,
  Car,
  RefreshCw,
} from "lucide-react"
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
    if (id && fechaInicio && fechaFin && fechaInicio <= fechaFin) {
      setFiltrosActivos({
        activoId: id,
        fechaInicio,
        fechaFin,
        conductorId: conductorId || undefined,
      })
    }
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
    refetch()
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
  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-4 pb-8">
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bitácora Mensual de Vehículos
            </h1>
            <p className="text-xs text-muted-foreground">
              Reporte operativo de recorridos, odómetros, combustible y control de flota vehicular.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros del Reporte (siempre visible arriba en pantalla) */}
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
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {/* Estado Inicial: Sin vehículo o sin consultar */}
      {!filtrosActivos && !isLoading && (
        <Card className="border-dashed border-2 border-border/80 bg-muted/10 print:hidden">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="p-3 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Car className="h-7 w-7" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-semibold text-sm text-foreground">
                Seleccione un Vehículo para Consultar
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seleccione el vehículo activo y defina el rango de fechas en la barra superior. Luego presione <strong>Generar Reporte</strong> para visualizar la bitácora operativa.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado: Reporte Cargado (Abajo de los Filtros) */}
      {reporte && !isLoading && (
        <div className="space-y-4">
          {/* Planilla Tabular de Registros de Bitácora (con totales abajo, sin cards ni firmas) */}
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
