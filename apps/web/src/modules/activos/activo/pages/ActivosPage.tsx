import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Package, Plus, RotateCcw } from "lucide-react"

import { appConfig } from "@/app/config"
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
import type { Activo } from "../api/activo.service"
import { ActivoFilterToolbar, type StatusFilter } from "../components/ActivoFilterToolbar"
import { ActivoHeader } from "../components/ActivoHeader"
import { ActivoListView } from "../components/ActivoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

export function ActivosPage() {
  const navigate = useNavigate()
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

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

  const tipos = tiposQuery.data?.content ?? []
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

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(tipoActivoId !== ALL_TIPOS ? { tipoActivoId } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const rawActivos = activosQuery.data?.content ?? []

  const statusCounts = useMemo(() => {
    const list =
      tipoActivoId === ALL_TIPOS
        ? rawActivos
        : rawActivos.filter((item) => item.tipoActivoId === tipoActivoId)
    return {
      all: list.length,
      active: list.filter((item) => item.activo !== false).length,
      inactive: list.filter((item) => item.activo === false).length,
    }
  }, [rawActivos, tipoActivoId])

  const activos = useMemo(() => {
    let list = rawActivos
    if (tipoActivoId !== ALL_TIPOS) {
      list = list.filter((item) => item.tipoActivoId === tipoActivoId)
    }
    if (statusFilter === "active") {
      list = list.filter((item) => item.activo !== false)
    } else if (statusFilter === "inactive") {
      list = list.filter((item) => item.activo === false)
    }
    return list
  }, [rawActivos, tipoActivoId, statusFilter])

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

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    statusFilter !== "all"

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <ActivoHeader
        totalActivos={activosQuery.data?.totalElements}
        onCreate={goCreate}
        queries={[activosQuery, tiposQuery, ubicacionesQuery]}
      />

      {/* Filter Toolbar with Status Tabs */}
      <ActivoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={(val) => {
          setTipoActivoId(val)
          search.setPage(0)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st)
          search.setPage(0)
        }}
        statusCounts={statusCounts}
        tipos={tipos}
        tiposById={tiposById}
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
                ? "Sin resultados para la búsqueda"
                : "No hay activos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los filtros seleccionados o el estado (Alta / Baja)."
                : "Comienza a registrar tu inventario creando el primer activo."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={goCreate}>
                  <Plus className="size-4" />
                  Nuevo Activo
                </Button>
              )
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
              <ActivoListView
                activos={activos}
                tiposById={tiposById}
                ubicacionesById={ubicacionesById}
                onEdit={goEdit}
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
