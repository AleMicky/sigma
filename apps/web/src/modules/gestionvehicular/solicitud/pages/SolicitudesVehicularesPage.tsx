import { useCallback, useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
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

import { tipoSolicitudVehicularQueries } from "@/modules/gestionvehicular/tipo-solicitud/api/tipo-solicitud.queries"
import {
  useCompletarWorkflowSolicitudVehicular,
  useDeleteSolicitudVehicular,
} from "../api/solicitud-vehicular.mutations"
import { solicitudVehicularQueries } from "../api/solicitud-vehicular.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"
import { SolicitudVehicularDetailSheet } from "../components/SolicitudVehicularDetailSheet"
import { SolicitudVehicularFilterToolbar } from "../components/SolicitudVehicularFilterToolbar"
import { SolicitudVehicularHeader } from "../components/SolicitudVehicularHeader"
import {
  SolicitudVehicularListItem,
  SolicitudVehicularListItemSkeleton,
} from "../components/SolicitudVehicularListItem"
import { SolicitudVehicularResumenCards } from "../components/SolicitudVehicularResumenCards"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SolicitudesVehicularesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [selectedTipoId, setSelectedTipoId] = useState<string>("")
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [historyItem, setHistoryItem] = useState<SolicitudVehicular | null>(null)
  const [deletingItem, setDeletingItem] = useState<SolicitudVehicular | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: `${selectedEstado}-${selectedTipoId}`,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudVehicular>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitudVehicular()
  const deleteMutation = useDeleteSolicitudVehicular()

  // Consulta de Tipos de Solicitud para el filtro
  const tiposQuery = useQuery({
    ...tipoSolicitudVehicularQueries.list({ size: 100 }),
    staleTime: 1000 * 60 * 5,
  })
  const tiposOptions = useMemo(() => {
    return (tiposQuery.data?.content ?? []).map((t) => ({
      id: t.id,
      nombre: t.nombre,
    }))
  }, [tiposQuery.data])

  const handleEdit = useCallback(
    (sol: SolicitudVehicular) => {
      navigate({
        to: routes.gestionVehicular.editarSolicitud(sol.id),
      })
    },
    [navigate]
  )

  const handleAssign = useCallback(() => {
    navigate({
      to: routes.gestionVehicular.asignaciones,
    })
  }, [navigate])

  const handleControlActivo = useCallback(() => {
    navigate({
      to: routes.mantenimientos.controlesActivos.nuevo,
    })
  }, [navigate])

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    try {
      await deleteMutation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Notificado por el mutation
    }
  }

  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      ...(search.query ? { search: search.query } : {}),
      ...(selectedEstado ? { estado: selectedEstado } : {}),
      ...(selectedTipoId ? { tipoSolicitudVehicularId: selectedTipoId } : {}),
    }),
    [search.page, search.query, selectedEstado, selectedTipoId]
  )

  const query = useQuery(solicitudVehicularQueries.list(queryParams))

  // Consulta para métricas globales de tarjetas resumen
  const allQuery = useQuery({
    ...solicitudVehicularQueries.list({ size: 1000 }),
    staleTime: 1000 * 60 * 2,
  })

  // Consulta reactiva para el modal de detalle
  const detailQuery = useQuery({
    ...solicitudVehicularQueries.detail(selectedDetailId ?? ""),
    enabled: Boolean(selectedDetailId),
  })

  const solicitudes = query.data?.content ?? []
  const totalCount = allQuery.data?.totalElements ?? query.data?.totalElements ?? 0

  const activeDetailItem =
    detailQuery.data ?? solicitudes.find((s) => s.id === selectedDetailId) ?? null

  const resumen = useMemo(() => {
    const list = allQuery.data?.content ?? solicitudes

    let borradores = 0
    let solicitados = 0
    let aprobados = 0
    let enRuta = 0
    let finalizadas = 0

    for (const item of list) {
      const estado = (item.estado || "").toUpperCase().trim()
      if (estado === "BORRADOR" || estado === "PENDIENTE") {
        borradores++
      } else if (estado === "SOLICITADO" || estado === "OBSERVADO") {
        solicitados++
      } else if (estado === "APROBADO" || estado === "APROBADA") {
        aprobados++
      } else if (
        estado === "EN_CURSO" ||
        estado === "EN_VIAJE" ||
        estado === "RETORNO" ||
        estado === "EN_RUTA"
      ) {
        enRuta++
      } else if (
        estado === "FINALIZADA" ||
        estado === "COMPLETADA" ||
        estado === "FINALIZADO"
      ) {
        finalizadas++
      } else {
        solicitados++
      }
    }

    return {
      total: allQuery.data?.totalElements ?? list.length,
      borradores,
      solicitados,
      aprobados,
      enRuta,
      finalizadas,
    }
  }, [allQuery.data, solicitudes])

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado((prev) => (!estado || prev === estado ? "" : estado))
  }, [])

  const handleClearAllFilters = useCallback(() => {
    search.setSearch("")
    setSelectedEstado("")
    setSelectedTipoId("")
  }, [search])

  const selectedEstadoLabel = useMemo(() => {
    if (!selectedEstado) return undefined
    const map: Record<string, string> = {
      BORRADOR: "Borradores",
      "SOLICITADO,OBSERVADO": "Por Revisar",
      SOLICITADO: "Solicitados",
      OBSERVADO: "Observados",
      APROBADO: "Aprobados",
      "EN_CURSO,RETORNO": "En Ruta",
      EN_CURSO: "En Curso",
      RETORNO: "En Retorno",
      FINALIZADA: "Finalizadas",
      COMPLETADA: "Completadas",
    }
    return map[selectedEstado] ?? selectedEstado.replace(/_/g, " ")
  }, [selectedEstado])

  const handleRefresh = useCallback(() => {
    query.refetch()
    allQuery.refetch()
    if (selectedDetailId) {
      detailQuery.refetch()
    }
  }, [query, allQuery, detailQuery, selectedDetailId])

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
      className="w-full max-w-none px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-5 lg:px-6 space-y-3"
    >
      {/* Encabezado principal */}
      <SolicitudVehicularHeader
        queries={[query, allQuery]}
        totalCount={totalCount}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || allQuery.isRefetching}
      />

      {/* Tarjetas KPI de Resumen interactivo con barra porcentual y elevación hover */}
      <SolicitudVehicularResumenCards
        resumen={resumen}
        isLoading={allQuery.isLoading && !allQuery.data}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* Barra de Búsqueda, Filtro Avanzado por Tipo y Chips Activos */}
      <SolicitudVehicularFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        selectedEstadoLabel={selectedEstadoLabel}
        onClearEstado={() => setSelectedEstado("")}
        selectedTipoId={selectedTipoId}
        onSelectTipoId={setSelectedTipoId}
        tiposSolicitud={tiposOptions}
        totalResults={totalCount}
        filteredCount={query.data?.totalElements}
        onClearAll={handleClearAllFilters}
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
              title="Error al cargar las solicitudes vehiculares"
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
              icon={<FileText className="size-8 text-muted-foreground/60" />}
              title={
                search.debouncedSearch
                  ? "No se encontraron solicitudes coincidentes"
                  : selectedEstado || selectedTipoId
                    ? "No hay solicitudes con los filtros seleccionados"
                    : "No hay solicitudes de vehículos registradas"
              }
              description={
                search.debouncedSearch
                  ? `No se hallaron resultados para "${search.debouncedSearch}". Prueba con otro término o limpia la búsqueda.`
                  : selectedEstado || selectedTipoId
                    ? "Puedes seleccionar otros filtros o restablecer la búsqueda."
                    : "Crea una nueva solicitud vehicular para programar traslados y comisiones de viaje."
              }
              action={
                search.debouncedSearch || selectedEstado || selectedTipoId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="mt-2 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    Limpiar todos los filtros
                  </Button>
                ) : (
                  <Link to={routes.gestionVehicular.nuevaSolicitud}>
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
          <div className="space-y-2.5">
            {/* Contenedor de items con WorkflowListView */}
            <div
              className={cn(
                "transition-opacity duration-200",
                query.isFetching && !query.isLoading && "opacity-75"
              )}
            >
              <WorkflowListView>
                {solicitudes.map((solicitud) => (
                  <SolicitudVehicularListItem
                    key={solicitud.id}
                    solicitud={solicitud}
                    showWorkflowActions={true}
                    onViewDetail={(sol) => setSelectedDetailId(sol.id)}
                    onEdit={handleEdit}
                    onAssign={handleAssign}
                    onControlActivo={handleControlActivo}
                    onDelete={setDeletingItem}
                    onActionSelect={handleActionSelect}
                    onTraceability={setHistoryItem}
                  />
                ))}
              </WorkflowListView>
            </div>

            {/* Paginación: cuando hay más de una página */}
            {query.data && query.data.totalPages > 1 && (
              <Pagination
                page={query.data}
                onPageChange={search.setPage}
                className="border-t pt-2 shrink-0 text-xs"
              />
            )}
          </div>
        )}
      </div>

      {/* Panel Lateral Maestro-Detalle Completo de Solicitud (Sheet) */}
      <SolicitudVehicularDetailSheet
        open={Boolean(selectedDetailId)}
        onOpenChange={(open) => {
          if (!open) setSelectedDetailId(null)
        }}
        solicitud={activeDetailItem}
        onEdit={handleEdit}
        onAssign={handleAssign}
        onControlActivo={handleControlActivo}
        onViewHistory={setHistoryItem}
        onActionSelect={handleActionSelect}
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
        open={Boolean(historyItem)}
        onOpenChange={(open) => {
          if (!open) setHistoryItem(null)
        }}
        processInstanceId={historyItem?.processInstanceId}
        entityCode={historyItem?.numero}
        title="Trazabilidad de Solicitud Vehicular"
      />

      {/* Diálogo de confirmación para eliminar solicitud en borrador */}
      <ConfirmDeleteDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null)
        }}
        title="Eliminar Solicitud Vehicular"
        description={`¿Estás seguro de que deseas eliminar la solicitud ${deletingItem?.numero || ""}? Esta acción es permanente y no se puede deshacer.`}
        confirmLabel="Eliminar Solicitud"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </PageShell>
  )
}
