import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Car, Navigation, RefreshCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  WorkflowActionDialog,
  WorkflowHistoryDialog,
  useWorkflowActionTarget,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useCompletarWorkflowSolicitudVehicular } from "../api/solicitud-vehicular.mutations"
import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"
import {
  ConductorViajesResumenCards,
  type ConductorViajesResumen,
} from "../components/ConductorViajesResumenCards"
import { SolicitudVehicularDetailSheet } from "../components/SolicitudVehicularDetailSheet"
import { SolicitudVehicularFilterToolbar } from "../components/SolicitudVehicularFilterToolbar"
import { SolicitudVehicularHeader } from "../components/SolicitudVehicularHeader"
import {
  ConductorViajeListItem,
} from "../components/ConductorViajeListItem"
import {
  SolicitudVehicularListItemSkeleton,
} from "../components/SolicitudVehicularListItem"
import { ControlActivoVehicularHistorialModal } from "../../control-activo/components/ControlActivoVehicularHistorialModal"

type EstadoFiltro = "" | "ASIGNADO" | "EN_VIAJE" | "FINALIZADA"
const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ConductorViajesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("ASIGNADO")
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudVehicular | null>(null)
  const [controlActivoHistorialItem, setControlActivoHistorialItem] =
    useState<SolicitudVehicular | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: selectedEstado,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudVehicular>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitudVehicular()

  // Consulta global para tarjetas de métricas del conductor
  const allQuery = useQuery({
    ...solicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 2,
  })

  // Consulta filtrada según el estado seleccionado y paginación
  const queryParams = useMemo(() => {
    let estadoFilter: string | undefined = undefined
    if (selectedEstado === "ASIGNADO") {
      estadoFilter = "ASIGNADO,APROBADO,APROBADA"
    } else if (selectedEstado === "EN_VIAJE") {
      estadoFilter = "EN_VIAJE,EN_CURSO,EN_PROCESO"
    } else if (selectedEstado === "FINALIZADA") {
      estadoFilter = "FINALIZADA,FINALIZADO,COMPLETADA,RETORNO"
    } else if (selectedEstado) {
      estadoFilter = selectedEstado
    }

    return {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      ...(estadoFilter ? { estado: estadoFilter } : {}),
      ...(search.query ? { search: search.query } : {}),
    }
  }, [search.page, search.query, selectedEstado])

  const query = useQuery(solicitudVehicularQueries.list(queryParams))

  // Detalle reactivo para el Drawer/Sheet
  const detailQuery = useQuery({
    ...solicitudVehicularQueries.detail(selectedDetailId ?? ""),
    enabled: Boolean(selectedDetailId),
  })

  const solicitudes = query.data?.content ?? []
  const totalElements = allQuery.data?.totalElements ?? query.data?.totalElements ?? 0
  const activeDetailItem =
    detailQuery.data ?? solicitudes.find((s) => s.id === selectedDetailId) ?? null

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const resumen: ConductorViajesResumen = useMemo(() => {
    const list = allQuery.data?.content ?? []
    let porSalir = 0
    let enViaje = 0
    let finalizados = 0

    for (const item of list) {
      const estado = (item.estado || "").toUpperCase()
      if (estado === "ASIGNADO" || estado === "APROBADO" || estado === "APROBADA") {
        porSalir++
      } else if (estado === "EN_VIAJE" || estado === "EN_CURSO" || estado === "EN_PROCESO") {
        enViaje++
      } else if (
        estado === "FINALIZADA" ||
        estado === "FINALIZADO" ||
        estado === "COMPLETADA" ||
        estado === "RETORNO"
      ) {
        finalizados++
      }
    }

    return {
      total: list.length,
      porSalir,
      enViaje,
      finalizados,
    }
  }, [allQuery.data])

  const handleRefresh = useCallback(() => {
    query.refetch()
    allQuery.refetch()
    if (selectedDetailId) {
      detailQuery.refetch()
    }
  }, [query, allQuery, detailQuery, selectedDetailId])

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado((prev) => (prev === estado ? "" : (estado as EstadoFiltro)))
  }, [])

  const handleClearAll = useCallback(() => {
    search.setSearch("")
    setSelectedEstado("")
  }, [search])

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

  const handleControlActivo = useCallback(
    (solicitud: SolicitudVehicular, hasControles?: boolean) => {
      const estado = (solicitud.estado || "").toUpperCase()
      const isEnCurso = ["EN_CURSO", "EN_VIAJE", "EN_PROCESO"].includes(estado)

      if (hasControles || isEnCurso) {
        setControlActivoHistorialItem(solicitud)
        return
      }

      const isPorSalir = [
        "APROBADO",
        "APROBADA",
        "ASIGNADO",
        "BORRADOR",
        "PENDIENTE",
      ].includes(estado)

      navigate({
        to: "/gestion-vehicular/controles-activos/nuevo",
        search: {
          solicitudId: solicitud.id,
          tipo: isPorSalir ? "ENTREGA" : undefined,
        },
      })
    },
    [navigate]
  )

  const selectedEstadoLabel = useMemo(() => {
    if (!selectedEstado) return undefined
    const map: Record<string, string> = {
      ASIGNADO: "Por Salir (Asignados)",
      EN_VIAJE: "En Viaje / En Curso",
      FINALIZADA: "Finalizados / Retorno",
    }
    return map[selectedEstado] ?? selectedEstado.replace(/_/g, " ")
  }, [selectedEstado])

  return (
    <PageShell
      layout="scroll"
      className="w-full max-w-none px-2 py-1.5 sm:px-4 sm:py-2.5 md:px-5 lg:px-6 space-y-2 sm:space-y-2.5"
    >
      {/* Encabezado Principal */}
      <SolicitudVehicularHeader
        title="Mis Viajes (Conductor)"
        description="Bandeja de viajes y traslados asignados. Registra la salida, monitorea la ruta y completa el retorno del viaje."
        icon={
          <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
            <Navigation className="size-3.5 sm:size-4" />
          </div>
        }
        totalCount={query.data?.totalElements ?? totalElements}
        countLabel={selectedEstado ? "viajes en este estado" : "viajes registrados"}
        showCreate={false}
        queries={[query, allQuery]}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || allQuery.isRefetching}
      />

      {/* Tarjetas de Resumen de Viajes */}
      <ConductorViajesResumenCards
        resumen={resumen}
        isLoading={allQuery.isLoading && !allQuery.data}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* Barra de Búsqueda y Filtros */}
      <SolicitudVehicularFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        selectedEstadoLabel={selectedEstadoLabel}
        onClearEstado={() => setSelectedEstado("")}
        totalResults={totalElements}
        filteredCount={query.data?.totalElements}
        onClearAll={handleClearAll}
        placeholder="Buscar por número, motivo, solicitante o destino del viaje..."
      />

      {/* Listado de Viajes */}
      <div className="relative flex flex-col space-y-2 sm:space-y-2.5">
        {/* Barra indicadora de actualización */}
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
          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            <EmptyState
              icon={<AlertCircle className="size-7 sm:size-8 text-destructive" />}
              title="Error al consultar los viajes asignados"
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
          <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
            <EmptyState
              icon={<Car className="size-7 sm:size-8 text-muted-foreground/60" />}
              title="No hay viajes en esta bandeja"
              description={
                search.debouncedSearch
                  ? `No se encontraron resultados para "${search.debouncedSearch}". Prueba con otro término.`
                  : selectedEstado === "ASIGNADO"
                    ? "No tienes viajes asignados pendientes de salida actualmente."
                    : selectedEstado === "EN_VIAJE"
                      ? "No tienes viajes en curso actualmente."
                      : selectedEstado === "FINALIZADA"
                        ? "No hay historial de viajes finalizados."
                        : "No se encontraron viajes asignados."
              }
              action={
                search.debouncedSearch || selectedEstado ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="mt-2 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    {search.debouncedSearch ? "Limpiar búsqueda" : "Ver todos los viajes"}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={cn(
                "flex flex-col gap-3 sm:gap-3.5 transition-opacity duration-200",
                query.isFetching && !query.isLoading && "opacity-75"
              )}
            >
              {solicitudes.map((solicitud) => (
                <ConductorViajeListItem
                  key={solicitud.id}
                  solicitud={solicitud}
                  onViewDetail={(sol) => setSelectedDetailId(sol.id)}
                  onSelect={(sol) => setSelectedDetailId(sol.id)}
                  onControlActivo={handleControlActivo}
                  onActionSelect={handleActionSelect}
                  onTraceability={setTraceabilityItem}
                />
              ))}
            </div>

            {/* Paginación */}
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

      {/* Panel Lateral de Detalle Completo de Solicitud */}
      <SolicitudVehicularDetailSheet
        open={Boolean(selectedDetailId)}
        onOpenChange={(open) => {
          if (!open) setSelectedDetailId(null)
        }}
        solicitud={activeDetailItem}
        onControlActivo={handleControlActivo}
        onViewHistory={setTraceabilityItem}
        onActionSelect={handleActionSelect}
      />

      {/* Diálogo interactivo para completar tareas de workflow (Registrar Salida, Registrar Retorno) */}
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

      {/* Modal de Historial y Edición/Eliminación de Controles de Activos */}
      <ControlActivoVehicularHistorialModal
        open={Boolean(controlActivoHistorialItem)}
        onOpenChange={(open) => {
          if (!open) setControlActivoHistorialItem(null)
        }}
        solicitud={controlActivoHistorialItem}
        readOnly={
          Boolean(
            controlActivoHistorialItem &&
              ["EN_CURSO", "EN_VIAJE", "EN_PROCESO"].includes(
                (controlActivoHistorialItem.estado || "").toUpperCase()
              )
          )
        }
      />
    </PageShell>
  )
}
