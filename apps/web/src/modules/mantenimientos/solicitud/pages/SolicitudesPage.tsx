import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertTriangle,
  Box,
  Calendar,
  Clock,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  SendHorizontal,
  Trash2,
  Wrench,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import { toast } from "sonner"

import {
  useWorkflowActionTarget,
  WorkflowActionDialog,
  WorkflowListView,
} from "@/modules/workflow"
import {
  useCompleteWorkflowTask,
  useDeleteSolicitud,
  useEnviarSolicitud,
} from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  ConfirmEnviarDialog,
  SolicitudFilterToolbar,
  SolicitudQuickViewSheet,
  SolicitudStats,
  SolicitudWorkflowListItem,
} from "../components"

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
              <WorkflowListView>
                {solicitudes.map((solicitud) => {
                  const adjuntosCount = solicitud.adjuntos?.length ?? 0
                  const isBorrador = (solicitud.estado ?? "").toLowerCase() === "borrador"
                  const isObservado = (solicitud.estado ?? "").toLowerCase() === "observado"
                  const isEditable = isBorrador || isObservado

                  return (
                    <SolicitudWorkflowListItem
                      key={solicitud.id}
                      solicitud={solicitud}
                      badges={
                        <>
                          {solicitud.tipoMantenimiento && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 bg-primary/10 text-primary border-primary/20">
                              <Wrench className="size-2.5" />
                              <span>{solicitud.tipoMantenimiento.nombre}</span>
                            </span>
                          )}
                          {solicitud.tipoFallas && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-55">
                              <AlertTriangle className="size-2.5 shrink-0" />
                              <span className="truncate">{solicitud.tipoFallas}</span>
                            </span>
                          )}
                        </>
                      }
                      extraContent={
                        <>
                          {solicitud.activo && (
                            <div className="flex items-center gap-1.5 truncate max-w-70">
                              <Box className="size-3 text-primary shrink-0 opacity-80" />
                              <span className="font-mono font-bold text-primary text-[11px]">
                                {solicitud.activo.codigo}
                              </span>
                              <span className="truncate text-foreground font-medium">
                                {solicitud.activo.nombre}
                              </span>
                            </div>
                          )}

                          {solicitud.solicitante && (
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">
                                Solicitante:{" "}
                                <strong className="text-foreground font-medium">
                                  {solicitud.solicitante.nombre}
                                </strong>
                              </span>
                            </div>
                          )}

                          {solicitud.fechaSolicitud && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="size-3 opacity-70" />
                              <span>{formatDateTime(solicitud.fechaSolicitud)}</span>
                            </div>
                          )}

                          {solicitud.fechaEstimadaOt && (
                            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium shrink-0">
                              <Clock className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong>
                              </span>
                            </div>
                          )}

                          {adjuntosCount > 0 && (
                            <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/15 text-[10.5px]">
                              <Paperclip className="size-2.5" />
                              <span>
                                {adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}
                              </span>
                            </div>
                          )}
                        </>
                      }
                      extraActions={
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {isBorrador && (
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => setEnviando(solicitud)}
                              className="h-7 gap-1 px-2 text-[11px] font-semibold text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 shadow-2xs cursor-pointer"
                              title="Enviar solicitud para aprobación"
                            >
                              <SendHorizontal className="size-3" />
                              <span>Enviar</span>
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                />
                              }
                            >
                              <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => setQuickView(solicitud)}>
                                <Eye className="size-3.5 mr-2" />
                                <span>Ver detalle</span>
                              </DropdownMenuItem>

                              {isEditable && (
                                <DropdownMenuItem onClick={() => openEdit(solicitud)}>
                                  <Pencil className="size-3.5 mr-2 text-primary" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                              )}

                              {isBorrador && (
                                <>
                                  <DropdownMenuItem onClick={() => setEnviando(solicitud)}>
                                    <SendHorizontal className="size-3.5 mr-2 text-primary" />
                                    <span>Enviar solicitud</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleting(solicitud)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="size-3.5 mr-2" />
                                    <span>Eliminar</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      }
                      onQuickView={() => setQuickView(solicitud)}
                      onActionSelect={(action, taskName, fields) =>
                        workflowAction.openAction(solicitud, action, taskName, fields)
                      }
                    />
                  )
                })}
              </WorkflowListView>
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

      {/* Enviar Solicitud Confirmation Dialog */}
      <ConfirmEnviarDialog
        open={Boolean(enviando)}
        onOpenChange={(open) => !open && setEnviando(null)}
        solicitud={enviando}
        isPending={enviarMutation.isPending}
        onConfirm={handleEnviar}
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
