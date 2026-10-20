import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { History, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { viajeVehicularQueries } from "../api/viaje-vehicular.queries"
import {
  exportarViajesExcel,
  type EstadoViajeVehicular,
  type ViajeVehicularFiltros,
} from "../api/viaje-vehicular.service"
import { HistorialViajesFiltrosBar } from "../components/HistorialViajesFiltrosBar"
import { HistorialViajesMetrics } from "../components/HistorialViajesMetrics"
import { HistorialViajesTable } from "../components/HistorialViajesTable"

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

export function HistorialViajesPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 400)

  const [activoId, setActivoId] = useState<string | null>(null)
  const [conductorId, setConductorId] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoViajeVehicular | "">("")
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Filtros armados para query
  const queryFilters: ViajeVehicularFiltros = {
    search: debouncedSearch.trim() || undefined,
    activoId: activoId || undefined,
    conductorId: conductorId || undefined,
    estado: estado || undefined,
    fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
    fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
    page,
    size,
    sort: "createdAt,desc",
  }

  const {
    data: pageData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(viajeVehicularQueries.list(queryFilters))

  const viajes = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = pageData?.totalPages ?? 0

  const handleLimpiarFiltros = () => {
    setSearch("")
    setActivoId(null)
    setConductorId(null)
    setEstado("")
    setFechaDesde("")
    setFechaHasta("")
    setPage(0)
  }

  const handleExportarExcel = async () => {
    try {
      setIsExportingExcel(true)
      await exportarViajesExcel({
        search: debouncedSearch.trim() || undefined,
        activoId: activoId || undefined,
        conductorId: conductorId || undefined,
        estado: estado || undefined,
        fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
        fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
      })
      toast.success("Historial de viajes exportado a Excel correctamente.")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al exportar el archivo Excel."
      )
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="space-y-4 pb-8">
      <div className="space-y-4">
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Historial de Viajes Vehiculares
              </h1>
              <p className="text-xs text-muted-foreground">
                Consulta consolidada de viajes, odómetros, conductores y exportación a Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Tarjetas de Métricas y Resumen */}
        <HistorialViajesMetrics
          viajes={viajes}
          totalElements={totalElements}
        />

        {/* Barra de Filtros */}
        <HistorialViajesFiltrosBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val)
            setPage(0)
          }}
          activoId={activoId}
          onActivoChange={(val) => {
            setActivoId(val)
            setPage(0)
          }}
          conductorId={conductorId}
          onConductorChange={(val) => {
            setConductorId(val)
            setPage(0)
          }}
          estado={estado}
          onEstadoChange={(val) => {
            setEstado(val)
            setPage(0)
          }}
          fechaDesde={fechaDesde}
          onFechaDesdeChange={(val) => {
            setFechaDesde(val)
            setPage(0)
          }}
          fechaHasta={fechaHasta}
          onFechaHastaChange={(val) => {
            setFechaHasta(val)
            setPage(0)
          }}
          onLimpiarFiltros={handleLimpiarFiltros}
          onExportarExcel={handleExportarExcel}
          isExportingExcel={isExportingExcel}
        />

        {/* Tabla de Resultados */}
        <HistorialViajesTable
          viajes={viajes}
          isLoading={isLoading || isFetching}
          currentPage={page}
          pageSize={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </PageShell>
  )
}
