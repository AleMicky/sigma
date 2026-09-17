import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { AlertCircle, FileText, Plus, RefreshCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { routes } from "@/app/config/routes"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  WorkflowActionDialog,
  WorkflowHistoryDialog,
  WorkflowListView,
  useWorkflowActionTarget,
} from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useCompletarWorkflowSolicitud, useDeleteSolicitud } from "../api/solicitud.mutations"
import { ControlActivoHistorialModal } from "../../control-activo/components/ControlActivoHistorialModal"
import { SolicitudDetailModal } from "../components/SolicitudDetailModal"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudListItem } from "../components/SolicitudListItem"
import { SolicitudResumenCards } from "../components/SolicitudResumenCards"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SolicitudesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [detailItem, setDetailItem] = useState<SolicitudMantenimiento | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)
  const [controlActivoItem, setControlActivoItem] = useState<SolicitudMantenimiento | null>(null)
  const [deletingItem, setDeletingItem] = useState<SolicitudMantenimiento | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: selectedEstado,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()
  const deleteMutation = useDeleteSolicitud()

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
      query.refetch()
      resumenQuery.refetch()
    } catch {
      // Error handled in useDeleteSolicitud
    }
  }

  const query = useSolicitudes({
    interfaz: "SolicitudesPage",
    page: search.page,
    size: PAGE_SIZE,
    ...(selectedEstado ? { estado: selectedEstado } : {}),
    ...(search.query ? { q: search.query } : {}),
  })
  const resumenQuery = useSolicitudResumen("SolicitudesPage")

  const solicitudes = query.data?.content ?? []
  const resumen = resumenQuery.data
  const totalCount = resumen?.total ?? query.data?.totalElements ?? 0

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const handleSelectEstado = (estado: string) => {
    if (!estado) {
      setSelectedEstado("")
      return
    }
    setSelectedEstado((prev) => (prev === estado ? "" : estado))
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Encabezado principal */}
      <SolicitudHeader
        queries={[query, resumenQuery]}
        totalCount={totalCount}
        onRefresh={() => {
          query.refetch()
          resumenQuery.refetch()
        }}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      {/* Contenedor de contenido estructurado */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-3 sm:py-4 gap-3 sm:gap-4">
        {/* Tarjetas KPI de Resumen */}
        <SolicitudResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading}
          selectedEstado={selectedEstado}
          onSelectEstado={handleSelectEstado}
        />

        {/* Barra de Búsqueda y Filtro activo */}
        <SolicitudFilterToolbar
          searchQuery={search.search}
          onSearchChange={search.setSearch}
          selectedEstado={selectedEstado}
          onClearEstado={() => setSelectedEstado("")}
        />

        {/* Listado y Estados UX */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {query.isLoading ? (
            <ListSkeleton
              rows={5}
              rowClassName="h-24 rounded-xl"
              className="space-y-2.5"
            />
          ) : query.isError ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<AlertCircle className="size-8 text-destructive" />}
                title="Error al cargar las solicitudes"
                description={getErrorMessage(query.error)}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      query.refetch()
                      resumenQuery.refetch()
                    }}
                    className="mt-2 gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Reintentar</span>
                  </Button>
                }
              />
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<FileText className="size-8 text-muted-foreground/60" />}
                title={
                  search.debouncedSearch
                    ? "No se encontraron solicitudes coincidentes"
                    : selectedEstado
                      ? `No hay solicitudes con estado "${selectedEstado.replace(/_/g, " ")}"`
                      : "No hay solicitudes de mantenimiento registradas"
                }
                description={
                  search.debouncedSearch
                    ? `No se hallaron resultados para "${search.debouncedSearch}". Prueba con otro término o limpia la búsqueda.`
                    : selectedEstado
                      ? "Puedes seleccionar otro estado en las tarjetas superiores o limpiar el filtro actual."
                      : "Crea una nueva solicitud para reportar averías o mantenimientos requeridos en tus activos."
                }
                action={
                  search.debouncedSearch || selectedEstado ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        search.setSearch("")
                        setSelectedEstado("")
                      }}
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
          ) : (
            <>
              {/* Contenedor scrolleable de items */}
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-0.5",
                  query.isFetching && !query.isLoading && "opacity-75 transition-opacity duration-200",
                )}
              >
                <WorkflowListView>
                  {solicitudes.map((solicitud) => (
                    <SolicitudListItem
                      key={solicitud.id}
                      solicitud={solicitud}
                      onlyWorkflowActionsOnBorrador
                      onViewDetail={(sol) => {
                        setDetailItem(sol)
                      }}
                      onEdit={(sol) => {
                        navigate({
                          to: routes.mantenimientos.editarSolicitud(sol.id),
                        })
                      }}
                      onDelete={(sol) => {
                        setDeletingItem(sol)
                      }}
                      onActionSelect={(sol, action, taskName, fields) => {
                        openAction(sol, action, taskName, fields)
                      }}
                      onTraceability={(sol) => {
                        setTraceabilityItem(sol)
                      }}
                      onRegistrarControlActivo={(sol) => {
                        setControlActivoItem(sol)
                      }}
                    />
                  ))}
                </WorkflowListView>
              </div>

              {/* Paginación */}
              {query.data && (
                <Pagination
                  page={query.data}
                  onPageChange={search.setPage}
                  className="border-t pt-2 shrink-0 text-xs"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Detalle Completo de Solicitud */}
      <SolicitudDetailModal
        open={Boolean(detailItem)}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
        solicitud={detailItem}
        onEdit={(sol) => {
          navigate({
            to: routes.mantenimientos.editarSolicitud(sol.id),
          })
        }}
        onTraceability={(sol) => {
          setTraceabilityItem(sol)
        }}
        onControlActivo={(sol) => {
          setControlActivoItem(sol)
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
        onSuccess={() => {
          closeAction()
          query.refetch()
          resumenQuery.refetch()
        }}
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


