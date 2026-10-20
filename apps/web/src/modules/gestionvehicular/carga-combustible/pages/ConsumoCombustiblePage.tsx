import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Fuel, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { cargaCombustibleQueries } from "../api/carga-combustible.queries"
import {
  exportarCargasCombustibleExcel,
  type CargaCombustibleListFilters,
} from "../api/carga-combustible.service"
import { ConsumoCombustibleFiltrosBar } from "../components/ConsumoCombustibleFiltrosBar"
import { ConsumoCombustibleMetrics } from "../components/ConsumoCombustibleMetrics"
import { ConsumoCombustibleTable } from "../components/ConsumoCombustibleTable"

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
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Filtros armados para query
  const queryFilters: CargaCombustibleListFilters = {
    search: debouncedSearch.trim() || undefined,
    activoId: activoId || undefined,
    fechaDesde: fechaDesde ? `${fechaDesde}T00:00:00` : undefined,
    fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
    page,
    size,
    sort: "fechaCarga,desc",
  }

  const {
    data: pageData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(cargaCombustibleQueries.list(queryFilters))

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
      toast.error(
        err instanceof Error ? err.message : "Error al exportar el archivo Excel."
      )
    } finally {
      setIsExportingExcel(false)
    }
  }

  return (
    <PageShell
      size="full"
      padding="compact"
      layout="scroll"
      className="space-y-4 pb-8"
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
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs gap-1.5"
            title="Actualizar datos"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <ConsumoCombustibleMetrics
        cargas={cargas}
        totalElements={totalElements}
      />

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

      {/* Tabla de Resultados con Paginación */}
      <ConsumoCombustibleTable
        cargas={cargas}
        isLoading={isLoading}
        currentPage={page}
        pageSize={size}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setSize(newSize)
          setPage(0)
        }}
      />
    </PageShell>
  )
}
export default ConsumoCombustiblePage
