import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertTriangle,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
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
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { toast } from "sonner"

import { ControlActivoHistorialModal } from "@/modules/mantenimientos/control-activo/components/ControlActivoHistorialModal"
import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
import {
  useWorkflowActionTarget,
  WorkflowActionDialog,
  WorkflowListView,
} from "@/modules/workflow"
import {
  useCompleteWorkflowTask,
  useDeleteSolicitud,
} from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  SolicitudFilterToolbar,
  SolicitudQuickViewSheet,
  SolicitudStats,
  SolicitudTrazabilidadModal,
  SolicitudWorkflowListItem,
} from "../components"
import {
  extractPlaca,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"
import { useSolicitudRoleScope } from "../hooks/use-solicitud-role-scope"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

function SolicitudSolicitanteListItem({
  solicitud,
  onOpenEdit,
  onDeleting,
  onQuickView,
  onControlActivo,
  onTraceability,
  onActionSelect,
}: {
  solicitud: SolicitudMantenimiento
  onOpenEdit: (s: SolicitudMantenimiento) => void
  onDeleting: (s: SolicitudMantenimiento) => void
  onQuickView: (s: SolicitudMantenimiento) => void
  onControlActivo: (s: SolicitudMantenimiento) => void
  onTraceability?: () => void
  onActionSelect?: (
    action: any,
    taskName?: string,
    fields?: any[],
  ) => void
}) {
  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isBorrador = estadoNorm === "borrador"
  const isObservado = estadoNorm === "observado"
  const isValidado = estadoNorm === "validado"
  const isEditable = isBorrador || isObservado
  const isTrabajoRealizado = estadoNorm === "trabajo_realizado"
  const placa = extractPlaca(solicitud.activo)
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  // Consultar actas existentes de esta solicitud
  const controlesQuery = useQuery({
    ...controlActivoQueries.list({
      solicitudMantenimientoId: solicitud.id,
      size: 50,
    }),
  })
  const controles = controlesQuery.data?.content ?? []
  const hasEntrega = controles.some((c) => c.tipo === "ENTREGA")
  const hasDevolucion = controles.some((c) => c.tipo === "DEVOLUCION")
  const totalActas = controles.length

  return (
    <SolicitudWorkflowListItem
      key={solicitud.id}
      solicitud={solicitud}
      showWorkflowTrigger={isBorrador || isValidado || isTrabajoRealizado}
      badges={
        <>
          {solicitud.tipoMantenimiento && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10.5px] font-semibold border shrink-0 ${getTipoMantenimientoBadgeClass(
                solicitud.tipoMantenimiento.nombre,
                false,
              )}`}
            >
              <Wrench className="size-2.5 shrink-0" />
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          )}
          {solicitud.tipoFallas && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-55 shrink-0">
              <AlertTriangle className="size-2.5 shrink-0" />
              <span className="truncate">{solicitud.tipoFallas}</span>
            </span>
          )}
          {hasEntrega && hasDevolucion && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onControlActivo(solicitud)
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shrink-0 cursor-pointer hover:bg-emerald-500/20"
              title="Actas de entrega y devolución completadas"
            >
              <CheckCircle2 className="size-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>Actas completadas</span>
            </span>
          )}
        </>
      }
      extraContent={
        <>
          {solicitud.activo && (
            <div className="inline-flex items-center gap-1.5 truncate max-w-sm">
              <Box className="size-3 shrink-0 text-primary opacity-90" />
              <span className="font-mono font-bold text-primary text-[11px]">
                {solicitud.activo.codigo}
              </span>
              <span className="truncate text-foreground/90 font-medium">
                {solicitud.activo.nombre}
              </span>
              {placa ? (
                <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded shrink-0">
                  {placa}
                </span>
              ) : null}
            </div>
          )}
          {solicitud.solicitante && (
            <div className="flex items-center gap-1 truncate max-w-50">
              <User className="size-3 text-muted-foreground/70 shrink-0" />
              <span className="text-muted-foreground/80">Solicita:</span>
              <strong className="truncate font-semibold text-foreground/90">
                {solicitud.solicitante.nombre}
              </strong>
            </div>
          )}
          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md border border-primary/20 text-[10px] shrink-0">
              <span>
                {adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}
              </span>
            </div>
          )}
        </>
      }
      extraActions={
        <div className="flex items-center gap-1">
          {/* Botón Inteligente de Actas: Si ya tiene ambas actas (o solo consulta) muestra "Ver Actas", si está en TRABAJO_REALIZADO y falta devolución muestra "Devolución" */}
          {hasEntrega && hasDevolucion ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onControlActivo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 rounded-md shadow-2xs cursor-pointer"
              title="Ver actas de entrega y devolución registradas"
            >
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Ver Actas</span>
            </Button>
          ) : isTrabajoRealizado && !hasDevolucion ? (
            <Link
              to="/mantenimientos/controles-activos/nuevo"
              search={{
                solicitudId: solicitud.id,
                tipo: "DEVOLUCION",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                size="xs"
                className="h-6.5 gap-1 px-2 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-2xs cursor-pointer"
                title="Registrar Devolución de Activo"
              >
                <ClipboardCheck className="size-3" />
                <span>Devolución</span>
              </Button>
            </Link>
          ) : totalActas > 0 ? (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onControlActivo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 rounded-md shadow-2xs cursor-pointer"
              title="Ver historial de actas registradas"
            >
              <FileCheck2 className="size-3 text-amber-600 dark:text-amber-400" />
              <span>Ver Actas ({totalActas})</span>
            </Button>
          ) : null}

          {/* Botón Ver Detalles */}
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onQuickView(solicitud)}
            className="h-6.5 gap-1 px-2 text-[11px] font-medium hover:bg-muted cursor-pointer"
            title="Ver detalles completos"
          >
            <Eye className="size-3 text-primary" />
            <span>Detalles</span>
          </Button>

          {/* Botón Editar (En Borrador u Observado) */}
          {isEditable && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => onOpenEdit(solicitud)}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium hover:bg-muted cursor-pointer"
              title="Editar solicitud"
            >
              <Pencil className="size-3 text-muted-foreground" />
              <span>Editar</span>
            </Button>
          )}

          {/* Botón Eliminar (Solo en Borrador) */}
          {isBorrador && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => onDeleting(solicitud)}
              className="size-6.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Eliminar solicitud"
            >
              <Trash2 className="size-3 text-destructive/80" />
            </Button>
          )}
        </div>
      }
      onTraceability={onTraceability}
      onQuickView={() => onQuickView(solicitud)}
      onActionSelect={onActionSelect}
    />
  )
}

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
  const [trazabilidadSolicitud, setTrazabilidadSolicitud] =
    useState<SolicitudMantenimiento | null>(null)
  const [controlActivoTarget, setControlActivoTarget] =
    useState<SolicitudMantenimiento | null>(null)

  const handleStatusSelect = (status: string) => {
    setStatusFilter(status)
    search.setPage(0)
  }

  // Base list for counting all categories regardless of current status filter
  const allSolicitudesQuery = useQuery(
    solicitudQueries.list({
      page: 0,
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
      ...(isMineOnly && currentEmpleado?.id
        ? { solicitanteId: currentEmpleado.id }
        : {}),
    }),
  )

  const rawAllSolicitudes = useMemo(
    () => allSolicitudesQuery.data?.content ?? [],
    [allSolicitudesQuery.data?.content],
  )

  const allSolicitudes = useMemo(() => {
    if (!isMineOnly) return rawAllSolicitudes
    if (currentEmpleado?.id) return rawAllSolicitudes
    return rawAllSolicitudes.filter(isSolicitantePropio)
  }, [rawAllSolicitudes, isMineOnly, currentEmpleado?.id, isSolicitantePropio])

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

  const totalCount = useMemo(
    () => (statusFilter ? (allSolicitudesQuery.data?.totalElements ?? allSolicitudes.length) : (solicitudesQuery.data?.totalElements ?? solicitudes.length)),
    [statusFilter, allSolicitudesQuery.data?.totalElements, allSolicitudes.length, solicitudesQuery.data?.totalElements, solicitudes.length],
  )

  const enviadasCount = useMemo(
    () =>
      allSolicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase().trim()
        return est === "solicitado" || est === "pendiente"
      }).length,
    [allSolicitudes],
  )

  const borradorCount = useMemo(
    () =>
      allSolicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase().trim()
        return est === "borrador"
      }).length,
    [allSolicitudes],
  )

  const enProcesoCount = useMemo(
    () =>
      allSolicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase().trim()
        return (
          est === "en_proceso" ||
          est === "en proceso" ||
          est === "en_mantenimiento" ||
          est === "en mantenimiento" ||
          est === "aprobado" ||
          est === "asignado"
        )
      }).length,
    [allSolicitudes],
  )

  const finalizadoCount = useMemo(
    () =>
      allSolicitudes.filter((s) => {
        const est = (s.estado ?? "").toLowerCase().trim()
        return est === "finalizado" || est === "completado" || est === "validado" || est === "trabajo_realizado"
      }).length,
    [allSolicitudes],
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
          totalCount={totalCount}
          borradorCount={borradorCount}
          enviadasCount={enviadasCount}
          enProcesoCount={enProcesoCount}
          finalizadoCount={finalizadoCount}
          isLoading={solicitudesQuery.isLoading || allSolicitudesQuery.isLoading}
          activeStatus={statusFilter}
          onSelectStatus={handleStatusSelect}
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
                {solicitudes.map((solicitud) => (
                  <SolicitudSolicitanteListItem
                    key={solicitud.id}
                    solicitud={solicitud}
                    onOpenEdit={openEdit}
                    onDeleting={setDeleting}
                    onQuickView={setQuickView}
                    onControlActivo={setControlActivoTarget}
                    onTraceability={
                      solicitud.processInstanceId
                        ? () => setTrazabilidadSolicitud(solicitud)
                        : undefined
                    }
                    onActionSelect={(action, taskName, fields) => {
                      workflowAction.openAction(solicitud, action, taskName, fields)
                    }}
                  />
                ))}
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
      />

      {/* Modal Historial / Consulta de Actas */}
      <ControlActivoHistorialModal
        key={`actas-${controlActivoTarget?.id}`}
        solicitudId={controlActivoTarget?.id ?? null}
        solicitudNumero={controlActivoTarget?.numero ?? null}
        readOnly={true}
        open={Boolean(controlActivoTarget)}
        onOpenChange={(open) => !open && setControlActivoTarget(null)}
      />

      {/* Modal de Trazabilidad e Historial de Workflow */}
      <SolicitudTrazabilidadModal
        solicitud={trazabilidadSolicitud}
        open={Boolean(trazabilidadSolicitud)}
        onOpenChange={(open) => !open && setTrazabilidadSolicitud(null)}
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
          allSolicitudesQuery.refetch()
          setQuickView(null)
        }}
      />
    </PageShell>
  )
}
