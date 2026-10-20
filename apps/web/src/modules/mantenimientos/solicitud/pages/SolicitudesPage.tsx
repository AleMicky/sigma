import { useCallback, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, FileText, Plus, RefreshCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  WorkflowActionDialog,
  WorkflowHistoryDialog,
  WorkflowListView,
  useWorkflowActionTarget,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { controlActivoQueries } from "../../control-activo/api/control-activo.queries"
import { ControlActivoHistorialModal } from "../../control-activo/components/ControlActivoHistorialModal"
import { OrdenTrabajoDetailModal } from "../../orden-trabajo/components/OrdenTrabajoDetailModal"
import { useCompletarWorkflowSolicitud, useDeleteSolicitud } from "../api/solicitud.mutations"
import { RequisitosDevolucionDialog } from "../components/RequisitosDevolucionDialog"
import { SolicitudDetailModal } from "../components/SolicitudDetailModal"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import {
  SolicitudListItem,
  SolicitudListItemSkeleton,
  type SolicitudListItemProps,
} from "../components/SolicitudListItem"
import { SolicitudResumenCards } from "../components/SolicitudResumenCards"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"
import type { PageResponse } from "@/shared/types/api.types"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

function getSolicitudesEmptyStateInfo(debouncedSearch: string, selectedEstado: string) {
  if (debouncedSearch) {
    return {
      title: "No se encontraron solicitudes coincidentes",
      description: `No se hallaron resultados para "${debouncedSearch}". Prueba con otro término o limpia la búsqueda.`,
    }
  }

  if (selectedEstado) {
    return {
      title: `No hay solicitudes con estado "${selectedEstado.replace(/_/g, " ")}"`,
      description: "Puedes seleccionar otro estado en las tarjetas superiores o limpiar el filtro actual.",
    }
  }

  return {
    title: "No hay solicitudes de mantenimiento registradas",
    description: "Crea una nueva solicitud para reportar averías o mantenimientos requeridos en tus activos.",
  }
}

interface SolicitudesEmptyStateProps {
  debouncedSearch: string
  selectedEstado: string
  onClearFilters: () => void
}

function SolicitudesEmptyState({
  debouncedSearch,
  selectedEstado,
  onClearFilters,
}: Readonly<SolicitudesEmptyStateProps>) {
  const { title, description } = getSolicitudesEmptyStateInfo(debouncedSearch, selectedEstado)
  const hasActiveFilters = Boolean(debouncedSearch || selectedEstado)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<FileText className="size-8 text-muted-foreground/60" />}
        title={title}
        description={description}
        action={
          hasActiveFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="mt-2 text-xs font-medium cursor-pointer"
            >
              Limpiar filtros
            </Button>
          ) : (
            <Link to={routes.mantenimientos.nuevaSolicitud}>
              <Button
                size="sm"
                className="mt-2 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Crear Primera Solicitud</span>
              </Button>
            </Link>
          )
        }
      />
    </div>
  )
}

interface SolicitudesErrorStateProps {
  error: unknown
  onRetry: () => void
}

function SolicitudesErrorState({ error, onRetry }: Readonly<SolicitudesErrorStateProps>) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<AlertCircle className="size-8 text-destructive" />}
        title="Error al cargar las solicitudes"
        description={getErrorMessage(error)}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Reintentar</span>
          </Button>
        }
      />
    </div>
  )
}

function SolicitudesLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <SolicitudListItemSkeleton key={index} />
      ))}
    </div>
  )
}

interface SolicitudesContentProps {
  isLoading: boolean
  isError: boolean
  error: unknown
  solicitudes: SolicitudMantenimiento[]
  debouncedSearch: string
  selectedEstado: string
  isFetching: boolean
  pageData?: PageResponse<SolicitudMantenimiento>
  onClearFilters: () => void
  onRefresh: () => void
  onViewDetail: (item: SolicitudMantenimiento) => void
  onEdit: (item: SolicitudMantenimiento) => void
  onDelete: (item: SolicitudMantenimiento) => void
  onActionSelect: SolicitudListItemProps["onActionSelect"]
  onTraceability: (item: SolicitudMantenimiento) => void
  onRegistrarControlActivo: (item: SolicitudMantenimiento) => void
  onGestionarOrdenTrabajo: (item: SolicitudMantenimiento) => void
  onPageChange: (page: number) => void
}

