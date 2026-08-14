import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, LayoutGrid, List, Plus, RotateCcw, Tags } from "lucide-react"

import { appConfig } from "@/app/config"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
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

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import type { TipoActivo } from "../api/tipo-activo.service"
import { TipoActivoCard } from "../components/TipoActivoCard"
import { TipoActivoFormDialog } from "../components/TipoActivoFormDialog"
import { TipoActivoQuickViewSheet } from "../components/TipoActivoQuickViewSheet"
import { TipoActivoStats } from "../components/TipoActivoStats"
import { TipoActivoTableView } from "../components/TipoActivoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposActivoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoActivo | null>(null)
  const [quickViewItem, setQuickViewItem] = useState<TipoActivo | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("ALL")

  const search = usePaginatedSearch()

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const categoriasQuery = useQuery(
    categoriaQueries.list({
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const categorias = categoriasQuery.data?.content ?? []
  const categoriasById = useMemo(
    () =>
      new Map(
        categorias.map((categoria) => [categoria.id, categoria.nombre]),
      ),
    [categorias],
  )

  const rawTipos = tiposQuery.data?.content ?? []

  // Client-side category filtering if active
  const tipos = useMemo(() => {
    if (selectedCategoriaId === "ALL") return rawTipos
    return rawTipos.filter((item) => item.categoriaId === selectedCategoriaId)
  }, [rawTipos, selectedCategoriaId])

  useClampPage(search.page, search.setPage, tiposQuery.data?.totalPages)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoActivo: TipoActivo) {
    setEditing(tipoActivo)
    setDialogOpen(true)
  }

  function resetFilters() {
    search.setSearch("")
    setSelectedCategoriaId("ALL")
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 || selectedCategoriaId !== "ALL"

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0 flex flex-col">
      {/* Top Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:py-6 md:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Tags className="size-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Tipos de Activo
              </h1>
              <p className="text-sm text-muted-foreground">
                Catálogo de tipos para clasificar y estructurar activos en la plataforma.
              </p>
            </div>
          </div>

          <Button
            size="default"
            type="button"
            onClick={openCreate}
            className="shrink-0 self-start sm:self-auto shadow-xs font-medium"
          >
            <Plus className="size-4" />
            Nuevo Tipo de Activo
          </Button>
        </div>

        {/* Metrics Summary Row */}
        <TipoActivoStats
          totalTipos={tiposQuery.data?.totalElements ?? rawTipos.length}
          totalCategorias={categorias.length}
          tipos={rawTipos}
        />
      </header>

      {/* Filter and View Mode Toolbar */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between border-b">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchField
            value={search.search}
            onChange={search.setSearch}
            placeholder="Buscar por nombre o descripción…"
            aria-label="Buscar tipos de activo"
            className="w-full sm:max-w-xs"
          />

          <Select
            value={selectedCategoriaId}
            onValueChange={(val) => {
              setSelectedCategoriaId(val ?? "ALL")
              search.setPage(0)
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Todas las categorías" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="size-3.5" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-border/80 bg-muted/30 p-1">
          <Button
            size="icon-xs"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            onClick={() => setViewMode("grid")}
            title="Vista Cuadrícula"
            aria-label="Vista Cuadrícula"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="icon-xs"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            onClick={() => setViewMode("table")}
            title="Vista Lista"
            aria-label="Vista Lista"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        {tiposQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        ) : tiposQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposQuery.error)}
            className="text-destructive my-auto"
          />
        ) : tipos.length === 0 ? (
          <EmptyState
            icon={<Tags className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para la búsqueda"
                : "No hay tipos de activo registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los términos de búsqueda o los filtros seleccionados."
                : "Comienza creando tu primer tipo de activo para clasificar tu catálogo."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus className="size-4" />
                  Nuevo Tipo de Activo
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
                tiposQuery.isFetching && "opacity-75 transition-opacity",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {tipos.map((tipoActivo) => (
                    <TipoActivoCard
                      key={tipoActivo.id}
                      tipoActivo={tipoActivo}
                      categoriaNombre={categoriasById.get(tipoActivo.categoriaId)}
                      onEdit={openEdit}
                      onQuickView={(item) => setQuickViewItem(item)}
                    />
                  ))}
                </ul>
              ) : (
                <TipoActivoTableView
                  tipos={tipos}
                  categoriasById={categoriasById}
                  onEdit={openEdit}
                  onQuickView={(item) => setQuickViewItem(item)}
                />
              )}
            </div>

            {tiposQuery.data ? (
              <Pagination
                page={tiposQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog for Create/Edit */}
      <TipoActivoFormDialog
        key={editing?.id ?? "new-tipo-activo"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivo={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Side Sheet */}
      <TipoActivoQuickViewSheet
        tipoActivo={quickViewItem}
        open={Boolean(quickViewItem)}
        onOpenChange={(open) => {
          if (!open) setQuickViewItem(null)
        }}
        categoriaNombre={
          quickViewItem
            ? categoriasById.get(quickViewItem.categoriaId)
            : undefined
        }
        onEdit={openEdit}
      />
    </PageShell>
  )
}
