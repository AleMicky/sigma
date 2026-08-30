import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
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

import { ControlActivoHistorialModal } from "@/modules/mantenimientos/control-activo/components/ControlActivoHistorialModal"
import { OrdenTrabajoDetailModal } from "@/modules/mantenimientos/orden-trabajo/components/OrdenTrabajoDetailModal"
import type { OrdenTrabajo } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.service"
import { WorkflowActionDialog } from "@/modules/workflow"
import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import {
  SolicitudAprobacionListView,
  SolicitudDetalleModal,
} from "../components"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SupervisorMantenimientoPage() {
  const completeWorkflowMutation = useCompleteWorkflowTask()
  const [modalSolicitud, setModalSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [filterUrgentesOnly, setFilterUrgentesOnly] = useState<boolean>(false)
  const [estadoFilter, setEstadoFilter] = useState<
    "ALL" | "EN_REVISION" | "OBSERVADO_MANTENIMIENTO" | "VALIDADO"
  >("EN_REVISION")

  // Modal states for inspecting Control de Activo and OT
  const [controlActivoTarget, setControlActivoTarget] =
    useState<SolicitudMantenimiento | null>(null)
  const [selectedOT, setSelectedOT] = useState<OrdenTrabajo | null>(null)

  // Dialog state for dynamic workflow actions (Validar / Observar)
  const [workflowActionTarget, setWorkflowActionTarget] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch()

  // Main list query
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      estado: estadoFilter === "ALL" ? undefined : estadoFilter,
    }),
  )

  const allItems = useMemo(
    () => solicitudesQuery.data?.content ?? [],
    [solicitudesQuery.data?.content],
  )

  // Filter items in memory if "ALL" or priority filter active
  const rawSolicitudes = useMemo(() => {
    if (estadoFilter === "EN_REVISION") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "EN_REVISION",
      )
    }
    if (estadoFilter === "OBSERVADO_MANTENIMIENTO") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "OBSERVADO_MANTENIMIENTO",
      )
    }
    if (estadoFilter === "VALIDADO") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "VALIDADO",
      )
    }
    // "ALL" -> solicitudes en supervisión
    return allItems.filter((s) => {
      const st = (s.estado ?? "").toUpperCase()
      return (
        st === "EN_REVISION" ||
        st === "OBSERVADO_MANTENIMIENTO" ||
        st === "VALIDADO"
      )
    })
  }, [allItems, estadoFilter])

  const enRevisionCount = useMemo(
    () =>
      allItems.filter((s) => (s.estado ?? "").toUpperCase() === "EN_REVISION")
        .length,
    [allItems],
  )

  const observadasCount = useMemo(
    () =>
      allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "OBSERVADO_MANTENIMIENTO",
      ).length,
    [allItems],
  )

  const validadasCount = useMemo(
    () =>
      allItems.filter((s) => (s.estado ?? "").toUpperCase() === "VALIDADO")
        .length,
    [allItems],
  )

  const urgentesCount = useMemo(
    () => rawSolicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4).length,
    [rawSolicitudes],
  )

  // Filtrado reactivo por urgencias
  const solicitudes = useMemo(() => {
    if (!filterUrgentesOnly) return rawSolicitudes
    return rawSolicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4)
  }, [rawSolicitudes, filterUrgentesOnly])

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function handleActionSelect(
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) {
    setWorkflowActionTarget({
      solicitud,
      action,
      taskName,
      fields,
    })
  }

  return (
    <PageShell className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex flex-col gap-2 shrink-0 border-b border-border/80 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 shadow-2xs">
                <ShieldCheck className="size-4" />
              </div>
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Supervisor de Mantenimiento
              </h1>
              {enRevisionCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  {enRevisionCount} por validar
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
            Supervisa, inspecciona la ejecución técnica y valida u observa las solicitudes en revisión.
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

      {/* Mini Dashboard de Métricas Rápidas */}
      <div className="shrink-0 pt-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Pendientes de Revisión */}
          <div
            onClick={() => {
              setEstadoFilter("EN_REVISION")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "EN_REVISION" && !filterUrgentesOnly
                ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 truncate">
                En Revisión
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {enRevisionCount}
              </p>
            </div>
          </div>

          {/* Observadas */}
          <div
            onClick={() => {
              setEstadoFilter("OBSERVADO_MANTENIMIENTO")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "OBSERVADO_MANTENIMIENTO" && !filterUrgentesOnly
                ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white shadow-xs">
              <AlertCircle className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
                Observadas
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {observadasCount}
              </p>
            </div>
          </div>

          {/* Validadas */}
          <div
            onClick={() => {
              setEstadoFilter("VALIDADO")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "VALIDADO" && !filterUrgentesOnly
                ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                Validadas
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {validadasCount}
              </p>
            </div>
          </div>

          {/* Críticas / Alta Prioridad */}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2 gap-2.5">
        {/* Selector de Estados / Pestañas */}
        <div className="flex items-center justify-between gap-2 border-b pb-2 shrink-0">
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("EN_REVISION")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                estadoFilter === "EN_REVISION"
                  ? "bg-background text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-indigo-500" />
              <span>En Revisión ({enRevisionCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("OBSERVADO_MANTENIMIENTO")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                estadoFilter === "OBSERVADO_MANTENIMIENTO"
                  ? "bg-background text-amber-700 dark:text-amber-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>Observadas ({observadasCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("VALIDADO")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                estadoFilter === "VALIDADO"
                  ? "bg-background text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Validadas ({validadasCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("ALL")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer",
                estadoFilter === "ALL"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todas ({allItems.length})
            </button>
          </div>
        </div>

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
              icon={<ShieldAlert className="size-9 text-indigo-500" />}
              title="Sin solicitudes pendientes"
              description={
                filterUrgentesOnly
                  ? "No hay solicitudes de alta prioridad pendientes en este filtro."
                  : estadoFilter === "EN_REVISION"
                    ? "No hay solicitudes de mantenimiento pendientes de revisión o validación."
                    : estadoFilter === "OBSERVADO_MANTENIMIENTO"
                      ? "No hay solicitudes con observaciones de mantenimiento activas."
                      : estadoFilter === "VALIDADO"
                        ? "No hay solicitudes validadas registradas."
                        : "No hay solicitudes de supervisión en este momento."
              }
              action={
                filterUrgentesOnly ? (
                  <button
                    type="button"
                    onClick={() => setFilterUrgentesOnly(false)}
                    className="text-xs text-primary underline cursor-pointer"
                  >
                    Ver todas las solicitudes
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              <SolicitudAprobacionListView
                solicitudes={solicitudes}
                onQuickView={(sol) => setModalSolicitud(sol)}
                onActionSelect={handleActionSelect}
              />
            </div>
          )}

          {solicitudesQuery.data ? (
            <Pagination
              page={solicitudesQuery.data}
              onPageChange={search.setPage}
              className="border-t pt-2 shrink-0 text-xs"
            />
          ) : null}
        </div>
      </div>

      {/* Modal Detalle / Expediente Completo */}
      <SolicitudDetalleModal
        solicitud={modalSolicitud}
        open={Boolean(modalSolicitud)}
        onOpenChange={(open) => !open && setModalSolicitud(null)}
        onWorkflowAction={handleActionSelect}
      />

      {/* Modal Historial / Detalle Control de Activo */}
      <ControlActivoHistorialModal
        solicitudId={controlActivoTarget?.id ?? null}
        solicitudNumero={controlActivoTarget?.numero ?? null}
        open={Boolean(controlActivoTarget)}
        onOpenChange={(open) => !open && setControlActivoTarget(null)}
      />

      {/* Modal Detalle OT / Inspección de Actividades y Evidencias */}
      <OrdenTrabajoDetailModal
        ordenTrabajo={selectedOT}
        open={Boolean(selectedOT)}
        onOpenChange={(open) => !open && setSelectedOT(null)}
        onUpdated={() => {
          solicitudesQuery.refetch()
        }}
      />

      {/* Diálogo de Acción de Workflow (Validar / Observar) */}
      <WorkflowActionDialog
        open={Boolean(workflowActionTarget)}
        onOpenChange={(open) => !open && setWorkflowActionTarget(null)}
        action={workflowActionTarget?.action ?? null}
        taskName={workflowActionTarget?.taskName}
        fields={workflowActionTarget?.fields}
        entityId={workflowActionTarget?.solicitud?.id}
        onExecute={({ variables }) => {
          const item = workflowActionTarget?.solicitud
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