function SolicitudesContent({
  isLoading,
  isError,
  error,
  solicitudes,
  debouncedSearch,
  selectedEstado,
  isFetching,
  pageData,
  onClearFilters,
  onRefresh,
  onViewDetail,
  onEdit,
  onDelete,
  onActionSelect,
  onTraceability,
  onRegistrarControlActivo,
  onGestionarOrdenTrabajo,
  onPageChange,
}: Readonly<SolicitudesContentProps>) {
  if (isLoading) {
    return <SolicitudesLoadingSkeleton />
  }

  if (isError) {
    return <SolicitudesErrorState error={error} onRetry={onRefresh} />
  }

  if (solicitudes.length === 0) {
    return (
      <SolicitudesEmptyState
        debouncedSearch={debouncedSearch}
        selectedEstado={selectedEstado}
        onClearFilters={onClearFilters}
      />
    )
  }

  const hasPagination = Boolean(
    pageData && (pageData.totalElements > 10 || pageData.totalPages > 1),
  )

  return (
    <div className="space-y-2.5">
      {/* Contenedor de items */}
      <div
        className={cn(
          isFetching && "opacity-75 transition-opacity duration-200",
        )}
      >
        <WorkflowListView>
          {solicitudes.map((solicitud) => (
            <SolicitudListItem
              key={solicitud.id}
              solicitud={solicitud}
              onlyWorkflowActionsOnBorrador
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onActionSelect={onActionSelect}
              onTraceability={onTraceability}
              onRegistrarControlActivo={onRegistrarControlActivo}
              onGestionarOrdenTrabajo={onGestionarOrdenTrabajo}
            />
          ))}
        </WorkflowListView>
      </div>

      {/* Paginación: solo cuando hay más de 10 registros o más de 1 página */}
      {hasPagination && pageData && (
        <Pagination
          page={pageData}
          onPageChange={onPageChange}
          className="border-t pt-2 shrink-0 text-xs"
        />
      )}
    </div>
  )
}

