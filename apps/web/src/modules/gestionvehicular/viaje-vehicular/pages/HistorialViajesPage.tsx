import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { History, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api/errors"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
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
import { gestionVehicularTotalesQueries } from "../../totales/api/gestion-vehicular-totales.queries"
import type { GestionVehicularTotalesFiltros } from "../../totales/api/gestion-vehicular-totales.service"

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
  const [sortBy, setSortBy] = useState<"createdAt">("createdAt")
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC")
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Misma semántica de filtros para el listado y para los totales del servidor.
  const filtrosListado = {
    search: debouncedSearch.trim() || undefined,
    activoId: activoId || undefined,
    conductorId: conductorId || undefined,
    estado: estado || undefined,
    fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
    fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
  } satisfies GestionVehicularTotalesFiltros

  // El listado añade paginación y orden; /totales no los acepta.
  const queryFilters: ViajeVehicularFiltros = {
    ...filtrosListado,
    page,
    size,
    sortBy,
    direction,
  }

  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(viajeVehicularQueries.list(queryFilters))

  const {
    data: totales,
    isLoading: isTotalesLoading,
    isFetching: isTotalesFetching,
    isError: isTotalesError,
    error: totalesError,
    refetch: refetchTotales,
  } = useQuery(gestionVehicularTotalesQueries.byModulo("viajes", filtrosListado))

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
      toast.error(getErrorMessage(err))
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleSortChange = (
    nextSortBy: "createdAt",
    nextDirection: "ASC" | "DESC"
  ) => {
    setSortBy(nextSortBy)
    setDirection(nextDirection)
    setPage(0)
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
      <div
        className="space-y-4"
        aria-busy={isLoading || isFetching || isTotalesLoading || isTotalesFetching}
      >
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
              onClick={() => {
                void refetch()
                void refetchTotales()
              }}
              disabled={isFetching || isTotalesFetching}
              className="h-8 text-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${isFetching || isTotalesFetching ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Tarjetas de Métricas y Resumen: solo agregados del servidor */}
        {isTotalesError ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-sm">
                Error al cargar los totales de viajes
              </p>
              <p className="text-xs text-rose-700/90 dark:text-rose-300/90">
                {getErrorMessage(totalesError)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetchTotales()}
            >
              <RefreshCw className="size-3.5" />
              Reintentar totales
            </Button>
          </div>
        ) : totales ? (
          <HistorialViajesMetrics totales={totales} />
        ) : (
          <div
            data-testid="totales-skeleton"
            aria-label="Cargando totales de viajes"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

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

        {isError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold text-sm">Error al cargar el historial de viajes</p>
              <p className="text-xs text-rose-700/90 dark:text-rose-300/90">
                {getErrorMessage(error)}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Tabla de Resultados */}
        <HistorialViajesTable
          viajes={viajes}
          isLoading={isLoading || isFetching}
          isError={isError}
          currentPage={page}
          pageSize={size}
          totalElements={totalElements}
          totalPages={totalPages}
          sortBy={sortBy}
          direction={direction}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </PageShell>
  )
}
