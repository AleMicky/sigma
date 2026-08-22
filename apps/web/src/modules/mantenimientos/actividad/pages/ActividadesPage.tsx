import { useMemo, useState } from "react"
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

import { useDeleteActividad } from "../api/actividad.mutations"
import { actividadQueries } from "../api/actividad.queries"
import type { ActividadMantenimiento } from "../api/actividad.service"
import { ActividadAplicacionesSheet } from "../components/ActividadAplicacionesSheet"
import { ActividadCard } from "../components/ActividadCard"
import {
  ActividadFilterToolbar,
  type ViewMode,
} from "../components/ActividadFilterToolbar"
import { ActividadFormDialog } from "../components/ActividadFormDialog"
import { ActividadQuickViewSheet } from "../components/ActividadQuickViewSheet"
import { ActividadStats } from "../components/ActividadStats"
import { ActividadTableView } from "../components/ActividadTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ActividadesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ActividadMantenimiento | null>(null)
  const [quickView, setQuickView] = useState<ActividadMantenimiento | null>(null)
  const [managingApps, setManagingApps] =
    useState<ActividadMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<ActividadMantenimiento | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteActividad()

  const actividadesQuery = useQuery(
    actividadQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const actividades = actividadesQuery.data?.content ?? []

  const globalCount = useMemo(
    () => actividades.filter((item) => item.aplicaTodosTiposActivo).length,
    [actividades],
  )

  const checklistCount = useMemo(
    () => actividades.filter((item) => item.requiereChecklist).length,
    [actividades],
  )

  useClampPage(
    search.page,
    search.setPage,
    actividadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(actividad: ActividadMantenimiento) {
    setEditing(actividad)
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
              Actividades de Mantenimiento
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => actividadesQuery.refetch()}
                isRefreshing={actividadesQuery.isFetching}
              />
              <Button size="sm" type="button" onClick={openCreate} className="h-7 px-2 text-xs">
                <Plus className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Catálogo maestro de actividades de mantenimiento, alcance por tipo de activo y requisitos de checklist.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => actividadesQuery.refetch()}
            isRefreshing={actividadesQuery.isFetching}
          />

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Actividad</span>
          </Button>
        </div>
      </header>

      {/* Stats Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <ActividadStats
          totalCount={actividadesQuery.data?.totalElements}
          globalCount={globalCount}
          checklistCount={checklistCount}
          isLoading={actividadesQuery.isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <ActividadFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {actividadesQuery.isLoading ? (
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
        ) : actividadesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(actividadesQuery.error)}
            className="text-destructive"
          />
        ) : actividades.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay actividades de mantenimiento registradas"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea la primera actividad en el catálogo (ejemplo: Cambio de Aceite, Inspección de Frenos) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Actividad
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                actividadesQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {actividades.map((item) => (
                    <ActividadCard
                      key={item.id}
                      actividad={item}
                      onEdit={openEdit}
                      onQuickView={(a) => setQuickView(a)}
                      onManageAplicaciones={(a) => setManagingApps(a)}
                      onDelete={(a) => setDeleting(a)}
                    />
                  ))}
                </ul>
              ) : (
                <ActividadTableView
                  actividades={actividades}
                  onEdit={openEdit}
                  onQuickView={(a) => setQuickView(a)}
                  onManageAplicaciones={(a) => setManagingApps(a)}
                  onDelete={(a) => setDeleting(a)}
                />
              )}
            </div>

            {actividadesQuery.data ? (
              <Pagination
                page={actividadesQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <ActividadFormDialog
        key={editing?.id ?? "new-actividad"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actividad={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <ActividadQuickViewSheet
        actividad={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
        onManageAplicaciones={(a) => setManagingApps(a)}
      />

      {/* Manage Applications Sheet */}
      <ActividadAplicacionesSheet
        actividad={managingApps}
        open={Boolean(managingApps)}
        onOpenChange={(open) => !open && setManagingApps(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar actividad "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la actividad y sus configuraciones asociadas."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
