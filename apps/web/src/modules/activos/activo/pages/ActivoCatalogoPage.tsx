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
import { EMPTY_ACTIVO_RESUMEN } from "../api/activo.service"
import { ActivoKpiCards } from "../components/ActivoKpiCards"
import { ActivoCatalogoContentSection } from "../components/catalogo/ActivoCatalogoContentSection"
import { ActivoCatalogoHeader } from "../components/catalogo/ActivoCatalogoHeader"
import { ActivoCatalogoToolbar } from "../components/catalogo/ActivoCatalogoToolbar"
import {
  ALL_TIPOS,
  ALL_UBICACIONES,
  buildActivoListFilters,
  buildActivoResumenFilters,
} from "../lib/catalogo.utils"

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

  const listFilters = useMemo(
    () =>
      buildActivoListFilters({
        page: search.page,
        size: PAGE_SIZE,
        search: search.debouncedSearch,
        tipoActivoId,
        ubicacionId,
      }),
    [search.page, search.debouncedSearch, tipoActivoId, ubicacionId],
  )

  const resumenFilters = useMemo(
    () => buildActivoResumenFilters(listFilters),
    [listFilters],
  )

  const activosQuery = useQuery(activoQueries.list(listFilters))
  const resumenQuery = useQuery(activoQueries.resumen(resumenFilters))

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  const activos = useMemo(
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
        totalActivos={resumenQuery.data?.total}
        queries={[activosQuery, resumenQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* KPI Summary Cards — agregados calculados en servidor */}
      <ActivoKpiCards stats={resumenQuery.data ?? EMPTY_ACTIVO_RESUMEN} />

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
