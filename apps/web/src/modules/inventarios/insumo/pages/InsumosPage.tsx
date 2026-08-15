import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Package, Plus, RotateCcw } from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { categoriaInsumoQueries } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.queries"
import { tipoInsumoQueries } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.queries"
import { unidadMedidaQueries } from "@/modules/parametros/unidad-medida/api/unidad-medida.queries"

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

import { insumoQueries } from "../api/insumo.queries"
import type { Insumo } from "../api/insumo.service"
import { InsumoCard } from "../components/InsumoCard"
import { InsumoFilterToolbar } from "../components/InsumoFilterToolbar"
import { InsumoHeader } from "../components/InsumoHeader"
import { InsumoQuickViewSheet } from "../components/InsumoQuickViewSheet"
import { InsumoTableView } from "../components/InsumoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_ITEMS = "__all__"

export function InsumosPage() {
  const navigate = useNavigate()
  const [tipoInsumoId, setTipoInsumoId] = useState<string>(ALL_ITEMS)
  const [categoriaInsumoId, setCategoriaInsumoId] = useState<string>(ALL_ITEMS)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [quickViewItem, setQuickViewItem] = useState<Insumo | null>(null)

  const search = usePaginatedSearch({
    resetKey: `${tipoInsumoId}-${categoriaInsumoId}`,
  })

  // Fetch Tipos de Insumo
  const tiposQuery = useQuery(
    tipoInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const tipos = tiposQuery.data?.content ?? []
  const tiposById = useMemo(
    () => new Map(tipos.map((t) => [t.id, t])),
    [tipos],
  )

  // Fetch Categorias de Insumo
  const categoriasQuery = useQuery(
    categoriaInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const categorias = categoriasQuery.data?.content ?? []
  const categoriasById = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias],
  )

  // Fetch Unidades de Medida
  const unidadesMedidaQuery = useQuery(
    unidadMedidaQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const unidadesMedida = unidadesMedidaQuery.data?.content ?? []
  const unidadesMedidaById = useMemo(
    () => new Map(unidadesMedida.map((u) => [u.id, u])),
    [unidadesMedida],
  )

  // Fetch Insumos
  const insumosQuery = useQuery(
    insumoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
      ...(tipoInsumoId !== ALL_ITEMS ? { tipoInsumoId } : {}),
      ...(categoriaInsumoId !== ALL_ITEMS ? { categoriaInsumoId } : {}),
    }),
  )

  const rawInsumos = insumosQuery.data?.content ?? []

  // Client-side fallback filter for additional safety
  const insumos = useMemo(() => {
    return rawInsumos.filter((item) => {
      if (tipoInsumoId !== ALL_ITEMS && item.tipoInsumoId !== tipoInsumoId)
        return false
      if (
        categoriaInsumoId !== ALL_ITEMS &&
        item.categoriaInsumoId !== categoriaInsumoId
      )
        return false
      return true
    })
  }, [rawInsumos, tipoInsumoId, categoriaInsumoId])

  useClampPage(search.page, search.setPage, insumosQuery.data?.totalPages)

  function goCreate() {
    void navigate({
      to: routes.inventarios.nuevo as any,
    })
  }

  function goEdit(insumo: Insumo) {
    void navigate({
      to: routes.inventarios.editar(insumo.id) as any,
    })
  }

  function resetFilters() {
    search.setSearch("")
    setTipoInsumoId(ALL_ITEMS)
    setCategoriaInsumoId(ALL_ITEMS)
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoInsumoId !== ALL_ITEMS ||
    categoriaInsumoId !== ALL_ITEMS

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0 flex flex-col">
      {/* Header with KPI metrics */}
      <InsumoHeader
        totalInsumos={insumosQuery.data?.totalElements ?? rawInsumos.length}
        totalTipos={tipos.length}
        totalCategorias={categorias.length}
        insumos={rawInsumos}
        onCreate={goCreate}
      />

      {/* Filter and View Mode Toolbar */}
      <InsumoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipoInsumoId={tipoInsumoId}
        onTipoInsumoChange={(val) => {
          setTipoInsumoId(val)
          search.setPage(0)
        }}
        categoriaInsumoId={categoriaInsumoId}
        onCategoriaInsumoChange={(val) => {
          setCategoriaInsumoId(val)
          search.setPage(0)
        }}
        tipos={tipos}
        categorias={categorias}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        {insumosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        ) : insumosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(insumosQuery.error)}
            className="text-destructive my-auto"
          />
        ) : insumos.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para la búsqueda"
                : "No hay insumos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los filtros seleccionados o el término de búsqueda."
                : "Comienza registrando el primer insumo o material de tu inventario."
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
                  Nuevo Insumo
                </Button>
              )
            }
            className="my-auto"
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                insumosQuery.isFetching && "opacity-75 transition-opacity",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {insumos.map((insumo) => (
                    <InsumoCard
                      key={insumo.id}
                      insumo={insumo}
                      tipoInsumo={tiposById.get(insumo.tipoInsumoId)}
                      categoria={categoriasById.get(insumo.categoriaInsumoId)}
                      unidadMedida={unidadesMedidaById.get(insumo.unidadMedidaId)}
                      onEdit={goEdit}
                      onQuickView={(item) => setQuickViewItem(item)}
                    />
                  ))}
                </ul>
              ) : (
                <InsumoTableView
                  insumos={insumos}
                  tiposById={tiposById}
                  categoriasById={categoriasById}
                  unidadesMedidaById={unidadesMedidaById}
                  onEdit={goEdit}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              )}
            </div>

            {insumosQuery.data ? (
              <Pagination
                page={insumosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Quick View Side Sheet */}
      <InsumoQuickViewSheet
        insumo={quickViewItem}
        tipoInsumo={
          quickViewItem ? tiposById.get(quickViewItem.tipoInsumoId) : undefined
        }
        categoria={
          quickViewItem
            ? categoriasById.get(quickViewItem.categoriaInsumoId)
            : undefined
        }
        unidadMedida={
          quickViewItem
            ? unidadesMedidaById.get(quickViewItem.unidadMedidaId)
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
