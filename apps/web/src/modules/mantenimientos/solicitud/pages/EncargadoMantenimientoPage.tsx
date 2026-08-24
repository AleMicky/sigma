import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Layers,
  UserCheck,
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
import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import { SolicitudAprobacionListView } from "../components/SolicitudAprobacionListView"
import { SolicitudDetalleModal } from "../components/SolicitudDetalleModal"
import { WorkflowActionDialog } from "../components/WorkflowActionDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EncargadoMantenimientoPage() {
  const navigate = useNavigate()
  const [modalSolicitud, setModalSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [filterUrgentesOnly, setFilterUrgentesOnly] = useState<boolean>(false)
  const [estadoFilter, setEstadoFilter] = useState<
    "ALL" | "ASIGNADO" | "EN_MANTENIMIENTO"
  >("ALL")

  const [controlActivoTarget, setControlActivoTarget] =
    useState<SolicitudMantenimiento | null>(null)
  const [selectedOT, setSelectedOT] = useState<OrdenTrabajo | null>(null)

  const [workflowActionTarget, setWorkflowActionTarget] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch()

  // Consulta para solicitudes en gestión del encargado (ASIGNADO y EN_MANTENIMIENTO)
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

  const rawSolicitudes = useMemo(() => {
    if (estadoFilter === "ASIGNADO") {
      return allItems.filter((s) => (s.estado ?? "").toUpperCase() === "ASIGNADO")
    }
    if (estadoFilter === "EN_MANTENIMIENTO") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "EN_MANTENIMIENTO",
      )
    }
    // "ALL" -> filtrar solo solicitudes pertenecientes a la gestión del encargado
    return allItems.filter((s) => {
      const st = (s.estado ?? "").toUpperCase()
      return st === "ASIGNADO" || st === "EN_MANTENIMIENTO"
    })
  }, [allItems, estadoFilter])

  // Conteos por estado en la lista cargada
  const asignadasCount = useMemo(
    () =>
      allItems.filter((s) => (s.estado ?? "").toUpperCase() === "ASIGNADO")
        .length,
    [allItems],
  )

  const enMantenimientoCount = useMemo(
    () =>
      allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "EN_MANTENIMIENTO",
      ).length,
    [allItems],
  )

  const totalCount =
    solicitudesQuery.data?.totalElements ?? rawSolicitudes.length

  const urgentesCount = useMemo(
    () => rawSolicitudes.filter((s) => (s.prioridad?.nivel ?? 1) >= 4).length,
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
    setWorkflowActionTarget({
      solicitud,
      action,
      taskName,
      fields,
    })
  }

  function handleCreateOT(solicitud: SolicitudMantenimiento) {
    navigate({
      to: "/mantenimientos/ordenes-trabajo/nuevo",
      search: {
        solicitudId: solicitud.id,
        activoId: solicitud.activo?.id,
      },
    })
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-2 border-b py-3 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8.5 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shadow-2xs">
                <UserCheck className="size-5" />
              </div>
              <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Encargado Mantenimiento
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-500/30">
                  {totalCount} en gestión
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
            Supervisa, planifica y ejecuta las solicitudes en estado Asignado y En Mantenimiento.
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
          {/* Todas en Gestión */}
          <div
            onClick={() => {
              setEstadoFilter("ALL")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "ALL" && !filterUrgentesOnly
                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Layers className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                En Gestión
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {totalCount}
              </p>
            </div>
          </div>

          {/* Asignadas (Planificación) */}
          <div
            onClick={() => {
              setEstadoFilter("ASIGNADO")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "ASIGNADO" && !filterUrgentesOnly
                ? "bg-sky-500/15 border-sky-500 ring-2 ring-sky-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
              <UserCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 truncate">
                Asignadas
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {asignadasCount}
              </p>
            </div>
          </div>

          {/* En Mantenimiento (En Ejecución) */}
          <div
            onClick={() => {
              setEstadoFilter("EN_MANTENIMIENTO")
              setFilterUrgentesOnly(false)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-2.5 shadow-2xs transition-all cursor-pointer",
              estadoFilter === "EN_MANTENIMIENTO" && !filterUrgentesOnly
                ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 truncate">
                En Ejecución
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {enMantenimientoCount}
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
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("ASIGNADO")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                estadoFilter === "ASIGNADO"
                  ? "bg-background text-sky-700 dark:text-sky-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-sky-500" />
              <span>Asignadas ({asignadasCount})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEstadoFilter("EN_MANTENIMIENTO")
                setFilterUrgentesOnly(false)
              }}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                estadoFilter === "EN_MANTENIMIENTO"
                  ? "bg-background text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>En Mantenimiento ({enMantenimientoCount})</span>
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
              icon={<FileCheck2 className="size-9 text-sky-500" />}
              title="¡Todo al día!"
              description={
                filterUrgentesOnly
                  ? "No hay solicitudes de alta prioridad pendientes en este filtro."
                  : estadoFilter === "ASIGNADO"
                    ? "No hay solicitudes en estado Asignado."
                    : estadoFilter === "EN_MANTENIMIENTO"
                      ? "No hay solicitudes en estado En Mantenimiento."
                      : "No hay solicitudes de mantenimiento en gestión en este momento."
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
                  onActionSelect={handleActionSelect}
                  onCreateOT={handleCreateOT}
                  showControlActivo
                  onViewControlActivo={(sol) => setControlActivoTarget(sol)}
                  onViewOT={(_sol, ot) => setSelectedOT(ot ?? null)}
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

      {/* Dynamic Workflow Action Dialog */}
      <WorkflowActionDialog
        open={Boolean(workflowActionTarget)}
        onOpenChange={(open) => !open && setWorkflowActionTarget(null)}
        solicitud={workflowActionTarget?.solicitud ?? null}
        action={workflowActionTarget?.action ?? null}
        taskName={workflowActionTarget?.taskName}
        fields={workflowActionTarget?.fields}
        onSuccess={() => {
          solicitudesQuery.refetch()
          setModalSolicitud(null)
        }}
      />

      {/* Modal Historial de Control de Activo */}
      <ControlActivoHistorialModal
        solicitudId={controlActivoTarget?.id ?? null}
        solicitudNumero={controlActivoTarget?.numero ?? null}
        open={Boolean(controlActivoTarget)}
        onOpenChange={(open) => !open && setControlActivoTarget(null)}
      />

      {/* Modal Workbench Detalle de Orden de Trabajo */}
      <OrdenTrabajoDetailModal
        ordenTrabajo={selectedOT}
        open={Boolean(selectedOT)}
        onOpenChange={(open) => !open && setSelectedOT(null)}
        onUpdated={() => {
          solicitudesQuery.refetch()
        }}
      />
    </PageShell>
  )
}
