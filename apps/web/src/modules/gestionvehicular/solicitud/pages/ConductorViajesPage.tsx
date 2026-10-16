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
import { CargaCombustibleModal } from "../../carga-combustible/components/CargaCombustibleModal"
import type { ViajeVehicular } from "../../viaje-vehicular/api/viaje-vehicular.service"
import type { AsignacionVehicular } from "../../asignacion-vehicular/api/asignacion-vehicular.service"

type EstadoFiltro = "" | "ASIGNADO" | "EN_VIAJE" | "RETORNO" | "FINALIZADA"
const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ConductorViajesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("ASIGNADO")
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudVehicular | null>(null)
  const [controlActivoHistorialItem, setControlActivoHistorialItem] =
    useState<SolicitudVehicular | null>(null)
  const [cargaCombustibleTarget, setCargaCombustibleTarget] = useState<{
    solicitud: SolicitudVehicular
    viaje?: ViajeVehicular
    asignacion?: AsignacionVehicular
  } | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudVehicular>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitudVehicular()

  // Consulta global optimizada para métricas del conductor mediante proyección select
  const allQuery = useQuery({
    ...solicitudVehicularQueries.list({ size: 1000, interfaz: "ConductorViajesPage" }),
    staleTime: 1000 * 60 * 3,
    select: (data): ConductorViajesResumen => {
      let porSalir = 0
      let enViaje = 0
      let retorno = 0
      let finalizados = 0

      for (const item of data.content) {
        const estado = (item.estado || "").toUpperCase()
        if (estado === "ASIGNADO" || estado === "APROBADO" || estado === "APROBADA") {
          porSalir++
        } else if (
          estado === "EN_VIAJE" ||
          estado === "EN_CURSO" ||
          estado === "EN_PROCESO"
        ) {
          enViaje++
        } else if (
          estado === "RETORNO" ||
          estado === "EN_RETORNO"
        ) {
          retorno++
        } else if (
          estado === "FINALIZADA" ||
          estado === "FINALIZADO" ||
          estado === "COMPLETADA"
        ) {
          finalizados++
        }
      }

      return {
        total: data.totalElements,
        porSalir,
        enViaje,
        retorno,
        finalizados,
      }
    },
  })

  // Consulta filtrada según el estado seleccionado y paginación
  const queryParams = useMemo(() => {
    let estadoFilter: string | undefined = undefined
    if (selectedEstado === "ASIGNADO") {
      estadoFilter = "ASIGNADO,APROBADO,APROBADA"
    } else if (selectedEstado === "EN_VIAJE") {
      estadoFilter = "EN_VIAJE,EN_CURSO,EN_PROCESO"
    } else if (selectedEstado === "RETORNO") {
      estadoFilter = "RETORNO,EN_RETORNO"
    } else if (selectedEstado === "FINALIZADA") {
      estadoFilter = "FINALIZADA,FINALIZADO,COMPLETADA"
    } else if (selectedEstado) {
      estadoFilter = selectedEstado
    }

    return {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      interfaz: "ConductorViajesPage",
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
  const totalElements = allQuery.data?.total ?? query.data?.totalElements ?? 0
  const activeDetailItem =
    detailQuery.data ?? solicitudes.find((s) => s.id === selectedDetailId) ?? null

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const resumen = allQuery.data ?? null

  const { refetch: refetchQuery } = query
  const { refetch: refetchAllQuery } = allQuery
  const { refetch: refetchDetailQuery } = detailQuery

  const handleRefresh = useCallback(() => {
    refetchQuery()
    refetchAllQuery()
    if (selectedDetailId) {
      refetchDetailQuery()
    }
  }, [refetchQuery, refetchAllQuery, refetchDetailQuery, selectedDetailId])

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado((prev) => (prev === estado ? "" : (estado as EstadoFiltro)))
    search.setPage(0)
  }, [search])

  const handleClearAll = useCallback(() => {
    search.setSearch("")
    setSelectedEstado("")
    search.setPage(0)
  }, [search])

  const handleViewDetail = useCallback((sol: SolicitudVehicular) => {
    setSelectedDetailId(sol.id)
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

  const handleControlActivo = useCallback(
    (solicitud: SolicitudVehicular, hasControles?: boolean) => {
      const estado = (solicitud.estado || "").toUpperCase()
      const isEnCurso = ["EN_CURSO", "EN_VIAJE", "EN_PROCESO", "RETORNO"].includes(estado)

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

  const handleCargaCombustible = useCallback(
    (
      solicitud: SolicitudVehicular,
      viaje?: ViajeVehicular,
      asignacion?: AsignacionVehicular
    ) => {
      setCargaCombustibleTarget({ solicitud, viaje, asignacion })
    },
    []
  )

  const selectedEstadoLabel = useMemo(() => {
    if (!selectedEstado) return undefined
    const map: Record<string, string> = {
      ASIGNADO: "Por Salir (Asignados)",
      EN_VIAJE: "En Viaje",
      RETORNO: "En Retorno",
      FINALIZADA: "Finalizados",
    }
    return map[selectedEstado] ?? selectedEstado.replace(/_/g, " ")
  }, [selectedEstado])

  const getEmptyStateDescription = () => {
    if (search.debouncedSearch) {
      return `No se encontraron resultados para "${search.debouncedSearch}". Prueba con otro término.`
    }
    if (selectedEstado === "ASIGNADO") {
      return "No tienes viajes asignados pendientes de salida actualmente."
    }
    if (selectedEstado === "EN_VIAJE") {
      return "No tienes viajes en curso actualmente."
    }
    if (selectedEstado === "FINALIZADA") {
      return "No hay historial de viajes finalizados."
    }
    return "No se encontraron viajes asignados."
  }

  const getAllowedTipo = () => {
    if (!controlActivoHistorialItem) return "ALL"
    const estado = (controlActivoHistorialItem.estado || "").toUpperCase()
    if (["RETORNO", "EN_RETORNO"].includes(estado)) {
      return "DEVOLUCION"
    }
    if (
      [
        "APROBADO",
        "APROBADA",
        "ASIGNADO",
        "BORRADOR",
        "PENDIENTE",
      ].includes(estado)
    ) {
      return "ENTREGA"
    }
    return "ALL"
  }

  const renderContent = () => {
    if (query.isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <SolicitudVehicularListItemSkeleton key={index} />
          ))}
        </div>
      )
    }

    if (query.isError) {
      return (
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
      )
    }

    if (solicitudes.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <EmptyState
            icon={<Car className="size-7 sm:size-8 text-muted-foreground/60" />}
            title="No hay viajes en esta bandeja"
            description={getEmptyStateDescription()}
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
      )
    }

    return (
      <div className="space-y-3">
        <div
          className={cn(
            "flex flex-col gap-3 sm:gap-3.5 transition-opacity duration-200",
            query.isFetching && !query.isLoading && "opacity-75"
          )}
        >
          {solicitudes.map((solicitud) => {
            const estado = (solicitud.estado || "").toUpperCase()
            const isPrevioSalida = [
              "APROBADO",
              "APROBADA",
              "ASIGNADO",
              "BORRADOR",
              "PENDIENTE",
            ].includes(estado)

            return (
              <ConductorViajeListItem
                key={solicitud.id}
                solicitud={solicitud}
                onViewDetail={handleViewDetail}
                onSelect={handleViewDetail}
                onControlActivo={handleControlActivo}
                onCargaCombustible={
                  isPrevioSalida ? undefined : handleCargaCombustible
                }
                onActionSelect={handleActionSelect}
                onTraceability={setTraceabilityItem}
              />
            )
          })}
        </div>

        {/* Paginación */}
        {query.data && query.data.totalPages > 1 && (
          <Pagination
            page={query.data}
            onPageChange={search.setPage}
            className="border-t pt-1.5 shrink-0 text-xs"
          />
        )}
      </div>
    )
  }

  return (
    <PageShell
      size="lg"
      layout="scroll"
      className="px-2 py-1.5 sm:px-4 sm:py-2.5 space-y-2 sm:space-y-2.5"
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

        {renderContent()}
      </div>

      {/* Panel Lateral de Detalle Completo de Solicitud */}
      <SolicitudVehicularDetailSheet
        open={Boolean(selectedDetailId)}
        onOpenChange={(open) => {
          if (!open) setSelectedDetailId(null)
        }}
        solicitud={activeDetailItem}
        onControlActivo={handleControlActivo}
        onCargaCombustible={
          activeDetailItem &&
          [
            "APROBADO",
            "APROBADA",
            "ASIGNADO",
            "BORRADOR",
            "PENDIENTE",
          ].includes((activeDetailItem.estado || "").toUpperCase())
            ? undefined
            : (sol) => handleCargaCombustible(sol)
        }
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
        allowedTipo={getAllowedTipo()}
        readOnly={
          Boolean(
            controlActivoHistorialItem &&
              ["EN_CURSO", "EN_VIAJE", "EN_PROCESO"].includes(
                (controlActivoHistorialItem.estado || "").toUpperCase()
              )
          )
        }
      />

      {/* Modal de Cargas de Combustible */}
      <CargaCombustibleModal
        open={Boolean(cargaCombustibleTarget)}
        onOpenChange={(open) => {
          if (!open) setCargaCombustibleTarget(null)
        }}
        solicitud={cargaCombustibleTarget?.solicitud ?? null}
        viaje={cargaCombustibleTarget?.viaje}
        asignacion={cargaCombustibleTarget?.asignacion}
      />
    </PageShell>
  )
}
