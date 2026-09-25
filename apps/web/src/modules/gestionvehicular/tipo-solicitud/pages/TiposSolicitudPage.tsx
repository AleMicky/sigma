import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Plus } from "lucide-react"

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

  const queryParams = {
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "codigo",
    direction: "ASC" as const,
    ...(search.query && { search: search.query }),
  }

  const tiposQuery = useQuery(tipoSolicitudVehicularQueries.list(queryParams))
  const allTiposQuery = useQuery(tipoSolicitudVehicularQueries.list({ size: 1000 }))

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
    isLoading: tiposQuery.isFetching,
    onEdit: openEdit,
    onDelete: setDeleting,
    emptyTitle: hasActiveFilters
      ? "No se encontraron tipos de solicitud"
      : "No hay tipos de solicitud registrados",
    emptyDescription: hasActiveFilters
      ? "No hay resultados que coincidan con la búsqueda."
      : "Registra los motivos y clasificaciones de solicitud vehicular para la flota.",
    emptyIcon: (
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary/70 shadow-2xs">
        <FileText className="size-6" />
      </div>
    ),
    emptyAction: !hasActiveFilters && (
      <Button
        onClick={openCreate}
        size="sm"
        className="mt-3 gap-1.5 rounded-lg text-xs font-semibold"
      >
        <Plus className="size-3.5" />
        Registrar Tipo de Solicitud
      </Button>
    ),
  }

  return (
    <div className="flex w-full flex-col gap-3 px-1 sm:px-2 pt-1 pb-4">
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
        isLoading={allTiposQuery.isFetching && !allTiposQuery.data}
      />

      {/* UNIFIED CONTAINER */}
      <div className="flex-1 w-full overflow-hidden rounded-xl border border-border/70 bg-card/75 shadow-2xs flex flex-col">
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
            <div className="p-3">
              <TipoSolicitudCardView {...viewProps} />
            </div>
          ) : (
            <TipoSolicitudTableView {...viewProps} />
          )}
        </div>

        {/* PAGINACIÓN UNIFICADA AL FINAL */}
        {tiposQuery.data && tiposSolicitud.length > 0 && (
          <Pagination
            page={tiposQuery.data}
            onPageChange={search.setPage}
          />
        )}
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <TipoSolicitudFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tipoSolicitud={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
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
