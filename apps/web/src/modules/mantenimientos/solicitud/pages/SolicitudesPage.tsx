import { Link, useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
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

import { useDeleteSolicitud, useEnviarSolicitud } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import { ConfirmEnviarDialog } from "../components/ConfirmEnviarDialog"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudListView } from "../components/SolicitudListView"
import { SolicitudQuickViewSheet } from "../components/SolicitudQuickViewSheet"
import { SolicitudStats } from "../components/SolicitudStats"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SolicitudesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [quickView, setQuickView] = useState<SolicitudMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<SolicitudMantenimiento | null>(null)
  const [enviando, setEnviando] = useState<SolicitudMantenimiento | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteSolicitud()
  const enviarMutation = useEnviarSolicitud()

  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
      ...(statusFilter ? { estado: statusFilter } : {}),
    }),
  )

  const solicitudes = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  const enviadasCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase()
        return est === "solicitado"
      }).length,
    [solicitudes],
  )

  const borradorCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase()
        return est === "borrador"
      }).length,
    [solicitudes],
  )

  const enProcesoCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase()
        return (
          est === "en_proceso" ||
          est === "en proceso" ||
          est === "aprobado" ||
          est === "asignado"
        )
      }).length,
    [solicitudes],
  )

  const finalizadoCount = useMemo(
    () =>
      solicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase()
        return est === "finalizado" || est === "completado"
      }).length,
    [solicitudes],
  )

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function openCreate() {
    navigate({ to: routes.mantenimientos.nuevaSolicitud })
  }

  function openEdit(solicitud: SolicitudMantenimiento) {
    navigate({
      to: routes.mantenimientos.editarSolicitud(solicitud.id),
    })
  }

  const hasActiveFilters = Boolean(search.search.trim() || statusFilter)

  function resetFilters() {
    search.setSearch("")
    setStatusFilter("")
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

  async function handleEnviar(aprobadoPorId: string) {
    if (!enviando) return
    try {
      await enviarMutation.mutateAsync({
        id: enviando.id,
        payload: { aprobadoPorId },
      })
      setEnviando(null)
    } catch {
      // Handled by mutation toast
    }
  }


  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Solicitudes de Mantenimiento
            </h1>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => solicitudesQuery.refetch()}
                isRefreshing={solicitudesQuery.isFetching}
              />
              <Button
                size="sm"
                type="button"
                render={<Link to={routes.mantenimientos.nuevaSolicitud} />}
                className="h-7 px-2 text-xs"
              >
                <Plus className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Gestiona las solicitudes de mantenimiento correctivo y preventivo de activos.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onRefresh={() => solicitudesQuery.refetch()}
            isRefreshing={solicitudesQuery.isFetching}
          />

          <Button
            size="sm"
            type="button"
            render={<Link to={routes.mantenimientos.nuevaSolicitud} />}
            className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Solicitud</span>
          </Button>
        </div>
      </header>

      {/* Stats Section */}
      <div className="shrink-0 pt-2.5 pb-1">
        <SolicitudStats
          totalCount={solicitudesQuery.data?.totalElements}
          borradorCount={borradorCount}
          enviadasCount={enviadasCount}
          enProcesoCount={enProcesoCount}
          finalizadoCount={finalizadoCount}
          isLoading={solicitudesQuery.isLoading}
          activeStatus={statusFilter}
          onSelectStatus={setStatusFilter}
        />
      </div>

      {/* Filter Toolbar */}
      <SolicitudFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        borradorCount={borradorCount}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {solicitudesQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-2xl"
            className="space-y-3"
          />
        ) : solicitudesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(solicitudesQuery.error)}
            className="text-destructive"
          />
        ) : solicitudes.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="size-4 text-muted-foreground" />}
            title={
              hasActiveFilters
                ? "Sin resultados"
                : "No hay solicitudes registradas"
            }
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros activos."
                : "Crea la primera solicitud de mantenimiento para comenzar."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  type="button"
                  onClick={resetFilters}
                  className="h-8 text-xs"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="h-8 text-xs"
                >
                  <Plus className="size-3.5" />
                  Crear Solicitud
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
                solicitudesQuery.isFetching && "opacity-70",
              )}
            >
              <SolicitudListView
                solicitudes={solicitudes}
                onEdit={openEdit}
                onQuickView={(s) => setQuickView(s)}
                onDelete={(s) => setDeleting(s)}
                onEnviar={(s) => setEnviando(s)}
              />
            </div>

            {solicitudesQuery.data ? (
              <Pagination
                page={solicitudesQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>


      {/* Quick View Sheet */}
      <SolicitudQuickViewSheet
        solicitud={quickView}
        open={Boolean(quickView)}
        onOpenChange={(open) => !open && setQuickView(null)}
        onEdit={openEdit}
        onEnviar={(s) => setEnviando(s)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar solicitud "${deleting?.titulo}"?`}
        description="Esta acción no se puede deshacer. Se eliminará la solicitud y sus adjuntos del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />

      {/* Enviar Solicitud Confirmation Dialog */}
      <ConfirmEnviarDialog
        open={Boolean(enviando)}
        onOpenChange={(open) => !open && setEnviando(null)}
        solicitud={enviando}
        isPending={enviarMutation.isPending}
        onConfirm={handleEnviar}
      />
    </PageShell>
  )
}
