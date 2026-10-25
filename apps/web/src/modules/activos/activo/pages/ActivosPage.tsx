import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { appConfig } from "@/app/config"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { PageShell } from "@/shared/components/page-shell"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { activoQueries } from "../api/activo.queries"
import type { Activo } from "../api/activo.service"
import { ActivoContentSection } from "../components/ActivoContentSection"
import { ActivoFilterToolbar, type StatusFilter } from "../components/ActivoFilterToolbar"
import { ActivoHeader } from "../components/ActivoHeader"
import { ActivoKpiCards, type ActivoKpiStats } from "../components/ActivoKpiCards"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

function getActivoFilterParam(statusFilter: StatusFilter): boolean | undefined {
  if (statusFilter === "active") return true
  if (statusFilter === "inactive") return false
  return undefined
}

function isOperativoActivo(activo: Activo): boolean {
  const nombre = activo.estadoOperativo?.nombre?.toLowerCase() ?? ""
  if (nombre.includes("operativo")) return true
  return !nombre.includes("mantenimiento") && activo.activo !== false
}

function computeActivoKpiStats(
  activos: Activo[],
  totalElements?: number,
): ActivoKpiStats {
  const total = totalElements ?? activos.length
  const deBaja = activos.filter((a) => a.activo === false).length
  const enMantenimiento = activos.filter((a) =>
    a.estadoOperativo?.nombre?.toLowerCase().includes("mantenimiento"),
  ).length
  const operativos = activos.filter(isOperativoActivo).length

  return { total, deBaja, enMantenimiento, operativos }
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
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

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

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const kpiStats = useMemo(
    () => computeActivoKpiStats(activos, activosQuery.data?.totalElements),
    [activos, activosQuery.data?.totalElements],
  )

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  function goCreate() {
    void navigate({
      to: "/activos/nuevo",
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
      to: "/activos/$activoId/editar",
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
        queries={[activosQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* KPI Summary Cards */}
      <ActivoKpiCards stats={kpiStats} />

      {/* Filter Toolbar with Status Tabs & View Switcher */}
      <ActivoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={handleTipoActivoChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        tipos={tipos}
        tiposById={tiposById}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        />
      </div>
    </PageShell>
  )
}
