import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, Package, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { categoriaInsumoQueries } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.queries"
import { unidadMedidaQueries } from "@/modules/parametros/unidad-medida/api/unidad-medida.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { insumoQueries } from "../api/insumo.queries"
import type { Insumo } from "../api/insumo.service"
import { InsumoFormDrawer } from "../components/InsumoFormDrawer"
import { InsumoListView } from "../components/InsumoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function InsumosPage() {
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingInsumoId, setEditingInsumoId] = useState<string | null>(null)

  const search = usePaginatedSearch({
    resetKey: selectedCategoriaId,
  })

  // Fetch Categorías para el filtro y mapa
  const categoriasQuery = useQuery(
    categoriaInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const categorias = categoriasQuery.data?.content ?? []

  const categoriasById = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; codigo: string }>()
    categorias.forEach((c) => {
      map.set(c.id, { id: c.id, nombre: c.nombre, codigo: c.codigo })
    })
    return map
  }, [categorias])

  const selectedCategoria = useMemo(
    () => categorias.find((c) => c.id === selectedCategoriaId),
    [categorias, selectedCategoriaId],
  )

  // Fetch Unidades de Medida para mapa
  const unidadesMedidaQuery = useQuery(
    unidadMedidaQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const unidadesMedida = unidadesMedidaQuery.data?.content ?? []

  const unidadesMedidaById = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; simbolo?: string | null; codigo?: string }>()
    unidadesMedida.forEach((u) => {
      map.set(u.id, { id: u.id, nombre: u.nombre, simbolo: u.simbolo, codigo: u.codigo })
    })
    return map
  }, [unidadesMedida])

  // Fetch Insumos
  const insumosQuery = useQuery(
    insumoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
      ...(selectedCategoriaId ? { categoriaInsumoId: selectedCategoriaId } : {}),
    }),
  )

  const insumos = insumosQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    insumosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditingInsumoId(null)
    setDrawerOpen(true)
  }

  function openEdit(insumo: Insumo) {
    setEditingInsumoId(insumo.id)
    setDrawerOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Insumos y Materiales
            </h1>
            {insumosQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {insumosQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton
                queries={[insumosQuery, categoriasQuery, unidadesMedidaQuery]}
              />
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Catálogo maestro de bienes consumibles, repuestos, herramientas y especificaciones técnicas.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            queries={[insumosQuery, categoriasQuery, unidadesMedidaQuery]}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo Insumo
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar insumos"
          className="w-full flex-1 min-w-0"
        />

        <div className="w-full sm:w-72 shrink-0">
          <Select
            value={selectedCategoriaId || "ALL"}
            onValueChange={(val) => {
              setSelectedCategoriaId(val === "ALL" ? "" : (val ?? ""))
              search.setPage(0)
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/80 text-xs shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-primary shrink-0" />
                <SelectValue placeholder="Todas las categorías">
                  {selectedCategoria
                    ? `${selectedCategoria.nombre} (${selectedCategoria.codigo})`
                    : "Todas las categorías"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre} ({cat.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {insumosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : insumosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(insumosQuery.error)}
            className="text-destructive"
          />
        ) : insumos.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim() || selectedCategoriaId
                ? "Sin resultados para el filtro aplicado"
                : "No hay insumos registrados"
            }
            description={
              search.search.trim() || selectedCategoriaId
                ? "Prueba cambiando de categoría o borrando el término de búsqueda."
                : "Comienza registrando el primer insumo o material para tu inventario."
            }
            action={
              search.search.trim() || selectedCategoriaId ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    search.setSearch("")
                    setSelectedCategoriaId("")
                  }}
                  className="rounded-xl"
                >
                  Limpiar Filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="rounded-xl">
                  <Plus className="size-4" />
                  Nuevo Insumo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                insumosQuery.isFetching && "opacity-70",
              )}
            >
              <InsumoListView
                insumos={insumos}
                categoriasById={categoriasById}
                unidadesMedidaById={unidadesMedidaById}
                onEdit={openEdit}
              />
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

      <InsumoFormDrawer
        key={editingInsumoId ?? `new-insumo-${selectedCategoriaId}`}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        insumoId={editingInsumoId}
        defaultCategoriaId={selectedCategoriaId}
        onSuccess={() => {
          if (!editingInsumoId) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
