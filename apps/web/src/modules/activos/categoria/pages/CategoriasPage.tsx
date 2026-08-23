import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { categoriaQueries } from "../api/categoria.queries"
import type { Categoria } from "../api/categoria.service"
import { CategoriaFormDialog } from "../components/CategoriaFormDialog"
import { CategoriaListView } from "../components/CategoriaListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CategoriasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const search = usePaginatedSearch()

  const categoriasQuery = useQuery(
    categoriaQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const categorias = categoriasQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    categoriasQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(categoria: Categoria) {
    setEditing(categoria)
    setDialogOpen(true)
  }

  function resetFilters() {
    search.setSearch("")
    search.setPage(0)
  }

  const hasActiveFilters = search.search.trim().length > 0

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Categorías de Activos
            </h1>
            {categoriasQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {categoriasQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[categoriasQuery]} />
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
            Clasifica y organiza la jerarquía principal de los activos fijos de la empresa.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton queries={[categoriasQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nueva Categoría
          </Button>
        </div>
      </header>

      {/* Toolbar con buscador */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar categorías de activo"
          className="w-full flex-1 min-w-0"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {categoriasQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : categoriasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(categoriasQuery.error)}
            className="text-destructive"
          />
        ) : categorias.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para la búsqueda"
                : "No hay categorías de activos"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando el término de búsqueda."
                : "Comienza registrando la primera categoría para clasificar tus activos."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  Limpiar Búsqueda
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                  Crear Categoría
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                categoriasQuery.isFetching && "opacity-70",
              )}
            >
              <CategoriaListView
                categorias={categorias}
                onEdit={openEdit}
              />
            </div>

            {categoriasQuery.data ? (
              <Pagination
                page={categoriasQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      <CategoriaFormDialog
        key={editing?.id ?? "new-categoria"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoria={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
