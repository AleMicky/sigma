import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, FileText, Plus, RotateCw, SearchX } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteTipoSolicitudVehicular } from "../api/tipo-solicitud.mutations"
import { tipoSolicitudVehicularQueries } from "../api/tipo-solicitud.queries"
import type { TipoSolicitudVehicular } from "../api/tipo-solicitud.service"
import { TipoSolicitudCardView } from "../components/TipoSolicitudCardView"
import {
  TipoSolicitudFilters,
  type ViewMode,
} from "../components/TipoSolicitudFilters"
import { TipoSolicitudFormDialog } from "../components/TipoSolicitudFormDialog"
import { TipoSolicitudHeader } from "../components/TipoSolicitudHeader"
import { TipoSolicitudKPIs } from "../components/TipoSolicitudKPIs"
import { TipoSolicitudTableView } from "../components/TipoSolicitudTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposSolicitudPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoSolicitudVehicular | null>(null)
  const [deleting, setDeleting] = useState<TipoSolicitudVehicular | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteTipoSolicitudVehicular()

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "codigo",
      direction: "ASC" as const,
      ...(search.query && { search: search.query }),
    }),
    [search.page, search.query]
  )

  const tiposQuery = useQuery(tipoSolicitudVehicularQueries.list(queryParams))

  // Cached long-lived query for global KPI metrics
  const allTiposQuery = useQuery({
    ...tipoSolicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 3, // 3 minutes
  })

  const tiposSolicitud = tiposQuery.data?.content ?? []

  const kpiStats = useMemo(() => {
    const list = allTiposQuery.data?.content ?? tiposSolicitud
    const total = allTiposQuery.data?.totalElements ?? list.length

    let conDescripcion = 0
    let sinDescripcion = 0

    for (const t of list) {
      if (t.descripcion && t.descripcion.trim().length > 0) {
        conDescripcion++
      } else {
        sinDescripcion++
      }
    }
    return { total, conDescripcion, sinDescripcion }
  }, [allTiposQuery.data, tiposSolicitud])

  useClampPage(search.page, search.setPage, tiposQuery.data?.totalPages)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (tipo: TipoSolicitudVehicular) => {
    setEditing(tipo)
    setDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditing(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled in mutation
    }
  }

  const hasActiveFilters = Boolean(search.search.trim())

  const resetFilters = () => {
    search.setSearch("")
  }

  const viewProps = {
    tiposSolicitud,
    isLoading: tiposQuery.isLoading,
    onEdit: openEdit,
    onDelete: setDeleting,
    emptyTitle: hasActiveFilters
      ? "Sin resultados para tu búsqueda"
      : "No hay tipos de solicitud registrados",
    emptyDescription: hasActiveFilters
      ? `No se encontraron coincidencias para "${search.search}". Intenta con otro término o limpia el filtro.`
      : "Registra los motivos y clasificaciones de solicitud vehicular para gestionar la flota.",
    emptyIcon: hasActiveFilters ? (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/60 shadow-2xs">
        <SearchX className="size-6 text-muted-foreground" />
      </div>
    ) : (
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
        <FileText className="size-6" />
      </div>
    ),
    emptyAction: hasActiveFilters ? (
      <Button
        onClick={resetFilters}
        variant="outline"
        size="sm"
        className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/70 cursor-pointer shadow-2xs"
      >
        Limpiar búsqueda
      </Button>
    ) : (
      <Button
        onClick={openCreate}
        size="sm"
        className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
      >
        <Plus className="size-3.5" />
        Registrar Tipo de Solicitud
      </Button>
    ),
  }

  return (
    <div className="flex w-full flex-col gap-3.5 px-2 sm:px-4 pt-2 pb-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <TipoSolicitudHeader
        isRefreshing={tiposQuery.isFetching}
        onRefresh={() => {
          tiposQuery.refetch()
          allTiposQuery.refetch()
        }}
        onOpenCreate={openCreate}
      />

      {/* COMPACT KPI METRICS */}
      <TipoSolicitudKPIs
        totalCount={kpiStats.total}
        conDescripcionCount={kpiStats.conDescripcion}
        sinDescripcionCount={kpiStats.sinDescripcion}
        isLoading={allTiposQuery.isPending && !allTiposQuery.data}
      />

      {/* ERROR BANNER IF QUERY FAILS */}
      {tiposQuery.isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <p className="font-medium">
              Ocurrió un error al cargar los tipos de solicitud.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => tiposQuery.refetch()}
            className="h-7 gap-1.5 rounded-md border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer"
          >
            <RotateCw className="size-3" />
            Reintentar
          </Button>
        </div>
      )}

      {/* UNIFIED CONTAINER */}
      <div className="flex-1 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-xs backdrop-blur-sm flex flex-col transition-all">
        <TipoSolicitudFilters
          search={search.search}
          setSearch={search.setSearch}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="flex-1 min-h-0">
          {viewMode === "grid" ? (
            <div className="p-3.5">
              <TipoSolicitudCardView {...viewProps} />
            </div>
          ) : (
            <TipoSolicitudTableView {...viewProps} />
          )}
        </div>

        {/* PAGINACIÓN UNIFICADA AL FINAL */}
        {tiposQuery.data && tiposSolicitud.length > 0 && (
          <div className="border-t border-border/60 bg-muted/20">
            <Pagination
              page={tiposQuery.data}
              onPageChange={search.setPage}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <TipoSolicitudFormDialog
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
          tipoSolicitud={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={Boolean(deleting)}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar tipo de solicitud"
          description={`¿Estás seguro de que deseas eliminar el tipo de solicitud "${deleting.nombre}" (${deleting.codigo})?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
