import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
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

import { useDeleteChecklist } from "../api/checklist.mutations"
import { checklistQueries } from "../api/checklist.queries"
import type { ChecklistMantenimiento } from "../api/checklist.service"
import { ChecklistCard } from "../components/ChecklistCard"
import {
  ChecklistFilterToolbar,
  type ViewMode,
} from "../components/ChecklistFilterToolbar"
import { ChecklistFormDialog } from "../components/ChecklistFormDialog"
import { ChecklistItemsDrawer } from "../components/ChecklistItemsDrawer"
import { ChecklistQuickViewSheet } from "../components/ChecklistQuickViewSheet"
import { ChecklistTableView } from "../components/ChecklistTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ChecklistsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ChecklistMantenimiento | null>(null)
  const [quickView, setQuickView] = useState<ChecklistMantenimiento | null>(null)
  const [managingItems, setManagingItems] =
    useState<ChecklistMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<ChecklistMantenimiento | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteChecklist()

  const checklistsQuery = useQuery(
    checklistQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const checklists = checklistsQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    checklistsQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(checklist: ChecklistMantenimiento) {
    setEditing(checklist)
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
      // Handled by toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Checklists de Mantenimiento
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => checklistsQuery.refetch()}
                isRefreshing={checklistsQuery.isFetching}
              />
              <Button size="sm" type="button" onClick={openCreate} className="h-7 px-2 text-xs">
                <Plus className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Plantillas de verificación de pasos, preguntas de inspección y validaciones técnicas para actividades.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => checklistsQuery.refetch()}
            isRefreshing={checklistsQuery.isFetching}
          />

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Checklist</span>
          </Button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <ChecklistFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {checklistsQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName={
              viewMode === "grid" ? "h-28 rounded-lg" : "h-10 rounded-md"
            }
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "flex flex-col gap-1.5"
            }
          />
        ) : checklistsQuery.isError ? (
          <EmptyState
            title={getErrorMessage(checklistsQuery.error)}
            className="text-destructive"
          />
        ) : checklists.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay checklists de mantenimiento registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea la primera plantilla de checklist para tus actividades de mantenimiento."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Checklist
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                checklistsQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {checklists.map((item) => (
                    <ChecklistCard
                      key={item.id}
                      checklist={item}
                      onEdit={openEdit}
                      onQuickView={(c) => setQuickView(c)}
                      onManageItems={(c) => setManagingItems(c)}
                      onDelete={(c) => setDeleting(c)}
                    />
                  ))}
                </ul>
              ) : (
                <ChecklistTableView
                  checklists={checklists}
                  onEdit={openEdit}
                  onQuickView={(c) => setQuickView(c)}
                  onManageItems={(c) => setManagingItems(c)}
                  onDelete={(c) => setDeleting(c)}
                />
              )}
            </div>

            {checklistsQuery.data ? (
              <Pagination
                page={checklistsQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <ChecklistFormDialog
        key={editing?.id ?? "new-checklist"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checklist={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <ChecklistQuickViewSheet
        checklist={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
        onManageItems={(c) => setManagingItems(c)}
      />

      {/* Checklist Items Drawer */}
      <ChecklistItemsDrawer
        checklist={managingItems}
        open={Boolean(managingItems)}
        onOpenChange={(open) => !open && setManagingItems(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar checklist "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminarán el checklist y todos sus ítems de verificación asociados."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
