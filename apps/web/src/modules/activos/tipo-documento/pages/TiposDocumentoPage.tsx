import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, HelpCircle, Plus } from "lucide-react"

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

import { useDeleteTipoDocumento } from "../api/tipo-documento.mutations"
import { tipoDocumentoQueries } from "../api/tipo-documento.queries"
import type { TipoDocumento } from "../api/tipo-documento.service"
import { TipoDocumentoCard } from "../components/TipoDocumentoCard"
import {
  TipoDocumentoFilterToolbar,
  type VencimientoFilterMode,
  type ViewMode,
} from "../components/TipoDocumentoFilterToolbar"
import { TipoDocumentoFormDialog } from "../components/TipoDocumentoFormDialog"
import { TipoDocumentoHelpModal } from "../components/TipoDocumentoHelpModal"
import { TipoDocumentoQuickViewSheet } from "../components/TipoDocumentoQuickViewSheet"
import { TipoDocumentoStats } from "../components/TipoDocumentoStats"
import { TipoDocumentoTableView } from "../components/TipoDocumentoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposDocumentoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<TipoDocumento | null>(null)
  const [quickView, setQuickView] = useState<TipoDocumento | null>(null)
  const [deleting, setDeleting] = useState<TipoDocumento | null>(null)
  const [vencimientoFilter, setVencimientoFilter] =
    useState<VencimientoFilterMode>("all")

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteTipoDocumento()

  const tiposDocumentoQuery = useQuery(
    tipoDocumentoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const rawTiposDocumento = tiposDocumentoQuery.data?.content ?? []

  // Client-side filtering by expiration requirement
  const filteredTiposDocumento = useMemo(() => {
    if (vencimientoFilter === "vencimiento") {
      return rawTiposDocumento.filter((item) => item.requiereVencimiento)
    }
    if (vencimientoFilter === "permanente") {
      return rawTiposDocumento.filter((item) => !item.requiereVencimiento)
    }
    return rawTiposDocumento
  }, [rawTiposDocumento, vencimientoFilter])

  // Count stats
  const vencimientoCount = useMemo(
    () => rawTiposDocumento.filter((item) => item.requiereVencimiento).length,
    [rawTiposDocumento],
  )
  const permanenteCount = useMemo(
    () => rawTiposDocumento.filter((item) => !item.requiereVencimiento).length,
    [rawTiposDocumento],
  )

  useClampPage(
    search.page,
    search.setPage,
    tiposDocumentoQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoDocumento: TipoDocumento) {
    setEditing(tipoDocumento)
    setDialogOpen(true)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || vencimientoFilter !== "all",
  )

  function resetFilters() {
    search.setSearch("")
    setVencimientoFilter("all")
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
              Tipos de Documento
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => tiposDocumentoQuery.refetch()}
                isRefreshing={tiposDocumentoQuery.isFetching}
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
            Parametriza y estandariza los tipos de documentos, garantías y pólizas de activos.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => tiposDocumentoQuery.refetch()}
            isRefreshing={tiposDocumentoQuery.isFetching}
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

      {/* Compact Stats Cards Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <TipoDocumentoStats
          totalCount={tiposDocumentoQuery.data?.totalElements}
          vencimientoCount={vencimientoCount}
          permanenteCount={permanenteCount}
          isLoading={tiposDocumentoQuery.isLoading}
        />
      </div>

      {/* Compact Filter Toolbar */}
      <TipoDocumentoFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        vencimientoFilter={vencimientoFilter}
        onVencimientoFilterChange={setVencimientoFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {tiposDocumentoQuery.isLoading ? (
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
        ) : tiposDocumentoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposDocumentoQuery.error)}
            className="text-destructive"
          />
        ) : filteredTiposDocumento.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay tipos de documento registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea el primer tipo de documento (ejemplo: FACTURA, POLIZA_SEGURO) para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters} className="h-8 text-xs">
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                  <Plus className="size-3.5" />
                  Crear Tipo de Documento
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                tiposDocumentoQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-2.5 p-0.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredTiposDocumento.map((item) => (
                    <TipoDocumentoCard
                      key={item.id}
                      tipoDocumento={item}
                      onEdit={openEdit}
                      onQuickView={(t) => setQuickView(t)}
                      onDelete={(t) => setDeleting(t)}
                    />
                  ))}
                </ul>
              ) : (
                <TipoDocumentoTableView
                  tiposDocumento={filteredTiposDocumento}
                  onEdit={openEdit}
                  onQuickView={(t) => setQuickView(t)}
                  onDelete={(t) => setDeleting(t)}
                />
              )}
            </div>

            {tiposDocumentoQuery.data ? (
              <Pagination
                page={tiposDocumentoQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <TipoDocumentoFormDialog
        key={editing?.id ?? "new-tipo-documento"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoDocumento={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <TipoDocumentoQuickViewSheet
        tipoDocumento={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
      />

      {/* Educational Help Modal */}
      <TipoDocumentoHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar tipo de documento "${deleting?.nombre}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la parametrización de este tipo de documento del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
