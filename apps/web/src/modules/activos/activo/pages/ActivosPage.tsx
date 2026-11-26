import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { appConfig } from "@/app/config"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { PageShell } from "@/shared/components/page-shell"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useCanManageActivos } from "@/modules/activos/lib/use-can-manage-activos"

import { activoQueries } from "../api/activo.queries"
import {
  EMPTY_ACTIVO_RESUMEN,
  exportarActivosDisponibilidadExcel,
  type Activo,
} from "../api/activo.service"
import { ActivoContentSection } from "../components/ActivoContentSection"
import { ActivoFilterToolbar, type StatusFilter } from "../components/ActivoFilterToolbar"
import { ActivoHeader } from "../components/ActivoHeader"
import { ActivoKpiCards } from "../components/ActivoKpiCards"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

function getActivoFilterParam(statusFilter: StatusFilter): boolean | undefined {
  if (statusFilter === "active") return true
  if (statusFilter === "inactive") return false
  return undefined
}

function buildActivoQueryParams(
  page: number,
  tipoActivoId: string,
  statusFilter: StatusFilter,
  searchQuery?: string,
) {
  const activoParam = getActivoFilterParam(statusFilter)
  return {
    page,
    size: PAGE_SIZE,
    sortBy: "nombre",
    direction: "ASC" as const,
    ...(tipoActivoId !== ALL_TIPOS ? { tipoActivoId } : {}),
    ...(activoParam !== undefined ? { activo: activoParam } : {}),
    ...(searchQuery ? { q: searchQuery } : {}),
  }
}

function checkHasActiveFilters(
  searchQuery: string,
  tipoActivoId: string,
  statusFilter: StatusFilter,
): boolean {
  return (
    searchQuery.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    statusFilter !== "all"
  )
}

export function ActivosPage() {
  const navigate = useNavigate()
  const canManage = useCanManageActivos()
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isExportingExcel, setIsExportingExcel] = useState(false)

  const search = usePaginatedSearch({ resetKey: `${tipoActivoId}-${statusFilter}` })

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tipos = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content],
  )
  const tiposById = useMemo(
    () => new Map(tipos.map((tipo) => [tipo.id, tipo])),
    [tipos],
  )
  const ubicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )
  const ubicacionesById = useMemo(
    () => new Map(ubicaciones.map((u) => [u.id, u])),
    [ubicaciones],
  )

  const queryParams = useMemo(
    () =>
      buildActivoQueryParams(
        search.page,
        tipoActivoId,
        statusFilter,
        search.query,
      ),
    [search.page, tipoActivoId, statusFilter, search.query],
  )

  const activosQuery = useQuery(activoQueries.list(queryParams))

  const resumenFilters = useMemo(
    () => ({
      q: search.query || undefined,
      tipoActivoId: tipoActivoId !== ALL_TIPOS ? tipoActivoId : undefined,
      activo: getActivoFilterParam(statusFilter),
    }),
    [search.query, tipoActivoId, statusFilter],
  )
  const resumenQuery = useQuery(activoQueries.resumen(resumenFilters))

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  // Los KPI vienen del servidor con los mismos filtros, no de la página actual.
  const kpiStats = resumenQuery.data ?? EMPTY_ACTIVO_RESUMEN

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  function goCreate() {
    void navigate({
      to: "/activos/registro-activo/nuevo",
      search: {
        tipoActivoId:
          tipoActivoId !== ALL_TIPOS
            ? tipoActivoId
            : undefined,
      },
    })
  }

  function goEdit(activo: Activo) {
    void navigate({
      to: "/activos/registro-activo/$activoId/editar",
      params: { activoId: activo.id },
    })
  }

  function resetFilters() {
    search.setSearch("")
    setTipoActivoId(ALL_TIPOS)
    setStatusFilter("all")
    search.setPage(0)
  }

  function handleTipoActivoChange(val: string) {
    setTipoActivoId(val)
    search.setPage(0)
  }

  function handleStatusFilterChange(st: StatusFilter) {
    setStatusFilter(st)
    search.setPage(0)
  }

  async function handleExportarExcel() {
    if (isExportingExcel) return

    try {
      setIsExportingExcel(true)
      await exportarActivosDisponibilidadExcel({
        q: search.query?.trim() || undefined,
        tipoActivoId:
          tipoActivoId !== ALL_TIPOS ? tipoActivoId : undefined,
        activo: getActivoFilterParam(statusFilter),
      })
      toast.success("Reporte de activos exportado a Excel correctamente.")
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al exportar el archivo Excel.",
      )
    } finally {
      setIsExportingExcel(false)
    }
  }

  const hasActiveFilters = checkHasActiveFilters(
    search.search,
    tipoActivoId,
    statusFilter,
  )

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Header */}
      <ActivoHeader
        totalActivos={activosQuery.data?.totalElements}
        onCreate={goCreate}
        canManage={canManage}
        queries={[activosQuery, resumenQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* KPI Summary Cards — solo se muestran cifras del servidor */}
      <ActivoKpiCards
        stats={kpiStats}
        isLoading={resumenQuery.isLoading}
        isError={resumenQuery.isError}
      />

      {/* Filter Toolbar with Status Tabs & View Switcher */}
      <ActivoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={handleTipoActivoChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        statusCounts={
          resumenQuery.data
            ? {
                all: kpiStats.total,
                active: kpiStats.total - kpiStats.deBaja,
                inactive: kpiStats.deBaja,
              }
            : undefined
        }
        tipos={tipos}
        tiposById={tiposById}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportarExcel={handleExportarExcel}
        isExportingExcel={isExportingExcel}
      />

      {/* Main Content Area */}
      <div className="flex flex-col pt-1">
        <ActivoContentSection
          isLoading={activosQuery.isLoading}
          isFetching={activosQuery.isFetching}
          isError={activosQuery.isError}
          error={activosQuery.error}
          activos={activos}
          hasActiveFilters={hasActiveFilters}
          viewMode={viewMode}
          tiposById={tiposById}
          ubicacionesById={ubicacionesById}
          pageData={activosQuery.data}
          onPageChange={search.setPage}
          onResetFilters={resetFilters}
          onCreate={goCreate}
          onEdit={goEdit}
          onRetry={() => void activosQuery.refetch()}
          canManage={canManage}
        />
      </div>
    </PageShell>
  )
}
