import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
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

import { useDeleteCategoria } from "../api/categoria.mutations"
import { categoriaQueries } from "../api/categoria.queries"
import type { Categoria } from "../api/categoria.service"
import { CategoriaCard } from "../components/CategoriaCard"
import {
  CategoriaFilterToolbar,
  type ViewMode,
} from "../components/CategoriaFilterToolbar"
import { CategoriaFormDialog } from "../components/CategoriaFormDialog"
import { CategoriaHelpModal } from "../components/CategoriaHelpModal"
import { CategoriaQuickViewSheet } from "../components/CategoriaQuickViewSheet"
import { CategoriaStats } from "../components/CategoriaStats"
import { CategoriaTableView } from "../components/CategoriaTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CategoriasPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [quickView, setQuickView] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState<Categoria | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteCategoria()

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

  // Stats calculation
  const conDescripcionCount = useMemo(
    () => categorias.filter((c) => Boolean(c.descripcion?.trim())).length,
    [categorias],
  )
  const maxOrden = useMemo(
    () => (categorias.length > 0 ? Math.max(...categorias.map((c) => c.orden)) : 0),
    [categorias],
  )

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

  const hasActiveFilters = Boolean(search.search.trim())

  function resetFilters() {
    search.setSearch("")
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Compact Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Categorías de Activos
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="h-7 px-2 text-xs"
              >
                <HelpCircle className="size-3.5 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
              <Button size="sm" type="button" onClick={openCreate} className="h-7 px-2 text-xs">
                <Plus className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Parametriza y organiza los niveles de clasificación técnica y contable de los activos.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="h-8 gap-1.5 px-2.5 text-xs border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>Guía de Categorías</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Categoría</span>
          </Button>
        </div>
      </header>

      {/* Compact Stats Cards Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <CategoriaStats
          totalCount={categoriasQuery.data?.totalElements}
          conDescripcionCount={conDescripcionCount}
          maxOrden={maxOrden}
          isLoading={categoriasQuery.isLoading}
        />
      </div>

      {/* Compact Filter Toolbar */}
      <CategoriaFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {categoriasQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName={
              viewMode === "grid" ? "h-24 rounded-lg" : "h-10 rounded-md"
            }
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "flex flex-col gap-1.5"
            }
          />
        ) : categoriasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(categoriasQuery.error)}
            className="text-destructive"
          />
        ) : categorias.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay categorías registradas"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea la primera categoría (ejemplo: COMPUTO, VEHICULOS) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Categoría
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                categoriasQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {categorias.map((item) => (
                    <CategoriaCard
                      key={item.id}
                      categoria={item}
                      onEdit={openEdit}
                      onQuickView={(c) => setQuickView(c)}
                      onDelete={(c) => setDeleting(c)}
                    />
                  ))}
                </ul>
              ) : (
                <CategoriaTableView
                  categorias={categorias}
                  onEdit={openEdit}
                  onQuickView={(c) => setQuickView(c)}
                  onDelete={(c) => setDeleting(c)}
                />
              )}
            </div>

            {categoriasQuery.data ? (
              <Pagination
                page={categoriasQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
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

      {/* Quick View Sheet */}
      <CategoriaQuickViewSheet
        categoria={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <CategoriaHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar categoría "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la parametrización de esta categoría del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
