import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { HelpCircle, Plus, Ruler } from "lucide-react"

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

import { useDeleteUnidadMedida } from "../api/unidad-medida.mutations"
import { unidadMedidaQueries } from "../api/unidad-medida.queries"
import type { UnidadMedida } from "../api/unidad-medida.service"
import { UnidadMedidaCard } from "../components/UnidadMedidaCard"
import {
  UnidadMedidaFilterToolbar,
  type DecimalFilterMode,
  type ViewMode,
} from "../components/UnidadMedidaFilterToolbar"
import { UnidadMedidaFormDialog } from "../components/UnidadMedidaFormDialog"
import { UnidadMedidaHelpModal } from "../components/UnidadMedidaHelpModal"
import { UnidadMedidaQuickViewSheet } from "../components/UnidadMedidaQuickViewSheet"
import { UnidadMedidaStats } from "../components/UnidadMedidaStats"
import { UnidadMedidaTableView } from "../components/UnidadMedidaTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function UnidadesMedidaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<UnidadMedida | null>(null)
  const [quickView, setQuickView] = useState<UnidadMedida | null>(null)
  const [deleting, setDeleting] = useState<UnidadMedida | null>(null)
  const [decimalFilter, setDecimalFilter] = useState<DecimalFilterMode>("all")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteUnidadMedida()

  const unidadesQuery = useQuery(
    unidadMedidaQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const rawUnidades = unidadesQuery.data?.content ?? []

  // Filter client-side by decimal mode if selected
  const filteredUnidades = useMemo(() => {
    if (decimalFilter === "decimal") {
      return rawUnidades.filter((u) => u.permiteDecimal)
    }
    if (decimalFilter === "integer") {
      return rawUnidades.filter((u) => !u.permiteDecimal)
    }
    return rawUnidades
  }, [rawUnidades, decimalFilter])

  // Count stats
  const decimalCount = useMemo(
    () => rawUnidades.filter((u) => u.permiteDecimal).length,
    [rawUnidades],
  )
  const integerCount = useMemo(
    () => rawUnidades.filter((u) => !u.permiteDecimal).length,
    [rawUnidades],
  )

  useClampPage(
    search.page,
    search.setPage,
    unidadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(item: UnidadMedida) {
    setEditing(item)
    setDialogOpen(true)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || decimalFilter !== "all",
  )

  function resetFilters() {
    search.setSearch("")
    setDecimalFilter("all")
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
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Unidades de Medida
            </h1>
            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                onRefresh={() => unidadesQuery.refetch()}
                isRefreshing={unidadesQuery.isFetching}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
              <Button size="sm" type="button" onClick={openCreate}>
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra las unidades de medida utilizadas para cuantificar bienes, materiales y atributos.
          </p>
        </div>

        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            onRefresh={() => unidadesQuery.refetch()}
            isRefreshing={unidadesQuery.isFetching}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Unidades</span>
          </Button>

          <Button size="sm" type="button" onClick={openCreate} className="gap-1.5">
            <Plus className="size-4" />
            <span>Crear Unidad</span>
          </Button>
        </div>
      </header>

      {/* Stats Cards Section */}
      <div className="shrink-0 pt-4 pb-2">
        <UnidadMedidaStats
          totalCount={unidadesQuery.data?.totalElements}
          decimalCount={decimalCount}
          integerCount={integerCount}
          isLoading={unidadesQuery.isLoading}
        />
      </div>

      {/* Filter Toolbar */}
      <UnidadMedidaFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        decimalFilter={decimalFilter}
        onDecimalFilterChange={setDecimalFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-3">
        {unidadesQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName={viewMode === "grid" ? "h-32 rounded-xl" : "h-14 rounded-lg"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "flex flex-col gap-2"
            }
          />
        ) : unidadesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(unidadesQuery.error)}
            className="text-destructive"
          />
        ) : filteredUnidades.length === 0 ? (
          <EmptyState
            icon={<Ruler className="size-4 text-muted-foreground" />}
            title={hasActiveFilters ? "Sin resultados" : "No hay unidades de medida"}
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros."
                : "Crea la primera unidad de medida (ejemplo: KG, Meter, Pieza) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear Unidad
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                unidadesQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredUnidades.map((item) => (
                    <UnidadMedidaCard
                      key={item.id}
                      unidadMedida={item}
                      onEdit={openEdit}
                      onQuickView={(u) => setQuickView(u)}
                      onDelete={(u) => setDeleting(u)}
                    />
                  ))}
                </ul>
              ) : (
                <UnidadMedidaTableView
                  unidadesMedida={filteredUnidades}
                  onEdit={openEdit}
                  onQuickView={(u) => setQuickView(u)}
                  onDelete={(u) => setDeleting(u)}
                />
              )}
            </div>

            {unidadesQuery.data ? (
              <Pagination
                page={unidadesQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <UnidadMedidaFormDialog
        key={editing?.id ?? "new-unidad-medida"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unidadMedida={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <UnidadMedidaQuickViewSheet
        unidadMedida={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <UnidadMedidaHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar unidad de medida "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la definición de esta unidad del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