export function SolicitudesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC")
  const [detailItem, setDetailItem] = useState<SolicitudMantenimiento | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)
  const [controlActivoItem, setControlActivoItem] = useState<SolicitudMantenimiento | null>(null)
  const [ordenTrabajoItem, setOrdenTrabajoItem] = useState<SolicitudMantenimiento | null>(null)
  const [deletingItem, setDeletingItem] = useState<SolicitudMantenimiento | null>(null)
  const [requisitosItem, setRequisitosItem] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: `${selectedEstado}-${sortBy}-${direction}`,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()
  const deleteMutation = useDeleteSolicitud()

  const handleEdit = useCallback(
    (sol: SolicitudMantenimiento) => {
      navigate({
        to: routes.mantenimientos.editarSolicitud(sol.id),
      })
    },
    [navigate],
  )

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Error manejado con toast en useDeleteSolicitud
    }
  }

  const query = useSolicitudes({
    interfaz: "SolicitudesPage",
    page: search.page,
    size: PAGE_SIZE,
    sortBy,
    direction,
    ...(selectedEstado ? { estado: selectedEstado } : {}),
    ...(search.query ? { q: search.query } : {}),
  })
  const resumenQuery = useSolicitudResumen("SolicitudesPage")

  const solicitudes = query.data?.content ?? []
  const resumen = resumenQuery.data
  const totalCount = resumen?.total ?? query.data?.totalElements ?? 0

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado((prev) => (!estado || prev === estado ? "" : estado))
  }, [])

  const handleRefresh = useCallback(() => {
    query.refetch()
    resumenQuery.refetch()
  }, [query, resumenQuery])

  const handleActionSelect = useCallback(
    async (
      solicitud: SolicitudMantenimiento,
      action: WorkflowAction,
      taskName?: string,
      fields?: WorkflowField[],
    ) => {
      const estadoNorm = (solicitud.estado ?? "").trim().toUpperCase()

      // Si la solicitud está en estado TRABAJO_REALIZADO, validar requisito obligatorio de Acta de Devolución
      if (
        estadoNorm === "TRABAJO_REALIZADO" ||
        estadoNorm === "TRABAJO REALIZADO" ||
        estadoNorm === "TRABAJO-REALIZADO"
      ) {
        try {
          const controles = await queryClient.fetchQuery(
            controlActivoQueries.bySolicitud(solicitud.id),
          )
          const hasDevolucion = (controles ?? []).some((c) => c.tipo === "DEVOLUCION")

          if (!hasDevolucion) {
            setRequisitosItem({
              solicitud,
              action,
              taskName,
              fields,
            })
            return
          }
        } catch {
          setRequisitosItem({
            solicitud,
            action,
            taskName,
            fields,
          })
          return
        }
      }

      openAction(solicitud, action, taskName, fields)
    },
    [openAction, queryClient],
  )

  const handleClearFilters = useCallback(() => {
    search.setSearch("")
    setSelectedEstado("")
  }, [search])

  return (
    <PageShell
      layout="scroll"
      className="w-full max-w-none px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-5 lg:px-6 space-y-2.5"
    >
      {/* Encabezado principal */}
      <SolicitudHeader
        queries={[query, resumenQuery]}
        totalCount={totalCount}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      {/* Tarjetas KPI de Resumen */}
      <SolicitudResumenCards
        resumen={resumen}
        isLoading={resumenQuery.isLoading}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* Barra de Búsqueda, Filtro activo y Ordenación */}
      <SolicitudFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        onClearEstado={() => setSelectedEstado("")}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        direction={direction}
        onDirectionChange={setDirection}
      />

      {/* Listado y Estados UX */}
      <div className="relative flex flex-col space-y-2.5">
        {/* Barra indicadora de actualización en segundo plano */}
        {query.isFetching && !query.isLoading && (
          <div className="absolute -top-1 left-0 right-0 z-10 h-0.5 overflow-hidden bg-primary/10 rounded-full">
            <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
          </div>
        )}

        <SolicitudesContent
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          solicitudes={solicitudes}
          debouncedSearch={search.debouncedSearch}
          selectedEstado={selectedEstado}
          isFetching={query.isFetching && !query.isLoading}
          pageData={query.data}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          onViewDetail={setDetailItem}
          onEdit={handleEdit}
          onDelete={setDeletingItem}
          onActionSelect={handleActionSelect}
          onTraceability={setTraceabilityItem}
          onRegistrarControlActivo={setControlActivoItem}
          onGestionarOrdenTrabajo={setOrdenTrabajoItem}
          onPageChange={search.setPage}
        />
      </div>

      {/* Modal de Detalle Completo de Solicitud */}
      <SolicitudDetailModal
        open={Boolean(detailItem)}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
        solicitud={detailItem}
        onEdit={handleEdit}
        onTraceability={setTraceabilityItem}
        onControlActivo={setControlActivoItem}
        onGestionarOrdenTrabajo={setOrdenTrabajoItem}
      />

      {/* Modal de Requisitos de Devolución Obligatoria */}
      <RequisitosDevolucionDialog
        open={Boolean(requisitosItem)}
        onOpenChange={(open) => {
          if (!open) setRequisitosItem(null)
        }}
        solicitud={requisitosItem?.solicitud ?? null}
        actionName={requisitosItem?.action.name ?? "Completar Solicitud"}
        onRegistrarDevolucion={(sol) => setControlActivoItem(sol)}
        onProceedWithAction={() => {
          if (requisitosItem) {
            const { action, solicitud, taskName, fields } = requisitosItem
            setRequisitosItem(null)
            openAction(solicitud, action, taskName, fields)
          }
        }}
      />

      {/* Diálogo para completar acciones de workflow de forma interactiva */}
      <WorkflowActionDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeAction()
        }}
        action={target?.action ?? null}
        taskName={target?.taskName}
        fields={target?.fields}
        entityId={target?.item.id}
        onExecute={async ({ variables }) => {
          if (!target) return
          await completarWorkflowMutation.mutateAsync({
            id: target.item.id,
            payload: { variables },
          })
        }}
        onSuccess={closeAction}
      />

      {/* Diálogo para consultar trazabilidad e historial de tareas */}
      <WorkflowHistoryDialog
        open={Boolean(traceabilityItem)}
        onOpenChange={(open) => {
          if (!open) setTraceabilityItem(null)
        }}
        processInstanceId={traceabilityItem?.processInstanceId}
        entityCode={traceabilityItem?.numero}
        title="Trazabilidad de Solicitud de Mantenimiento"
      />

      {/* Diálogo para visualizar listado e historial de actas de control de activo (solo Devolución para Solicitudes) */}
      <ControlActivoHistorialModal
        open={Boolean(controlActivoItem)}
        onOpenChange={(open) => {
          if (!open) setControlActivoItem(null)
        }}
        solicitudId={controlActivoItem?.id}
        solicitudNumero={controlActivoItem?.numero}
        allowedTipo="DEVOLUCION"
      />

      {/* Diálogo para visualizar la orden de trabajo (solo consulta) */}
      <OrdenTrabajoDetailModal
        open={Boolean(ordenTrabajoItem)}
        onOpenChange={(open) => {
          if (!open) setOrdenTrabajoItem(null)
        }}
        solicitudId={ordenTrabajoItem?.id}
        solicitudNumero={ordenTrabajoItem?.numero}
        readOnly={true}
      />

      {/* Diálogo de confirmación para eliminar solicitud en borrador */}
      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null)
        }}
        title="Eliminar Solicitud de Mantenimiento"
        description={`¿Estás seguro de que deseas eliminar la solicitud ${deletingItem?.numero || ""}? Esta acción es permanente y no se puede deshacer.`}
        confirmLabel="Eliminar Solicitud"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </PageShell>
  )
}


