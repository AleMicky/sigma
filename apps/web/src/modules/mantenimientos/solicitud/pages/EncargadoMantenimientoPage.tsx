import { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Inbox, RefreshCw, Wrench } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { toast } from "sonner"
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
import { ordenTrabajoQueries } from "../../orden-trabajo/api/orden-trabajo.queries"
import { OrdenTrabajoDetailModal } from "../../orden-trabajo/components/OrdenTrabajoDetailModal"
import { useCompletarWorkflowSolicitud } from "../api/solicitud.mutations"
import {
  EncargadoResumenCards,
  type EncargadoResumen,
} from "../components/EncargadoResumenCards"
import { RequisitosInicioMantenimientoDialog } from "../components/RequisitosInicioMantenimientoDialog"
import { SolicitudDetailModal } from "../components/SolicitudDetailModal"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudListItem, SolicitudListItemSkeleton } from "../components/SolicitudListItem"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

type EstadoFiltro = "ASIGNADO" | "EN_MANTENIMIENTO" | "EN_REVISION" | "FINALIZADO"
const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EncargadoMantenimientoPage() {
  const queryClient = useQueryClient()
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("ASIGNADO")
  const [detailItem, setDetailItem] = useState<SolicitudMantenimiento | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)
  const [controlActivoItem, setControlActivoItem] = useState<SolicitudMantenimiento | null>(null)
  const [ordenTrabajoItem, setOrdenTrabajoItem] = useState<SolicitudMantenimiento | null>(null)
  const [requisitosItem, setRequisitosItem] = useState<{
    solicitud: SolicitudMantenimiento
    action: WorkflowAction
    taskName?: string
    fields?: WorkflowField[]
  } | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: selectedEstado,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()

  // Consulta de resumen y conteos para el encargado de mantenimiento
  const resumenQuery = useSolicitudResumen("EncargadoMantenimientoPage")

  // Consulta filtrada según el estado operativo seleccionado y paginación
  const query = useSolicitudes({
    interfaz: "EncargadoMantenimientoPage",
    estado: selectedEstado,
    page: search.page,
    size: PAGE_SIZE,
    ...(search.query ? { q: search.query } : {}),
  })

  const solicitudes = query.data?.content ?? []
  const totalElements = query.data?.totalElements ?? 0

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const resumen: EncargadoResumen = useMemo(() => {
    return {
      porIniciar: resumenQuery.data?.porIniciar ?? 0,
      enEjecucion: resumenQuery.data?.enEjecucion ?? 0,
      enRevision: resumenQuery.data?.porRevisar ?? resumenQuery.data?.enRevision ?? 0,
      finalizadas: resumenQuery.data?.finalizadas ?? 0,
    }
  }, [resumenQuery.data])

  const handleRefresh = useCallback(() => {
    query.refetch()
    resumenQuery.refetch()
  }, [query, resumenQuery])

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado(estado as EstadoFiltro)
  }, [])

  const handleActionSelect = useCallback(
    async (
      solicitud: SolicitudMantenimiento,
      action: WorkflowAction,
      taskName?: string,
      fields?: WorkflowField[],
    ) => {
      const estadoNorm = (solicitud.estado ?? "").trim().toUpperCase()

      // Si la solicitud está en revisión o finalizada, el encargado solo puede consultar
      if (
        estadoNorm === "EN_REVISION" ||
        estadoNorm === "FINALIZADO" ||
        estadoNorm === "CANCELADO" ||
        estadoNorm === "RECHAZADO"
      ) {
        toast.info(
          "Esta solicitud se encuentra en revisión. No es posible cambiar de estado en esta fase.",
        )
        return
      }

      // En estado ASIGNADO (o iniciando intervención técnica), validar requisitos obligatorios
      if (estadoNorm === "ASIGNADO") {
        try {
          const controles = await queryClient.fetchQuery(
            controlActivoQueries.bySolicitud(solicitud.id),
          )
          const ot = await queryClient.fetchQuery(
            ordenTrabajoQueries.bySolicitud(solicitud.id),
          )

          const hasEntrega = (controles ?? []).some((c) => c.tipo === "ENTREGA")
          const hasOT = Boolean(ot?.id)

          if (!hasEntrega || !hasOT) {
            setRequisitosItem({
              solicitud,
              action,
              taskName,
              fields,
            })
            return
          }
        } catch {
          // Si ocurre algún fallo al consultar, abrir el modal de requisitos para inspección
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

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-2.5 py-0 sm:px-4 md:px-5 lg:px-6 md:py-0">
      {/* Encabezado Principal */}
      <SolicitudHeader
        title="Bandeja de Ejecución de Mantenimiento"
        description="Gestiona las solicitudes de mantenimiento asignadas a tu cargo, inicia intervenciones técnicas y envíalas a revisión."
        icon={
          <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
            <Wrench className="size-3.5 sm:size-4" />
          </div>
        }
        totalCount={totalElements}
        countLabel="solicitudes en este estado"
        showCreate={false}
        queries={[query, resumenQuery]}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2 sm:py-2.5 gap-2 sm:gap-2.5">
        {/* Tarjetas de Resumen por Estado de Ejecución */}
        <EncargadoResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading}
          selectedEstado={selectedEstado}
          onSelectEstado={handleSelectEstado}
        />

        {/* Barra de Búsqueda y Filtros */}
        <SolicitudFilterToolbar
          searchQuery={search.search}
          onSearchChange={search.setSearch}
          selectedEstado={selectedEstado}
          placeholder="Buscar por folio, título, activo o solicitante..."
        />

        {/* Listado y Estados UX */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Barra indicadora de actualización en segundo plano */}
          {query.isFetching && !query.isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10 h-0.5 overflow-hidden bg-primary/10">
              <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
            </div>
          )}

          {query.isLoading ? (
            <div className="space-y-2 overflow-y-auto pr-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <SolicitudListItemSkeleton key={index} />
              ))}
            </div>
          ) : query.isError ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<AlertCircle className="size-8 text-destructive" />}
                title="Error al consultar las solicitudes asignadas"
                description={getErrorMessage(query.error)}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
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
                icon={<Inbox className="size-8 text-muted-foreground/60" />}
                title="No hay solicitudes en este estado"
                description={
                  search.debouncedSearch
                    ? `No se encontraron resultados para "${search.debouncedSearch}". Prueba con otro término de búsqueda.`
                    : `No tienes solicitudes de mantenimiento con estado "${selectedEstado.replace(/_/g, " ")}".`
                }
                action={
                  search.debouncedSearch ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => search.setSearch("")}
                      className="mt-2 text-xs font-medium cursor-pointer"
                    >
                      Limpiar búsqueda
                    </Button>
                  ) : undefined
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
                  {solicitudes.map((solicitud) => {
                    const estadoNorm = (solicitud.estado ?? "").trim().toUpperCase()
                    const isReadOnlyFlow =
                      selectedEstado === "EN_REVISION" ||
                      selectedEstado === "FINALIZADO" ||
                      estadoNorm === "EN_REVISION" ||
                      estadoNorm === "FINALIZADO" ||
                      estadoNorm === "CANCELADO" ||
                      estadoNorm === "RECHAZADO"

                    return (
                      <SolicitudListItem
                        key={solicitud.id}
                        solicitud={solicitud}
                        showWorkflowActions={!isReadOnlyFlow}
                        onViewDetail={setDetailItem}
                        onSelect={setDetailItem}
                        onRegistrarControlActivo={setControlActivoItem}
                        onGestionarOrdenTrabajo={setOrdenTrabajoItem}
                        onActionSelect={handleActionSelect}
                        onTraceability={setTraceabilityItem}
                      />
                    )
                  })}
                </WorkflowListView>
              </div>

              {/* Paginación */}
              {query.data && (
                <Pagination
                  page={query.data}
                  onPageChange={search.setPage}
                  className="border-t pt-1.5 shrink-0 text-xs"
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
        onTraceability={setTraceabilityItem}
        onControlActivo={setControlActivoItem}
        onGestionarOrdenTrabajo={setOrdenTrabajoItem}
      />

      {/* Modal de Requisitos Obligatorios Previos para Iniciar Mantenimiento */}
      <RequisitosInicioMantenimientoDialog
        open={Boolean(requisitosItem)}
        onOpenChange={(open) => {
          if (!open) setRequisitosItem(null)
        }}
        solicitud={requisitosItem?.solicitud ?? null}
        actionName={requisitosItem?.action.name ?? "Iniciar Mantenimiento"}
        onRegistrarEntrega={(sol) => setControlActivoItem(sol)}
        onGestionarOT={(sol) => setOrdenTrabajoItem(sol)}
        onProceedWithAction={() => {
          if (requisitosItem) {
            const { action, solicitud, taskName, fields } = requisitosItem
            setRequisitosItem(null)
            openAction(solicitud, action, taskName, fields)
          }
        }}
      />

      {/* Diálogo interactivo para completar tareas de workflow (Iniciar Mantenimiento, etc.) */}
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

      {/* Diálogo para visualizar trazabilidad e historial */}
      <WorkflowHistoryDialog
        open={Boolean(traceabilityItem)}
        onOpenChange={(open) => {
          if (!open) setTraceabilityItem(null)
        }}
        processInstanceId={traceabilityItem?.processInstanceId}
        entityCode={traceabilityItem?.numero}
        title="Trazabilidad de Solicitud de Mantenimiento"
      />

      {/* Diálogo para visualizar listado e historial de actas de control de activo */}
      <ControlActivoHistorialModal
        open={Boolean(controlActivoItem)}
        onOpenChange={(open) => {
          if (!open) setControlActivoItem(null)
        }}
        solicitudId={controlActivoItem?.id}
        solicitudNumero={controlActivoItem?.numero}
        allowedTipo={
          controlActivoItem?.estado === "VALIDADO" ||
          controlActivoItem?.estado === "TRABAJO_REALIZADO"
            ? "ALL"
            : "ENTREGA"
        }
        readOnly={
          selectedEstado === "EN_REVISION" ||
          selectedEstado === "FINALIZADO" ||
          controlActivoItem?.estado === "EN_REVISION" ||
          controlActivoItem?.estado === "FINALIZADO" ||
          controlActivoItem?.estado === "CANCELADO" ||
          controlActivoItem?.estado === "RECHAZADO"
        }
      />

      {/* Diálogo para visualizar el detalle completo de la orden de trabajo, checklist y evidencias */}
      <OrdenTrabajoDetailModal
        open={Boolean(ordenTrabajoItem)}
        onOpenChange={(open) => {
          if (!open) setOrdenTrabajoItem(null)
        }}
        solicitudId={ordenTrabajoItem?.id}
        solicitudNumero={ordenTrabajoItem?.numero}
        readOnly={
          selectedEstado === "EN_REVISION" ||
          selectedEstado === "FINALIZADO" ||
          ordenTrabajoItem?.estado === "EN_REVISION" ||
          ordenTrabajoItem?.estado === "FINALIZADO" ||
          ordenTrabajoItem?.estado === "CANCELADO" ||
          ordenTrabajoItem?.estado === "RECHAZADO"
        }
        canManageTasks={
          selectedEstado !== "EN_REVISION" &&
          selectedEstado !== "FINALIZADO" &&
          ordenTrabajoItem?.estado !== "EN_REVISION" &&
          ordenTrabajoItem?.estado !== "FINALIZADO" &&
          ordenTrabajoItem?.estado !== "CANCELADO" &&
          ordenTrabajoItem?.estado !== "RECHAZADO"
        }
      />
    </PageShell>
  )
}

