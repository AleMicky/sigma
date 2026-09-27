import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Inbox, KeyRound, RefreshCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
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

import { useCompletarWorkflowSolicitudVehicular } from "../api/solicitud-vehicular.mutations"
import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"
import { AsignacionVehicularDialog } from "../../asignacion-vehicular/components/AsignacionVehicularDialog"
import {
  AsignacionVehicularResumenCards,
  type AsignacionVehicularResumen,
} from "../components/AsignacionVehicularResumenCards"
import { SolicitudVehicularDetailDialog } from "../components/SolicitudVehicularDetailDialog"
import { SolicitudVehicularFilterToolbar } from "../components/SolicitudVehicularFilterToolbar"
import { SolicitudVehicularHeader } from "../components/SolicitudVehicularHeader"
import {
  SolicitudVehicularListItem,
  SolicitudVehicularListItemSkeleton,
} from "../components/SolicitudVehicularListItem"

type EstadoFiltro = "SOLICITADO" | "ASIGNADO" | "OBSERVADO" | "EN_VIAJE"
const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AsignacionVehicularPage() {
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("SOLICITADO")
  const [detailItem, setDetailItem] = useState<SolicitudVehicular | null>(null)
  const [assignItem, setAssignItem] = useState<SolicitudVehicular | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudVehicular | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: selectedEstado,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudVehicular>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitudVehicular()

  // Consulta global para métricas de las tarjetas de resumen
  const allQuery = useQuery({
    ...solicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 2,
  })

  // Consulta filtrada según el estado seleccionado y paginación
  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      ...(selectedEstado ? { estado: selectedEstado } : {}),
      ...(search.query ? { search: search.query } : {}),
    }),
    [search.page, search.query, selectedEstado]
  )

  const query = useQuery(solicitudVehicularQueries.list(queryParams))

  const solicitudes = query.data?.content ?? []
  const totalElements = query.data?.totalElements ?? 0

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const resumen: AsignacionVehicularResumen = useMemo(() => {
    const list = allQuery.data?.content ?? []
    let porAsignar = 0
    let asignadas = 0
    let observadas = 0
    let enViaje = 0

    for (const item of list) {
      const estado = (item.estado || "").toUpperCase()
      if (estado === "SOLICITADO" || estado === "PENDIENTE") {
        porAsignar++
      } else if (estado === "ASIGNADO" || estado === "APROBADA" || estado === "APROBADO") {
        asignadas++
      } else if (estado === "OBSERVADO" || estado === "OBSERVADA" || estado === "RECHAZADO") {
        observadas++
      } else if (estado === "EN_VIAJE" || estado === "EN_PROCESO" || estado === "FINALIZADA" || estado === "COMPLETADA") {
        enViaje++
      }
    }

    return {
      porAsignar,
      asignadas,
      observadas,
      enViaje,
    }
  }, [allQuery.data])

  const handleRefresh = useCallback(() => {
    query.refetch()
    allQuery.refetch()
  }, [query, allQuery])

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado(estado as EstadoFiltro)
  }, [])

  const handleActionSelect = useCallback(
    (
      solicitud: SolicitudVehicular,
      action: WorkflowAction,
      taskName?: string,
      fields?: WorkflowField[]
    ) => {
      openAction(solicitud, action, taskName, fields)
    },
    [openAction]
  )

  return (
    <PageShell
      layout="scroll"
      className="w-full max-w-none px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-5 lg:px-6 space-y-2.5"
    >
      {/* Encabezado Principal */}
      <SolicitudVehicularHeader
        title="Asignación Vehicular"
        description="Bandeja de solicitudes vehiculares para revisión, aprobación y asignación técnica de unidades y conductores."
        icon={
          <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            <KeyRound className="size-3.5 sm:size-4" />
          </div>
        }
        totalCount={totalElements}
        countLabel="solicitudes en este estado"
        showCreate={false}
        queries={[query, allQuery]}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || allQuery.isRefetching}
      />

      {/* Tarjetas de Resumen de Asignación */}
      <AsignacionVehicularResumenCards
        resumen={resumen}
        isLoading={allQuery.isLoading}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* Barra de Búsqueda y Filtros */}
      <SolicitudVehicularFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        selectedEstadoLabel={
          selectedEstado === "EN_VIAJE"
            ? "En Viaje / Proceso"
            : selectedEstado === "SOLICITADO"
              ? "Por Asignar"
              : undefined
        }
        placeholder="Buscar por número, motivo, solicitante o destino..."
      />

      {/* Listado y Estados UX */}
      <div className="relative flex flex-col space-y-2.5">
        {/* Barra indicadora de actualización en segundo plano */}
        {query.isFetching && !query.isLoading && (
          <div className="absolute -top-1 left-0 right-0 z-10 h-0.5 overflow-hidden bg-primary/10 rounded-full">
            <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
          </div>
        )}

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SolicitudVehicularListItemSkeleton key={index} />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<AlertCircle className="size-8 text-destructive" />}
              title="Error al consultar las solicitudes para asignación"
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
                  : selectedEstado === "EN_VIAJE"
                    ? "No hay solicitudes en viaje o en proceso actualmente."
                    : `No tienes solicitudes pendientes de asignación en estado "${selectedEstado.replace(/_/g, " ")}".`
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
          <div className="space-y-2.5">
            {/* Contenedor de items */}
            <div
              className={cn(
                query.isFetching && !query.isLoading && "opacity-75 transition-opacity duration-200"
              )}
            >
              <WorkflowListView>
                {solicitudes.map((solicitud) => {
                  const isSolicitado =
                    (solicitud.estado ?? "").trim().toUpperCase() === "SOLICITADO"

                  return (
                    <SolicitudVehicularListItem
                      key={solicitud.id}
                      solicitud={solicitud}
                      showWorkflowActions={isSolicitado}
                      onViewDetail={setDetailItem}
                      onSelect={setDetailItem}
                      onAssign={setAssignItem}
                      onActionSelect={handleActionSelect}
                      onTraceability={setTraceabilityItem}
                    />
                  )
                })}
              </WorkflowListView>
            </div>

            {/* Paginación: solo cuando hay más de 10 registros o más de 1 página */}
            {query.data && (query.data.totalElements > 10 || query.data.totalPages > 1) && (
              <Pagination
                page={query.data}
                onPageChange={search.setPage}
                className="border-t pt-1.5 shrink-0 text-xs"
              />
            )}
          </div>
        )}
      </div>

      {/* Modal de Asignación de Vehículo y Conductor */}
      <AsignacionVehicularDialog
        open={Boolean(assignItem)}
        onOpenChange={(open) => {
          if (!open) setAssignItem(null)
        }}
        solicitud={assignItem}
        onSuccess={handleRefresh}
      />

      {/* Modal de Detalle Completo de Solicitud */}
      <SolicitudVehicularDetailDialog
        open={Boolean(detailItem)}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null)
        }}
        solicitud={detailItem}
        onAssign={setAssignItem}
        onViewHistory={setTraceabilityItem}
      />

      {/* Diálogo interactivo para completar tareas de workflow */}
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
          handleRefresh()
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
        title="Trazabilidad de Solicitud Vehicular"
      />
    </PageShell>
  )
}
