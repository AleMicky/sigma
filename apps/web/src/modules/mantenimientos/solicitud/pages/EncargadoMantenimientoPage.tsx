import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Layers,
  Shield,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { ControlActivoHistorialModal } from "@/modules/mantenimientos/control-activo/components/ControlActivoHistorialModal"
import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import { OrdenTrabajoDetailModal } from "@/modules/mantenimientos/orden-trabajo/components/OrdenTrabajoDetailModal"
import { ordenTrabajoQueries } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.queries"
import type { OrdenTrabajo } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.service"
import {
  WorkflowActionDialog,
  WorkflowListView,
} from "@/modules/workflow"
import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import {
  SolicitudTrazabilidadModal,
  SolicitudWorkflowListItem,
} from "../components"
import { useSolicitudRoleScope } from "../hooks/use-solicitud-role-scope"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

function SolicitudEncargadoListItem({
  solicitud,
  onControlActivo,
  onOrdenTrabajo,
  onTraceability,
  onActionSelect,
}: {
  solicitud: SolicitudMantenimiento
  onControlActivo: (s: SolicitudMantenimiento) => void
  onOrdenTrabajo: (s: SolicitudMantenimiento) => void
  onTraceability?: () => void
  onActionSelect: (
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}) {
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isAsignado = estadoNorm === "asignado"

  // Consultar si ya tiene actas registradas para esta solicitud
  const controlesQuery = useQuery({
    ...controlActivoQueries.list({
      solicitudMantenimientoId: solicitud.id,
      size: 1,
    }),
  })
  const hasActaRegistrada = (controlesQuery.data?.totalElements ?? 0) > 0

  // Consultar si ya tiene OT registrada para esta solicitud
  const otsQuery = useQuery({
    ...ordenTrabajoQueries.list({
      solicitudMantenimientoId: solicitud.id,
      size: 1,
    }),
  })
  const hasOTRegistrada = (otsQuery.data?.totalElements ?? 0) > 0
  const ot = otsQuery.data?.content?.[0]

  // Consultar actividades de la OT si existe
  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(ot?.id ?? ""),
    enabled: Boolean(ot?.id),
  })
  const actividades = actividadesQuery.data?.content ?? []
  const totalActividades = actividades.length
  const completadasCount = actividades.filter((a) => a.realizado).length
  const pendientesCount = totalActividades - completadasCount
  const isValidado = estadoNorm === "validado"
  const isEnMantenimiento = estadoNorm === "en_mantenimiento"

  return (
    <SolicitudWorkflowListItem
      key={solicitud.id}
      solicitud={solicitud}
      badges={
        <>
          {solicitud.tipoMantenimiento && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 bg-primary/10 text-primary border-primary/20">
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          )}
          {solicitud.tipoFallas && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-55">
              <AlertTriangle className="size-2.5 shrink-0" />
              <span className="truncate">{solicitud.tipoFallas}</span>
            </span>
          )}
          {(isValidado || isEnMantenimiento) && hasOTRegistrada && pendientesCount > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onOrdenTrabajo(solicitud)
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 cursor-pointer hover:bg-amber-500/25 transition-all shadow-2xs"
              title="Haz clic para abrir la OT y completar las tareas/evidencias requeridas"
            >
              <AlertTriangle className="size-2.5 text-amber-600 animate-pulse" />
              <span>{pendientesCount} {pendientesCount === 1 ? "tarea pendiente" : "tareas pendientes"} en OT</span>
            </span>
          )}
        </>
      }
      extraContent={
        <>
          {solicitud.activo && (
            <div className="flex items-center gap-1.5 truncate max-w-[280px]">
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
          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1.5 font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/15 text-[10.5px]">
              <span>
                {adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}
              </span>
            </div>
          )}
        </>
      }
      extraActions={
        <div className="flex items-center gap-1.5">
          {/* Botón Acta (Control de Activo) */}
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onControlActivo(solicitud)
            }}
            className={cn(
              "h-6.5 px-2 rounded-md text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all hover:scale-102 active:scale-98",
              hasActaRegistrada
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-semibold"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30",
            )}
            title={hasActaRegistrada ? "Ver Acta Registrada" : "Registrar Acta de Entrega"}
          >
            {hasActaRegistrada ? (
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileCheck2 className="size-3 text-amber-600 dark:text-amber-400" />
            )}
            <span>
              {hasActaRegistrada
                ? "Acta Registrada"
                : isAsignado
                  ? "Registrar Acta"
                  : "Actas"}
            </span>
          </Button>

          {/* Botón OT (Orden de Trabajo) con estado y alerta de tareas */}
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onOrdenTrabajo(solicitud)
            }}
            className={cn(
              "h-6.5 px-2 rounded-md text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all hover:scale-102 active:scale-98",
              hasOTRegistrada
                ? (isValidado || isEnMantenimiento) && pendientesCount > 0
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold animate-pulse"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-semibold"
                : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30",
            )}
            title={
              hasOTRegistrada
                ? `${completadasCount}/${totalActividades} tareas completadas. Clic para editar tareas y subir evidencias.`
                : "Registrar Orden de Trabajo"
            }
          >
            {hasOTRegistrada ? (
              (isValidado || isEnMantenimiento) && pendientesCount > 0 ? (
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              )
            ) : (
              <Wrench className="size-3 text-sky-600 dark:text-sky-400" />
            )}
            <span>
              {hasOTRegistrada
                ? (isValidado || isEnMantenimiento) && pendientesCount > 0
                  ? `OT (${completadasCount}/${totalActividades} tareas)`
                  : "OT Registrada"
                : isAsignado
                  ? "Registrar OT"
                  : "OT"}
            </span>
          </Button>
        </div>
      }
      onTraceability={onTraceability}
      onActionSelect={onActionSelect}
    />
  )
}

