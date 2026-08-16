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
import { ActivoCard } from "../components/ActivoCard"
import { ActivoFilterToolbar } from "../components/ActivoFilterToolbar"
import { ActivoHeader } from "../components/ActivoHeader"
import { ActivoQuickViewSheet } from "../components/ActivoQuickViewSheet"
import { ActivoTableView } from "../components/ActivoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

export function ActivosPage() {
  const navigate = useNavigate()
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [quickViewItem, setQuickViewItem] = useState<Activo | null>(null)

  const search = usePaginatedSearch({ resetKey: tipoActivoId })

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

  const activos = useMemo(() => {
    if (tipoActivoId === ALL_TIPOS) return rawActivos
    return rawActivos.filter((item) => item.tipoActivoId === tipoActivoId)
  }, [rawActivos, tipoActivoId])

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
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 || tipoActivoId !== ALL_TIPOS

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0 flex flex-col">
      {/* Extracted Header Component */}
      <ActivoHeader
        totalActivos={activosQuery.data?.totalElements ?? rawActivos.length}
        totalTipos={tipos.length}
        activos={rawActivos}
        onCreate={goCreate}
      />

      {/* Extracted Filter & View Toolbar Component */}
      <ActivoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoActivoId={tipoActivoId}
        onTipoActivoChange={(val) => {
          setTipoActivoId(val)
          search.setPage(0)
        }}
        tipos={tipos}
        tiposById={tiposById}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        {activosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                ? "Prueba a modificar los términos de búsqueda o cambiar el tipo de activo seleccionado."
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
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {activos.map((activo) => (
                    <ActivoCard
                      key={activo.id}
                      activo={activo}
                      tipoActivo={tiposById.get(activo.tipoActivoId)}
                      ubicacion={
                        activo.ubicacionId
                          ? ubicacionesById.get(activo.ubicacionId)
                          : undefined
                      }
                      onEdit={goEdit}
                      onQuickView={(item) => setQuickViewItem(item)}
                    />
                  ))}
                </ul>
              ) : (
                <ActivoTableView
                  activos={activos}
                  tiposById={tiposById}
                  ubicacionesById={ubicacionesById}
                  onEdit={goEdit}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              )}
            </div>

            {activosQuery.data ? (
              <Pagination
                page={activosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-2.5"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Quick View Side Sheet */}
      <ActivoQuickViewSheet
        activo={quickViewItem}
        tipoActivo={
          quickViewItem
            ? tiposById.get(quickViewItem.tipoActivoId)
            : undefined
        }
        ubicacion={
          quickViewItem?.ubicacionId
            ? ubicacionesById.get(quickViewItem.ubicacionId)
            : undefined
        }
        open={Boolean(quickViewItem)}
        onOpenChange={(open) => {
          if (!open) setQuickViewItem(null)
        }}
        onEdit={goEdit}
      />
    </PageShell>
  )
}
