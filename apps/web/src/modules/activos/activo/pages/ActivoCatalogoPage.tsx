import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { PageShell } from "@/shared/components/page-shell"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { activoQueries } from "../api/activo.queries"
import { ActivoCatalogoGrid } from "../components/catalogo/ActivoCatalogoGrid"
import { ActivoCatalogoHeader } from "../components/catalogo/ActivoCatalogoHeader"
import {
  ActivoCatalogoToolbar,
  ALL_TIPOS,
  ALL_UBICACIONES,
} from "../components/catalogo/ActivoCatalogoToolbar"

const PAGE_SIZE = 12

export function ActivoCatalogoPage() {
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [ubicacionId, setUbicacionId] = useState<string>(ALL_UBICACIONES)

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

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      q: search.debouncedSearch.trim() || undefined,
      tipoActivoId: tipoActivoId === ALL_TIPOS ? undefined : tipoActivoId,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )

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

  // Filter client-side by location if chosen
  const activos = useMemo(() => {
    if (ubicacionId === ALL_UBICACIONES) return rawActivos
    return rawActivos.filter((a) => a.ubicacionId === ubicacionId)
  }, [rawActivos, ubicacionId])

  function resetFilters() {
    search.setSearch("")
    setTipoActivoId(ALL_TIPOS)
    setUbicacionId(ALL_UBICACIONES)
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    ubicacionId !== ALL_UBICACIONES

  return (
    <PageShell size="xl" layout="fill" padding="compact">
      {/* Visual Catalog Header & Filter Bar */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <ActivoCatalogoHeader
          totalActivos={activosQuery.data?.totalElements ?? rawActivos.length}
          totalTipos={rawTipos.length}
        />

        <ActivoCatalogoToolbar
          search={search.search}
          onSearchChange={search.setSearch}
          tipoActivoId={tipoActivoId}
          onTipoActivoChange={(val) => {
            setTipoActivoId(val ?? ALL_TIPOS)
            search.setPage(0)
          }}
          ubicacionId={ubicacionId}
          onUbicacionChange={(val) => {
            setUbicacionId(val ?? ALL_UBICACIONES)
            search.setPage(0)
          }}
          tipos={rawTipos}
          ubicaciones={rawUbicaciones}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
      </header>

      {/* Visual Catalog Grid */}
      <ActivoCatalogoGrid
        isLoading={activosQuery.isLoading}
        isFetching={activosQuery.isFetching}
        isError={activosQuery.isError}
        errorMessage={getErrorMessage(activosQuery.error)}
        activos={activos}
        tiposById={tiposById}
        ubicacionesById={ubicacionesById}
        pageData={activosQuery.data}
        onPageChange={search.setPage}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />
    </PageShell>
  )
}
