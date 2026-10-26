import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { PageShell } from "@/shared/components/page-shell"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { activoQueries } from "../api/activo.queries"
import type { Activo } from "../api/activo.service"
import { ActivoKpiCards, type ActivoKpiStats } from "../components/ActivoKpiCards"
import { ActivoCatalogoContentSection } from "../components/catalogo/ActivoCatalogoContentSection"
import { ActivoCatalogoHeader } from "../components/catalogo/ActivoCatalogoHeader"
import {
  ActivoCatalogoToolbar,
  ALL_TIPOS,
  ALL_UBICACIONES,
} from "../components/catalogo/ActivoCatalogoToolbar"

const PAGE_SIZE = 12

function checkHasActiveFilters(
  searchQuery: string,
  tipoActivoId: string,
  ubicacionId: string,
): boolean {
  return (
    searchQuery.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    ubicacionId !== ALL_UBICACIONES
  )
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

function filterActivosByUbicacion(
  rawActivos: Activo[],
  ubicacionId: string,
): Activo[] {
  let list = rawActivos.filter((a) => a.activo !== false)
  if (ubicacionId !== ALL_UBICACIONES) {
    list = list.filter((a) => a.ubicacionId === ubicacionId)
  }
  return list
}

export function ActivoCatalogoPage() {
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [ubicacionId, setUbicacionId] = useState<string>(ALL_UBICACIONES)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const search = usePaginatedSearch({
    resetKey: `${tipoActivoId}-${ubicacionId}`,
  })

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

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      q: search.debouncedSearch.trim() || undefined,
      tipoActivoId: tipoActivoId === ALL_TIPOS ? undefined : tipoActivoId,
      sortBy: "createdAt",
      direction: "DESC" as const,
    }),
    [search.page, search.debouncedSearch, tipoActivoId],
  )

  const activosQuery = useQuery(activoQueries.list(queryParams))

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  const rawActivos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const rawTipos = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content],
  )

  const tiposById = useMemo(
    () => new Map(rawTipos.map((t) => [t.id, t])),
    [rawTipos],
  )

  const rawUbicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )

  const ubicacionesById = useMemo(
    () => new Map(rawUbicaciones.map((u) => [u.id, u])),
    [rawUbicaciones],
  )

  const activos = useMemo(
    () => filterActivosByUbicacion(rawActivos, ubicacionId),
    [rawActivos, ubicacionId],
  )

  const kpiStats = useMemo(
    () => computeActivoKpiStats(rawActivos, activosQuery.data?.totalElements),
    [rawActivos, activosQuery.data?.totalElements],
  )

  function resetFilters() {
    search.setSearch("")
    setTipoActivoId(ALL_TIPOS)
    setUbicacionId(ALL_UBICACIONES)
    search.setPage(0)
  }

  function handleTipoActivoChange(val: string) {
    setTipoActivoId(val ?? ALL_TIPOS)
    search.setPage(0)
  }

  function handleUbicacionChange(val: string) {
    setUbicacionId(val ?? ALL_UBICACIONES)
    search.setPage(0)
  }

  const hasActiveFilters = checkHasActiveFilters(
    search.search,
    tipoActivoId,
    ubicacionId,
  )

  return (
    <PageShell size="full" padding="none" layout="auto" className="w-full space-y-4 pb-12">
      {/* Header */}
      <ActivoCatalogoHeader
        totalActivos={activosQuery.data?.totalElements ?? rawActivos.length}
        queries={[activosQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* KPI Summary Cards */}
      <ActivoKpiCards stats={kpiStats} />

      {/* Toolbar */}
      <ActivoCatalogoToolbar
        search={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={handleTipoActivoChange}
        ubicacionId={ubicacionId}
        onUbicacionChange={handleUbicacionChange}
        tipos={rawTipos}
        ubicaciones={rawUbicaciones}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area con las tarjetas de ActivoCatalogoListView (solo Ver Ficha) */}
      <div className="flex flex-col pt-1">
        <ActivoCatalogoContentSection
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
        />
      </div>
    </PageShell>
  )
}
