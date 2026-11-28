import { useCallback, useMemo, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, FileText, Plus, RefreshCw, Star } from "lucide-react"

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
  useWorkflowActionTarget,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { cuestionarioQueries } from "@/modules/cuestionarios/api/cuestionario.queries"
import type { AsignacionCuestionario } from "@/modules/cuestionarios/api/cuestionario.types"
import { ENTIDAD_TIPO_SOLICITUD_VEHICULAR } from "@/modules/cuestionarios/lib/cuestionario.utils"
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
  const searchParams = (useSearch({ strict: false }) ?? {}) as {
    solicitudId?: string
    estado?: string
  }

  const [selectedEstado, setSelectedEstado] = useState<string>(
    searchParams.estado ?? ""
  )
  const [selectedTipoId, setSelectedTipoId] = useState<string>("")
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
    searchParams.solicitudId ?? null
  )
  const [historyItem, setHistoryItem] = useState<SolicitudVehicular | null>(null)
  const [deletingItem, setDeletingItem] = useState<SolicitudVehicular | null>(null)

  // Búsqueda paginada sin resetKey agresivo para no borrar el término al alternar filtros
  const search = usePaginatedSearch({
    debounceMs: 300,
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

  const handleViewDetail = useCallback((sol: SolicitudVehicular) => {
    setSelectedDetailId(sol.id)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    const idToDelete = deletingItem.id
    try {
      await deleteMutation.mutateAsync(idToDelete)
      setDeletingItem(null)
      // Si la solicitud eliminada estaba abierta en el detalle lateral, cerrarla
      if (selectedDetailId === idToDelete) {
        setSelectedDetailId(null)
      }
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
      interfaz: "SolicitudesVehicularesPage",
      ...(search.query ? { search: search.query } : {}),
      ...(selectedEstado ? { estado: selectedEstado } : {}),
      ...(selectedTipoId ? { tipoSolicitudVehicularId: selectedTipoId } : {}),
    }),
    [search.page, search.query, selectedEstado, selectedTipoId]
  )

  const query = useQuery(solicitudVehicularQueries.list(queryParams))

  // KPIs globales: única fuente = agregados del servidor en
  // GET /api/v1/reportes/solicitudes-vehiculares (ReporteSolicitudesGeneralResponse).
  // No se cuentan `content` ni `totalElements` de la lista paginada (REQ-VEH-009).
  const resumenQuery = useQuery({
    ...solicitudVehicularQueries.reporteGeneral(),
    staleTime: 1000 * 60 * 3,
    select: (data) => ({
      total: data.totalSolicitudes,
      // Correspondencia explícita con las etiquetas actuales de la UI:
      //   borradores ← solicitudesBorrador
      //   solicitados ("Por Revisar") ← solicitudesPendientes
      //   aprobados ← solicitudesAsignadas
      //   enRuta ← solicitudesEnCurso
      //   finalizadas ← solicitudesFinalizadas
      // `solicitudesRechazadas` y `totalPasajeros` no tienen tarjeta en esta
      // página: no se inventa una etiqueta ni se mezclan en otro KPI.
      borradores: data.solicitudesBorrador,
      solicitados: data.solicitudesPendientes,
      aprobados: data.solicitudesAsignadas,
      enRuta: data.solicitudesEnCurso,
      finalizadas: data.solicitudesFinalizadas,
    }),
  })

  // Consulta reactiva para el modal/sheet de detalle
  const detailQuery = useQuery({
    ...solicitudVehicularQueries.detail(selectedDetailId ?? ""),
    enabled: Boolean(selectedDetailId),
  })

  const solicitudes = useMemo(
    () => query.data?.content ?? [],
    [query.data?.content]
  )

  const finalizadasIds = useMemo(
    () =>
      solicitudes
        .filter((s) => (s.estado ?? "").trim().toUpperCase() === "FINALIZADA")
        .map((s) => s.id),
    [solicitudes]
  )

  const asignacionesLoteQuery = useQuery({
    ...cuestionarioQueries.misAsignacionesLote(
      ENTIDAD_TIPO_SOLICITUD_VEHICULAR,
      finalizadasIds
    ),
    enabled: finalizadasIds.length > 0,
    staleTime: 1000 * 60 * 2,
  })

  const misPendientesVehicularesQuery = useQuery({
    ...cuestionarioQueries.misPendientes({
      page: 0,
      size: 1,
      estado: "PENDIENTE",
      entidadTipo: ENTIDAD_TIPO_SOLICITUD_VEHICULAR,
    }),
    staleTime: 1000 * 60 * 2,
  })

  const asignacionesBySolicitudId = useMemo(() => {
    const map = new Map<string, AsignacionCuestionario>()
    for (const item of asignacionesLoteQuery.data ?? []) {
      map.set(item.entidadId, item)
    }
    return map
  }, [asignacionesLoteQuery.data])

  const totalPendientesEvaluacion = useMemo(() => {
    const enPagina = (asignacionesLoteQuery.data ?? []).filter(
      (item) => item.estado === "PENDIENTE"
    ).length
    const enServidor = misPendientesVehicularesQuery.data?.totalElements ?? 0
    return Math.max(enPagina, enServidor)
  }, [asignacionesLoteQuery.data, misPendientesVehicularesQuery.data?.totalElements])

  const resumen = resumenQuery.data
  const totalCount = resumen?.total

  const activeDetailItem =
    detailQuery.data ?? solicitudes.find((s) => s.id === selectedDetailId) ?? null

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const handleSelectEstado = useCallback(
    (estado: string) => {
      setSelectedEstado((prev) => (!estado || prev === estado ? "" : estado))
      search.setPage(0)
    },
    [search]
  )

  const handleSelectTipoId = useCallback(
    (tipoId: string) => {
      setSelectedTipoId(tipoId)
      search.setPage(0)
    },
    [search]
  )

  const handleClearAllFilters = useCallback(() => {
    search.setSearch("")
    search.setPage(0)
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

  const handleCuestionarioResponded = useCallback(() => {
    if (finalizadasIds.length > 0) {
      void asignacionesLoteQuery.refetch()
    }
    void misPendientesVehicularesQuery.refetch()
  }, [finalizadasIds.length, asignacionesLoteQuery, misPendientesVehicularesQuery])

  const handleRefresh = useCallback(() => {
    query.refetch()
    resumenQuery.refetch()
    tiposQuery.refetch()
    if (finalizadasIds.length > 0) {
      void asignacionesLoteQuery.refetch()
    }
    void misPendientesVehicularesQuery.refetch()
    if (selectedDetailId) {
      detailQuery.refetch()
    }
  }, [
    query,
    resumenQuery,
    tiposQuery,
    finalizadasIds.length,
    asignacionesLoteQuery,
    misPendientesVehicularesQuery,
    detailQuery,
    selectedDetailId,
  ])

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
        queries={[query, resumenQuery]}
        totalCount={totalCount}
        onRefresh={handleRefresh}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      {/* Los agregados fallidos no se sustituyen por ceros: se anuncian y se pueden reintentar */}
      {resumenQuery.isError && (
        <div
          role="alert"
          aria-busy="false"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Error al cargar los indicadores de solicitudes
              </p>
              <p className="text-xs text-destructive/90">
                {getErrorMessage(resumenQuery.error)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs cursor-pointer"
            onClick={() => void resumenQuery.refetch()}
          >
            <RefreshCw className="size-3.5" />
            Reintentar métricas
          </Button>
        </div>
      )}

      {/* Tarjetas KPI de Resumen interactivo con barra porcentual y elevación hover */}
      {!resumenQuery.isError && (
        <SolicitudVehicularResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading && !resumen}
          selectedEstado={selectedEstado}
          onSelectEstado={handleSelectEstado}
        />
      )}

      {/* Barra de Búsqueda, Filtro Avanzado por Tipo y Chips Activos */}
      <SolicitudVehicularFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        selectedEstadoLabel={selectedEstadoLabel}
        onClearEstado={() => setSelectedEstado("")}
        selectedTipoId={selectedTipoId}
        onSelectTipoId={handleSelectTipoId}
        tiposSolicitud={tiposOptions}
        totalResults={totalCount}
        filteredCount={query.data?.totalElements}
        onClearAll={handleClearAllFilters}
      />

      {/* Aviso discreto de evaluaciones pendientes de viajes finalizados */}
      {totalPendientesEvaluacion > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warning/35 bg-warning/10 px-3.5 py-2 text-xs text-foreground"
        >
          <div className="flex items-center gap-2">
            <Star className="size-4 shrink-0 text-warning" />
            <span>
              Tienes{" "}
              <strong className="font-semibold tabular-nums">
                {totalPendientesEvaluacion}
              </strong>{" "}
              {totalPendientesEvaluacion === 1
                ? "evaluación pendiente de un viaje finalizado."
                : "evaluaciones pendientes de viajes finalizados."}
            </span>
          </div>
          <Link to={routes.cuestionarios.misPendientes}>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-7 gap-1 rounded-lg border-warning/40 bg-background/80 text-xs font-semibold text-warning hover:bg-warning/15 hover:text-warning"
            >
              Ver mis evaluaciones
            </Button>
          </Link>
        </div>
      )}

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
          <div className="space-y-3">
            {/* Contenedor de items con separación estética */}
            <div
              className={cn(
                "flex flex-col gap-3 sm:gap-3.5 transition-opacity duration-200",
                query.isFetching && !query.isLoading && "opacity-75"
              )}
            >
              {solicitudes.map((solicitud) => (
                <SolicitudVehicularListItem
                  key={solicitud.id}
                  solicitud={solicitud}
                  onlyWorkflowActionsOnBorrador={true}
                  onViewDetail={handleViewDetail}
                  onEdit={handleEdit}
                  onDelete={setDeletingItem}
                  onActionSelect={handleActionSelect}
                  onTraceability={setHistoryItem}
                  cuestionarioAsignacion={asignacionesBySolicitudId.get(
                    solicitud.id
                  )}
                  onCuestionarioResponded={handleCuestionarioResponded}
                />
              ))}
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
        onDelete={setDeletingItem}
        onViewHistory={setHistoryItem}
        onActionSelect={handleActionSelect}
        cuestionarioAsignacion={
          activeDetailItem
            ? asignacionesBySolicitudId.get(activeDetailItem.id)
            : undefined
        }
        onCuestionarioResponded={handleCuestionarioResponded}
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

      {/* Diálogo de confirmación para eliminar solicitud en borrador/pendiente */}
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
