import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Box,
  Calendar,
  Clock,
  FileCheck2,
  Paperclip,
  Shield,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import {
  useWorkflowActionTarget,
  WorkflowActionDialog,
  WorkflowListView,
} from "@/modules/workflow"
import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  SolicitudTrazabilidadModal,
  SolicitudWorkflowListItem,
} from "../components"
import { getTipoMantenimientoBadgeClass } from "../lib/solicitud.utils"
import { useSolicitudRoleScope } from "../hooks/use-solicitud-role-scope"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const [trazabilidadSolicitud, setTrazabilidadSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [filterUrgentesOnly, setFilterUrgentesOnly] = useState<boolean>(false)

  const {
    isAdmin,
    scope,
    setScope,
  } = useSolicitudRoleScope()

  const completeWorkflowMutation = useCompleteWorkflowTask()
  const workflowAction = useWorkflowActionTarget<SolicitudMantenimiento>()

  const search = usePaginatedSearch()

  // Consulta exclusiva para solicitudes pendientes de aprobación (SOLICITADO)
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      estado: "SOLICITADO",
    }),
  )

  const totalElements = solicitudesQuery.data?.totalElements ?? 0

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  const allItems = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  // Filtro secundario opcional para urgencias
  const solicitudes = useMemo(() => {
    if (!filterUrgentesOnly) return allItems
    return allItems.filter((s) => (s.prioridad?.nivel ?? 1) >= 4)
  }, [allItems, filterUrgentesOnly])

  const urgentesCount = useMemo(
    () => allItems.filter((s) => (s.prioridad?.nivel ?? 1) >= 4).length,
    [allItems],
  )

  function handleActionSelect(
    solicitud: SolicitudMantenimiento,
    action: any,
    taskName?: string,
    fields?: any[],
  ) {
    workflowAction.openAction(solicitud, action, taskName, fields)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b pb-3 pt-3 sm:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  Bandeja de Aprobaciones
                </h1>
                {totalElements > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {totalElements} pendientes
                  </span>
                )}

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
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <User className="size-3" />
                      <span>Mis Aprobaciones</span>
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    <User className="size-3" />
                    <span>Aprobador</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Evalúa, aprueba o devuelve solicitudes de mantenimiento en etapa inicial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RefreshButton queries={solicitudesQuery} />
          </div>
        </div>

        {/* Quick Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterUrgentesOnly(false)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs",
                !filterUrgentesOnly
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Todas las pendientes ({totalElements})
            </button>
            <button
              type="button"
              onClick={() => setFilterUrgentesOnly(true)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer text-xs",
                filterUrgentesOnly
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <AlertTriangle className="size-3 text-rose-500" />
              Solo Críticas / Urgentes ({urgentesCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        <div className="flex min-h-0 flex-1 flex-col">
          {solicitudesQuery.isLoading ? (
            <ListSkeleton rows={4} />
          ) : solicitudesQuery.isError ? (
            <EmptyState
              title="Error al cargar solicitudes"
              description={getErrorMessage(solicitudesQuery.error)}
              action={
                <button
                  type="button"
                  onClick={() => solicitudesQuery.refetch()}
                  className="text-xs text-primary underline"
                >
                  Reintentar
                </button>
              }
            />
          ) : solicitudes.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="size-5 text-muted-foreground" />}
              title={
                filterUrgentesOnly
                  ? "No hay solicitudes críticas pendientes"
                  : "Sin solicitudes por aprobar"
              }
              description={
                filterUrgentesOnly
                  ? "No hay solicitudes con prioridad Alta o Urgente pendientes."
                  : "No tienes solicitudes de mantenimiento pendientes de aprobación."
              }
              action={
                filterUrgentesOnly ? (
                  <button
                    type="button"
                    onClick={() => setFilterUrgentesOnly(false)}
                    className="text-xs text-primary underline"
                  >
                    Ver todas las pendientes
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-0.5",
                  solicitudesQuery.isFetching && "opacity-75",
                )}
              >
                <WorkflowListView>
                  {solicitudes.map((solicitud) => {
                    const adjuntosCount = solicitud.adjuntos?.length ?? 0

                    return (
                      <SolicitudWorkflowListItem
                        key={solicitud.id}
                        solicitud={solicitud}
                        badges={
                          <>
                            {solicitud.tipoMantenimiento && (
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${getTipoMantenimientoBadgeClass(
                                  solicitud.tipoMantenimiento.nombre,
                                  false,
                                )}`}
                              >
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
                        onActionSelect={(action, taskName, fields) =>
                          handleActionSelect(solicitud, action, taskName, fields)
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
                  className="border-t pt-2 shrink-0 text-xs"
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Modal de Trazabilidad y Línea de Tiempo del Workflow */}
      <SolicitudTrazabilidadModal
        solicitud={trazabilidadSolicitud}
        open={Boolean(trazabilidadSolicitud)}
        onOpenChange={(open) => !open && setTrazabilidadSolicitud(null)}
      />

      {/* Dynamic Generic Workflow Action Dialog */}
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
        }}
      />
    </PageShell>
  )
}
