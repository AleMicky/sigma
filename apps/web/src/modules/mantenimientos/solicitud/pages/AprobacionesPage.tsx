import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  FileCheck2,
  Paperclip,
  ShieldCheck,
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

import {
  useWorkflowActionTarget,
  WorkflowActionDialog,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  SolicitudAprobacionListView,
  SolicitudDetalleModal,
  SolicitudTrazabilidadModal,
} from "../components"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const [modalSolicitud, setModalSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [trazabilidadSolicitud, setTrazabilidadSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [filterUrgentesOnly, setFilterUrgentesOnly] = useState<boolean>(false)

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

  const rawSolicitudes = useMemo(
    () =>
      (solicitudesQuery.data?.content ?? []).filter(
        (s) => (s.estado ?? "").toUpperCase() === "SOLICITADO",
      ),
    [solicitudesQuery.data?.content],
  )

  // Métricas rápidas para el aprobador
  const totalCount = solicitudesQuery.data?.totalElements ?? rawSolicitudes.length

  const urgentesCount = useMemo(
    () => rawSolicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4).length,
    [rawSolicitudes],
  )

  const correctivosCount = useMemo(
    () =>
      rawSolicitudes.filter((s) =>
        (s.tipoMantenimiento?.nombre ?? "").toLowerCase().includes("correctiv"),
      ).length,
    [rawSolicitudes],
  )

  const conAdjuntosCount = useMemo(
    () => rawSolicitudes.filter((s) => (s.adjuntos?.length ?? 0) > 0).length,
    [rawSolicitudes],
  )

  // Filtrado reactivo para urgencias
  const solicitudes = useMemo(() => {
    if (!filterUrgentesOnly) return rawSolicitudes
    return rawSolicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4)
  }, [rawSolicitudes, filterUrgentesOnly])

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function handleOpenModal(solicitud: SolicitudMantenimiento) {
    setModalSolicitud(solicitud)
  }

  function handleActionSelect(
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) {
    workflowAction.openAction(solicitud, action, taskName, fields)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-3 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8.5 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-2xs">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Bandeja de Aprobaciones
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {totalCount} pendientes
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                className="h-7 px-2"
                onRefresh={() => solicitudesQuery.refetch()}
                isRefreshing={solicitudesQuery.isFetching}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Revisa y toma decisiones de aprobación sobre las solicitudes de mantenimiento pendientes de decisión.
          </p>
        </div>

        <div className="hidden shrink-0 md:flex md:items-center md:gap-1.5">
          <RefreshButton
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            onRefresh={() => solicitudesQuery.refetch()}
            isRefreshing={solicitudesQuery.isFetching}
          />
        </div>
      </header>

      {/* Mini Dashboard de Métricas Rápidas del Aprobador */}
      <div className="shrink-0 pt-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Total Pendientes */}
          <div
            onClick={() => setFilterUrgentesOnly(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              !filterUrgentesOnly
                ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Por Evaluar
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalCount}
              </p>
            </div>
          </div>

          {/* Críticas / Alta Prioridad (Clickable Quick Filter) */}
          <div
            onClick={() => setFilterUrgentesOnly((prev) => !prev)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              filterUrgentesOnly
                ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30 scale-[1.01]"
                : urgentesCount > 0
                  ? "bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10"
                  : "bg-card/60 border-border/70",
            )}
          >
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="size-4" />
              {urgentesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-rose-500" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 truncate">
                Alta / Crítica
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
                {urgentesCount} {filterUrgentesOnly && <span className="text-[10px] font-normal">(filtrado)</span>}
              </p>
            </div>
          </div>

          {/* Correctivos */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Wrench className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Correctivos
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {correctivosCount}
              </p>
            </div>
          </div>

          {/* Con Documentos / Adjuntos */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-2xs">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Paperclip className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                Con Adjuntos
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {conAdjuntosCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2 gap-2.5">
        {/* Requests List */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
              icon={<FileCheck2 className="size-9 text-amber-500" />}
              title="¡Bandeja al día!"
              description={
                filterUrgentesOnly
                  ? "No hay solicitudes de alta prioridad pendientes."
                  : "No hay solicitudes de mantenimiento pendientes de aprobación en este momento."
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
                <SolicitudAprobacionListView
                  solicitudes={solicitudes}
                  onQuickView={handleOpenModal}
                />
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

      {/* Detalle de Solicitud + WorkflowPanel Modal Dialog */}
      <SolicitudDetalleModal
        solicitud={modalSolicitud}
        open={Boolean(modalSolicitud)}
        onOpenChange={(open) => !open && setModalSolicitud(null)}
        onWorkflowAction={handleActionSelect}
      />

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
        responsableActual={workflowAction.target?.item?.responsable}
        aprobadorId={workflowAction.target?.item?.aprobadoPor?.id}
        fechaEstimadaActual={workflowAction.target?.item?.fechaEstimadaOt ?? undefined}
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
          setModalSolicitud(null)
        }}
      />
    </PageShell>
  )
}
