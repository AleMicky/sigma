import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Package, RotateCcw } from "lucide-react"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"
import { ActivoCatalogoHeader } from "../components/catalogo/ActivoCatalogoHeader"
import { ActivoCatalogoListView } from "../components/catalogo/ActivoCatalogoListView"
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

  // Filter client-side by location and only include active assets (a.activo !== false)
  const activos = useMemo(() => {
    let list = rawActivos.filter((a) => a.activo !== false)
    if (ubicacionId !== ALL_UBICACIONES) {
      list = list.filter((a) => a.ubicacionId === ubicacionId)
    }
    return list
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
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <ActivoCatalogoHeader
        totalActivos={activos.length}
        queries={[activosQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* Toolbar */}
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

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        {activosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-2xl"
            className="p-0 space-y-3"
          />
        ) : activosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(activosQuery.error)}
            className="text-destructive my-auto"
          />
        ) : activos.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para los filtros seleccionados"
                : "Catálogo vacío"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los términos de búsqueda o cambiar los filtros seleccionados."
                : "Aún no se han registrado activos vigentes en el sistema."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : undefined
            }
            className="my-auto"
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pr-1",
                activosQuery.isFetching && "opacity-75 transition-opacity",
              )}
            >
              <ActivoCatalogoListView
                activos={activos}
                tiposById={tiposById}
                ubicacionesById={ubicacionesById}
              />
            </div>

            {activosQuery.data ? (
              <Pagination
                page={activosQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-2 bg-transparent shrink-0"
              />
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  )
}
