import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  Plus,
  Shield,
  User,
} from "lucide-react"

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

import { toast } from "sonner"

import {
  useWorkflowActionTarget,
  WorkflowActionDialog,
} from "@/modules/workflow"
import {
  useCompleteWorkflowTask,
  useDeleteSolicitud,
} from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  SolicitudFilterToolbar,
  SolicitudListView,
  SolicitudQuickViewSheet,
  SolicitudStats,
} from "../components"
import { useSolicitudRoleScope } from "../hooks/use-solicitud-role-scope"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SolicitudesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [quickView, setQuickView] = useState<SolicitudMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<SolicitudMantenimiento | null>(null)

  const {
    isAdmin,
    scope,
    setScope,
    isMineOnly,
    currentEmpleado,
    isSolicitantePropio,
  } = useSolicitudRoleScope()

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteSolicitud()
  const completeWorkflowMutation = useCompleteWorkflowTask()
  const workflowAction = useWorkflowActionTarget<SolicitudMantenimiento>()

  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
      ...(statusFilter ? { estado: statusFilter } : {}),
      ...(isMineOnly && currentEmpleado?.id
        ? { solicitanteId: currentEmpleado.id }
        : {}),
    }),
  )

  const rawSolicitudes = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  // In-memory fallback if backend solicitanteId wasn't applied or for multi-employee user
  const solicitudes = useMemo(() => {
    if (!isMineOnly) return rawSolicitudes
    if (currentEmpleado?.id) return rawSolicitudes
    return rawSolicitudes.filter(isSolicitantePropio)
  }, [rawSolicitudes, isMineOnly, currentEmpleado?.id, isSolicitantePropio])

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
    const estado = (solicitud.estado ?? "").toLowerCase()
    if (estado !== "borrador" && estado !== "observado") {
      toast.error("Solo se pueden editar solicitudes en estado Borrador u Observado")
      return
    }
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
    if ((deleting.estado ?? "").toLowerCase() !== "borrador") {
      toast.error("Solo se pueden eliminar solicitudes en estado Borrador")
      setDeleting(null)
      return
    }
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
                Solicitudes de Mantenimiento
              </h1>
              {isAdmin ? (
                <div className="inline-flex rounded-lg bg-muted p-0.5 border text-xs">
                  <button
                    type="button"
                    onClick={() => setScope("ALL")}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                      scope === "ALL"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Shield className="size-3" />
                    <span>Todas (Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("MINE")}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                      scope === "MINE"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <User className="size-3" />
                    <span>Solo Mías</span>
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  <User className="size-3" />
                  <span>Mis Solicitudes</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                queries={solicitudesQuery}
                size="sm"
                className="h-7 px-2"
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
            queries={solicitudesQuery}
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
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
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {solicitudesQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-20 rounded-xl"
            className="space-y-2"
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
                onQuickView={setQuickView}
                onDelete={setDeleting}
                onWorkflowAction={(sol, action, taskName, fields) => {
                  workflowAction.openAction(sol, action, taskName, fields)
                }}
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
        onWorkflowAction={(sol, action, taskName, fields) => {
          workflowAction.openAction(sol, action, taskName, fields)
        }}
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

      {/* Dynamic Workflow Action Dialog (e.g. Reenviar/Corregir en Observado) */}
      <WorkflowActionDialog
        open={workflowAction.isOpen}
        onOpenChange={(open) => !open && workflowAction.closeAction()}
        action={workflowAction.target?.action ?? null}
        taskName={workflowAction.target?.taskName}
        fields={workflowAction.target?.fields}
        entityId={workflowAction.target?.item?.id}
        onExecute={({ variables }) => {
          const item = workflowAction.target?.item
          if (!item) return Promise.resolve()
          return completeWorkflowMutation.mutateAsync({
            solicitudId: item.id,
            payload: { variables },
          })
        }}
        onSuccess={() => {
          solicitudesQuery.refetch()
          setQuickView(null)
        }}
      />
    </PageShell>
  )
}
