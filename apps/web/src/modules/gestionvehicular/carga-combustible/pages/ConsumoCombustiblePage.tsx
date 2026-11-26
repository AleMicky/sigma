import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Fuel, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api/errors"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { cargaCombustibleQueries } from "../api/carga-combustible.queries"
import {
  exportarCargasCombustibleExcel,
  type CargaCombustibleListFilters,
} from "../api/carga-combustible.service"
import { ConsumoCombustibleFiltrosBar } from "../components/ConsumoCombustibleFiltrosBar"
import { ConsumoCombustibleMetrics } from "../components/ConsumoCombustibleMetrics"
import { ConsumoCombustibleTable } from "../components/ConsumoCombustibleTable"
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

export function ConsumoCombustiblePage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 400)

  const [activoId, setActivoId] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState<string>(getPrimerDiaMes())
  const [fechaHasta, setFechaHasta] = useState<string>(getFechaActual())

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [sortBy, setSortBy] = useState<"fechaCarga">("fechaCarga")
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC")
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Misma semántica de filtros para el listado y para los totales del servidor.
  const filtrosListado: GestionVehicularTotalesFiltros = {
    search: debouncedSearch.trim() || undefined,
    activoId: activoId || undefined,
    fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
    fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
  }

  // El listado añade paginación y orden; /totales no los acepta.
  const queryFilters: CargaCombustibleListFilters = {
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
  } = useQuery(cargaCombustibleQueries.list(queryFilters))

  const {
    data: totales,
    isLoading: isTotalesLoading,
    isFetching: isTotalesFetching,
    isError: isTotalesError,
    error: totalesError,
    refetch: refetchTotales,
  } = useQuery(gestionVehicularTotalesQueries.byModulo("combustible", filtrosListado))

  const cargas = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = pageData?.totalPages ?? 0

  const handleLimpiarFiltros = () => {
    setSearch("")
    setActivoId(null)
    setFechaDesde("")
    setFechaHasta("")
    setPage(0)
  }

  const handleExportarExcel = async () => {
    try {
      setIsExportingExcel(true)
      await exportarCargasCombustibleExcel({
        search: debouncedSearch.trim() || undefined,
        activoId: activoId || undefined,
        fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
        fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
      })
      toast.success("Reporte de combustible exportado a Excel correctamente.")
    } catch (err: unknown) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleSortChange = (
    nextSortBy: "fechaCarga",
    nextDirection: "ASC" | "DESC"
  ) => {
    setSortBy(nextSortBy)
    setDirection(nextDirection)
    setPage(0)
  }

  return (
    <PageShell size="full" padding="compact" layout="scroll" className="pb-8">
      <div
        className="space-y-4"
        aria-busy={isLoading || isFetching || isTotalesLoading || isTotalesFetching}
      >
        {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <Fuel className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Consumo de Combustible
            </h1>
            <p className="text-xs text-muted-foreground">
              Reporte de recargas, vales, facturas y métricas de consumo de la flota vehicular
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch()
              void refetchTotales()
            }}
            disabled={isFetching || isTotalesFetching}
            className="h-8 text-xs gap-1.5"
            title="Actualizar datos"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching || isTotalesFetching ? "animate-spin" : ""}`}
            />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen: solo agregados del servidor */}
      {isTotalesError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3"
        >
          <div>
            <p className="font-semibold text-sm">
              Error al cargar los totales de combustible
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
        <ConsumoCombustibleMetrics totales={totales} />
      ) : (
        <div
          data-testid="totales-skeleton"
          aria-label="Cargando totales de combustible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 print:hidden"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <ConsumoCombustibleFiltrosBar
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
            <p className="font-semibold text-sm">Error al cargar el consumo de combustible</p>
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

      {/* Tabla de Resultados con Paginación */}
      <ConsumoCombustibleTable
        cargas={cargas}
        isLoading={isLoading}
        isError={isError}
        currentPage={page}
        pageSize={size}
        totalElements={totalElements}
        totalPages={totalPages}
        sortBy={sortBy}
        direction={direction}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setSize(newSize)
          setPage(0)
        }}
      />
      </div>
    </PageShell>
  )
}
export default ConsumoCombustiblePage
