import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Paperclip, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeleteAccesorio } from "../api/accesorio.mutations"
import { accesorioQueries } from "../api/accesorio.queries"
import type { Accesorio } from "../api/accesorio.service"
import { AccesorioCard } from "../components/AccesorioCard"
import {
  AccesorioFilterToolbar,
  type ViewMode,
} from "../components/AccesorioFilterToolbar"
import { AccesorioFormDialog } from "../components/AccesorioFormDialog"
import { AccesorioHelpModal } from "../components/AccesorioHelpModal"
import { AccesorioQuickViewSheet } from "../components/AccesorioQuickViewSheet"
import { AccesorioStats } from "../components/AccesorioStats"
import { AccesorioTableView } from "../components/AccesorioTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AccesoriosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Accesorio | null>(null)
  const [quickView, setQuickView] = useState<Accesorio | null>(null)
  const [deleting, setDeleting] = useState<Accesorio | null>(null)
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("ALL")

  const search = usePaginatedSearch({ resetKey: selectedCategoriaId })
  const deleteMutation = useDeleteAccesorio()

  const categoriasQuery = useQuery(
    categoriaQueries.list({ page: 0, size: 100, sortBy: "nombre", direction: "ASC" }),
  )
  const categorias = useMemo(
    () => categoriasQuery.data?.content ?? [],
    [categoriasQuery.data?.content],
  )

  const isFilteredByCategoria = selectedCategoriaId !== "ALL"

  const accesoriosQuery = useQuery(
    isFilteredByCategoria
      ? accesorioQueries.byCategoria(selectedCategoriaId, {
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        })
      : accesorioQueries.list({
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        }),
  )

  const rawAccesorios = accesoriosQuery.data?.content ?? []

  // Count stats
  const conDescripcionCount = useMemo(
    () => rawAccesorios.filter((a) => Boolean(a.descripcion?.trim())).length,
    [rawAccesorios],
  )

  useClampPage(
    search.page,
    search.setPage,
    accesoriosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(accesorio: Accesorio) {
    setEditing(accesorio)
    setDialogOpen(true)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || selectedCategoriaId !== "ALL",
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedCategoriaId("ALL")
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
              Accesorios de Activos
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                queries={[accesoriosQuery, categoriasQuery]}
              />
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
            Parametriza y gestiona los accesorios, periféricos y equipamiento secundario asociados a cada categoría.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            queries={[accesoriosQuery, categoriasQuery]}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="h-8 gap-1.5 px-2.5 text-xs border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>Guía de Accesorios</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Accesorio</span>
          </Button>
        </div>
      </header>

      {/* Compact Stats Cards Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <AccesorioStats
          totalCount={accesoriosQuery.data?.totalElements}
          tiposCount={categorias.length}
          conDescripcionCount={conDescripcionCount}
          isLoading={accesoriosQuery.isLoading}
        />
      </div>

      {/* Compact Filter Toolbar */}
      <AccesorioFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        selectedCategoriaId={selectedCategoriaId}
        onCategoriaChange={(val) => {
          setSelectedCategoriaId(val)
          search.setPage(0)
        }}
        categorias={categorias}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {accesoriosQuery.isLoading ? (
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
        ) : accesoriosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(accesoriosQuery.error)}
            className="text-destructive"
          />
        ) : rawAccesorios.length === 0 ? (
          <EmptyState
            icon={<Paperclip className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay accesorios registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o selecciona otra categoría."
                : "Crea el primer accesorio (ejemplo: GPS, EXTINTOR, RADIO) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Accesorio
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                accesoriosQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {rawAccesorios.map((item) => (
                    <AccesorioCard
                      key={item.id}
                      accesorio={item}
                      onEdit={openEdit}
                      onQuickView={(a) => setQuickView(a)}
                      onDelete={(a) => setDeleting(a)}
                    />
                  ))}
                </ul>
              ) : (
                <AccesorioTableView
                  accesorios={rawAccesorios}
                  onEdit={openEdit}
                  onQuickView={(a) => setQuickView(a)}
                  onDelete={(a) => setDeleting(a)}
                />
              )}
            </div>

            {accesoriosQuery.data ? (
              <Pagination
                page={accesoriosQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AccesorioFormDialog
        key={editing?.id ?? "new-accesorio"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoriaId={selectedCategoriaId !== "ALL" ? selectedCategoriaId : undefined}
        accesorio={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <AccesorioQuickViewSheet
        accesorio={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <AccesorioHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar accesorio "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará el accesorio de la parametrización del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