export function EncargadoMantenimientoPage() {
  const completeWorkflowMutation = useCompleteWorkflowTask()
  const [trazabilidadSolicitud, setTrazabilidadSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [filterUrgentesOnly, setFilterUrgentesOnly] = useState(false)
  const [estadoFilter, setEstadoFilter] = useState<
    "ALL" | "ASIGNADO" | "EN_MANTENIMIENTO" | "VALIDADO"
  >("ALL")

  const {
    isAdmin,
    scope,
    setScope,
    isMineOnly,
    currentEmpleado,
    isEncargadoPropio,
  } = useSolicitudRoleScope()

  const [controlActivoTarget, setControlActivoTarget] =
    useState<SolicitudMantenimiento | null>(null)
  const [ordenTrabajoTarget, setOrdenTrabajoTarget] =
    useState<SolicitudMantenimiento | null>(null)
  const [selectedOT, setSelectedOT] = useState<OrdenTrabajo | null>(null)

  const [workflowActionTarget, setWorkflowActionTarget] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch()

  // Consulta para solicitudes en gestión del encargado (ASIGNADO, EN_MANTENIMIENTO, VALIDADO)
  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      estado: estadoFilter === "ALL" ? undefined : estadoFilter,
      ...(isMineOnly && currentEmpleado?.id
        ? { responsableId: currentEmpleado.id }
        : {}),
    }),
  )

  const allItems = useMemo(() => {
    const list = solicitudesQuery.data?.content ?? []
    if (!isMineOnly) return list
    if (currentEmpleado?.id) return list
    return list.filter(isEncargadoPropio)
  }, [solicitudesQuery.data?.content, isMineOnly, currentEmpleado?.id, isEncargadoPropio])

  const rawSolicitudes = useMemo(() => {
    if (estadoFilter === "ASIGNADO") {
      return allItems.filter((s) => (s.estado ?? "").toUpperCase() === "ASIGNADO")
    }
    if (estadoFilter === "EN_MANTENIMIENTO") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "EN_MANTENIMIENTO",
      )
    }
    if (estadoFilter === "VALIDADO") {
      return allItems.filter(
        (s) => (s.estado ?? "").toUpperCase() === "VALIDADO",
      )
    }
    // "ALL" -> filtrar solo solicitudes pertenecientes a la gestión del encargado
    return allItems.filter((s) => {
      const st = (s.estado ?? "").toUpperCase()
      return (
        st === "ASIGNADO" ||
        st === "EN_MANTENIMIENTO" ||
        st === "VALIDADO" ||
        st === "OBSERVADO_MANTENIMIENTO"
      )
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

  const validadasCount = useMemo(
    () =>
      allItems.filter((s) => (s.estado ?? "").toUpperCase() === "VALIDADO")
        .length,
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
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <User className="size-3" />
                    <span>Solo Mías</span>
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  <User className="size-3" />
                  <span>Mis Asignaciones</span>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
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
                ? "bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30 scale-[1.01]"
                : "bg-card/60 border-border/70 hover:bg-muted/40",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Activity className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 truncate">
                En Ejecución
              </p>
              <p className="font-heading text-sm sm:text-base font-bold text-foreground">
                {enMantenimientoCount}
              </p>
            </div>
          </div>

          {/* Validadas (Por Registrar Trabajo Final) */}
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
                  ? "bg-background text-blue-700 dark:text-blue-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="size-1.5 rounded-full bg-blue-500" />
              <span>En Mantenimiento ({enMantenimientoCount})</span>
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
              icon={<FileCheck2 className="size-9 text-muted-foreground" />}
              title="Sin solicitudes en este estado"
              description={
                filterUrgentesOnly
                  ? "No hay solicitudes de alta prioridad pendientes en este filtro."
                  : estadoFilter === "ASIGNADO"
                    ? "No hay solicitudes asignadas pendientes de planificar OT o Control de Activo."
                    : estadoFilter === "EN_MANTENIMIENTO"
                      ? "No hay solicitudes en ejecución técnica en este momento."
                      : estadoFilter === "VALIDADO"
                        ? "No hay solicitudes validadas pendientes de registrar trabajo final."
                        : "No tienes solicitudes de mantenimiento asignadas para gestionar."
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
                <WorkflowListView>
                  {solicitudes.map((solicitud) => (
                    <SolicitudEncargadoListItem
                      key={solicitud.id}
                      solicitud={solicitud}
                      onControlActivo={setControlActivoTarget}
                      onOrdenTrabajo={setOrdenTrabajoTarget}
                      onTraceability={
                        solicitud.processInstanceId
                          ? () => setTrazabilidadSolicitud(solicitud)
                          : undefined
                      }
                      onActionSelect={(action, taskName, fields) =>
                        handleActionSelect(solicitud, action, taskName, fields)
                      }
                    />
                  ))}
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

      {/* Modal de Trazabilidad e Historial de Workflow */}
      <SolicitudTrazabilidadModal
        key={`trazabilidad-${trazabilidadSolicitud?.id}-${trazabilidadSolicitud?.processInstanceId}`}
        solicitud={trazabilidadSolicitud}
        open={Boolean(trazabilidadSolicitud)}
        onOpenChange={(open) => !open && setTrazabilidadSolicitud(null)}
      />

      {/* Dynamic Generic Workflow Action Dialog */}
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
        }}
      />

      {/* Modal Historial de Control de Activo */}
      <ControlActivoHistorialModal
        solicitudId={controlActivoTarget?.id ?? null}
        solicitudNumero={controlActivoTarget?.numero ?? null}
        open={Boolean(controlActivoTarget)}
        onOpenChange={(open) => !open && setControlActivoTarget(null)}
      />

      {/* Modal Detalle de Orden de Trabajo DIRECTO */}
      <OrdenTrabajoDetailModal
        solicitudId={ordenTrabajoTarget?.id ?? null}
        solicitudNumero={ordenTrabajoTarget?.numero ?? null}
        ordenTrabajo={selectedOT}
        open={Boolean(ordenTrabajoTarget || selectedOT)}
        onOpenChange={(open) => {
          if (!open) {
            setOrdenTrabajoTarget(null)
            setSelectedOT(null)
          }
        }}
        onUpdated={() => {
          solicitudesQuery.refetch()
        }}
      />
    </PageShell>
  )
}
