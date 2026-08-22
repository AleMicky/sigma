import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Plus, Wrench } from "lucide-react"

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

import { useDeleteTipoMantenimiento } from "../api/tipo-mantenimiento.mutations"
import { tipoMantenimientoQueries } from "../api/tipo-mantenimiento.queries"
import type { TipoMantenimiento } from "../api/tipo-mantenimiento.service"
import { TipoMantenimientoCard } from "../components/TipoMantenimientoCard"
import {
  TipoMantenimientoFilterToolbar,
  type ViewMode,
} from "../components/TipoMantenimientoFilterToolbar"
import { TipoMantenimientoFormDialog } from "../components/TipoMantenimientoFormDialog"
import { TipoMantenimientoHelpModal } from "../components/TipoMantenimientoHelpModal"
import { TipoMantenimientoQuickViewSheet } from "../components/TipoMantenimientoQuickViewSheet"
import { TipoMantenimientoStats } from "../components/TipoMantenimientoStats"
import { TipoMantenimientoTableView } from "../components/TipoMantenimientoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposMantenimientoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<TipoMantenimiento | null>(null)
  const [quickView, setQuickView] = useState<TipoMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<TipoMantenimiento | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteTipoMantenimiento()

  const tiposMantenimientoQuery = useQuery(
    tipoMantenimientoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tiposMantenimiento = tiposMantenimientoQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    tiposMantenimientoQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoMantenimiento: TipoMantenimiento) {
    setEditing(tipoMantenimiento)
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
              Tipos de Mantenimiento
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => tiposMantenimientoQuery.refetch()}
                isRefreshing={tiposMantenimientoQuery.isFetching}
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
            Parametriza y estandariza las modalidades de trabajo de mantenimiento para los activos.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => tiposMantenimientoQuery.refetch()}
            isRefreshing={tiposMantenimientoQuery.isFetching}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="h-8 gap-1.5 px-2.5 text-xs border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>Guía de Tipos</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Tipo</span>
          </Button>
        </div>
      </header>

      {/* Compact Stats Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <TipoMantenimientoStats
          totalCount={tiposMantenimientoQuery.data?.totalElements}
          isLoading={tiposMantenimientoQuery.isLoading}
        />
      </div>

      {/* Compact Filter Toolbar */}
      <TipoMantenimientoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {tiposMantenimientoQuery.isLoading ? (
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
        ) : tiposMantenimientoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposMantenimientoQuery.error)}
            className="text-destructive"
          />
        ) : tiposMantenimiento.length === 0 ? (
          <EmptyState
            icon={<Wrench className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay tipos de mantenimiento registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea el primer tipo de mantenimiento (ejemplo: PREVENTIVO, CORRECTIVO) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Tipo de Mantenimiento
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                tiposMantenimientoQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {tiposMantenimiento.map((item) => (
                    <TipoMantenimientoCard
                      key={item.id}
                      tipoMantenimiento={item}
                      onEdit={openEdit}
                      onQuickView={(t) => setQuickView(t)}
                      onDelete={(t) => setDeleting(t)}
                    />
                  ))}
                </ul>
              ) : (
                <TipoMantenimientoTableView
                  tiposMantenimiento={tiposMantenimiento}
                  onEdit={openEdit}
                  onQuickView={(t) => setQuickView(t)}
                  onDelete={(t) => setDeleting(t)}
                />
              )}
            </div>

            {tiposMantenimientoQuery.data ? (
              <Pagination
                page={tiposMantenimientoQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <TipoMantenimientoFormDialog
        key={editing?.id ?? "new-tipo-mantenimiento"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoMantenimiento={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <TipoMantenimientoQuickViewSheet
        tipoMantenimiento={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <TipoMantenimientoHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar tipo de mantenimiento "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la parametrización de este tipo de mantenimiento del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
