import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import {
  exportarActivosDisponibilidadExcel,
  type ActivoDisponibilidadParams,
} from "@/modules/activos/activo/api/activo.service"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { DisponibilidadFiltrosBar } from "../components/DisponibilidadFiltrosBar"
import { DisponibilidadMetrics } from "../components/DisponibilidadMetrics"
import { DisponibilidadTable } from "../components/DisponibilidadTable"

export function DisponibilidadActivosPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 400)

  const [estadoOperativoId, setEstadoOperativoId] = useState<string | null>(null)
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const [tipoActivoId, setTipoActivoId] = useState<string | null>(null)
  const [ubicacionId, setUbicacionId] = useState<string | null>(null)
  const [activoFilter, setActivoFilter] = useState<boolean | null>(null)

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  // Filtros armados para query
  const queryFilters: ActivoDisponibilidadParams = {
    q: debouncedSearch.trim() || undefined,
    estadoOperativoId: estadoOperativoId || undefined,
    categoriaId: categoriaId || undefined,
    tipoActivoId: tipoActivoId || undefined,
    ubicacionId: ubicacionId || undefined,
    activo: activoFilter ?? undefined,
    page,
    size,
    sortBy: "nombre",
    direction: "ASC",
  }

  const {
    data: pageData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(activoQueries.disponibilidad(queryFilters))

  const activos = pageData?.content ?? []
  const totalElements = pageData?.totalElements ?? 0
  const totalPages = pageData?.totalPages ?? 0

  const handleLimpiarFiltros = () => {
    setSearch("")
    setEstadoOperativoId(null)
    setCategoriaId(null)
    setTipoActivoId(null)
    setUbicacionId(null)
    setActivoFilter(null)
    setPage(0)
  }

  const handleExportarExcel = async () => {
    try {
      setIsExportingExcel(true)
      await exportarActivosDisponibilidadExcel({
        q: debouncedSearch.trim() || undefined,
        estadoOperativoId: estadoOperativoId || undefined,
        categoriaId: categoriaId || undefined,
        tipoActivoId: tipoActivoId || undefined,
        ubicacionId: ubicacionId || undefined,
        activo: activoFilter ?? undefined,
      })
      toast.success("Reporte de disponibilidad exportado a Excel correctamente.")
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al exportar el archivo Excel.",
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
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Disponibilidad y Estados Operativos
            </h1>
            <p className="text-xs text-muted-foreground">
              Reporte ejecutivo de disponibilidad técnica, condiciones de servicio y estado operativo de activos
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
      <DisponibilidadMetrics
        activos={activos}
        totalElements={totalElements}
      />

      {/* Barra de Filtros y Búsqueda */}
      <DisponibilidadFiltrosBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        estadoOperativoId={estadoOperativoId}
        onEstadoOperativoChange={(val) => {
          setEstadoOperativoId(val)
          setPage(0)
        }}
        categoriaId={categoriaId}
        onCategoriaChange={(val) => {
          setCategoriaId(val)
          setPage(0)
        }}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={(val) => {
          setTipoActivoId(val)
          setPage(0)
        }}
        ubicacionId={ubicacionId}
        onUbicacionChange={(val) => {
          setUbicacionId(val)
          setPage(0)
        }}
        activoFilter={activoFilter}
        onActivoFilterChange={(val) => {
          setActivoFilter(val)
          setPage(0)
        }}
        onLimpiarFiltros={handleLimpiarFiltros}
        onExportarExcel={handleExportarExcel}
        isExportingExcel={isExportingExcel}
      />

      {/* Tabla de Resultados con Paginación */}
      <DisponibilidadTable
        activos={activos}
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
        onActivoUpdated={() => refetch()}
      />
    </PageShell>
  )
}
export default DisponibilidadActivosPage
