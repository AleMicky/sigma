import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, HelpCircle, Plus } from "lucide-react"

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

import { useDeletePrioridad } from "../api/prioridad.mutations"
import { prioridadQueries } from "../api/prioridad.queries"
import type { Prioridad } from "../api/prioridad.service"
import { PrioridadCard } from "../components/PrioridadCard"
import {
  PrioridadFilterToolbar,
  type ViewMode,
} from "../components/PrioridadFilterToolbar"
import { PrioridadFormDialog } from "../components/PrioridadFormDialog"
import { PrioridadHelpModal } from "../components/PrioridadHelpModal"
import { PrioridadQuickViewSheet } from "../components/PrioridadQuickViewSheet"
import { PrioridadStats } from "../components/PrioridadStats"
import { PrioridadTableView } from "../components/PrioridadTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function PrioridadesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Prioridad | null>(null)
  const [quickView, setQuickView] = useState<Prioridad | null>(null)
  const [deleting, setDeleting] = useState<Prioridad | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeletePrioridad()

  const prioridadesQuery = useQuery(
    prioridadQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nivel",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const prioridades = prioridadesQuery.data?.content ?? []

  const criticaCount = useMemo(
    () => prioridades.filter((item) => item.nivel >= 4).length,
    [prioridades],
  )

  useClampPage(
    search.page,
    search.setPage,
    prioridadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(prioridad: Prioridad) {
    setEditing(prioridad)
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
              Prioridades de Mantenimiento
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
            Administra los niveles de urgencia y priorización para las solicitudes y órdenes de trabajo.
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
            <span>Guía de Niveles</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Prioridad</span>
          </Button>
        </div>
      </header>

      {/* Compact Stats Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <PrioridadStats
          totalCount={prioridadesQuery.data?.totalElements}
          criticaCount={criticaCount}
          isLoading={prioridadesQuery.isLoading}
        />
      </div>

      {/* Compact Filter Toolbar */}
      <PrioridadFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {prioridadesQuery.isLoading ? (
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
        ) : prioridadesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(prioridadesQuery.error)}
            className="text-destructive"
          />
        ) : prioridades.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay prioridades registradas"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea la primera prioridad de mantenimiento (ejemplo: ALTA, MEDIA, BAJA) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Prioridad
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                prioridadesQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {prioridades.map((item) => (
                    <PrioridadCard
                      key={item.id}
                      prioridad={item}
                      onEdit={openEdit}
                      onQuickView={(p) => setQuickView(p)}
                      onDelete={(p) => setDeleting(p)}
                    />
                  ))}
                </ul>
              ) : (
                <PrioridadTableView
                  prioridades={prioridades}
                  onEdit={openEdit}
                  onQuickView={(p) => setQuickView(p)}
                  onDelete={(p) => setDeleting(p)}
                />
              )}
            </div>

            {prioridadesQuery.data ? (
              <Pagination
                page={prioridadesQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <PrioridadFormDialog
        key={editing?.id ?? "new-prioridad"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prioridad={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <PrioridadQuickViewSheet
        prioridad={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <PrioridadHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar prioridad "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la parametrización de esta prioridad del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
