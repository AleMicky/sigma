import { useCallback, useMemo, useState } from "react"
import { AlertCircle, Inbox, RefreshCw, ShieldCheck } from "lucide-react"

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
} from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useCompletarWorkflowSolicitud } from "../api/solicitud.mutations"
import {
  AprobacionResumenCards,
  type AprobacionResumen,
} from "../components/AprobacionResumenCards"
import { SolicitudDetailModal } from "../components/SolicitudDetailModal"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudListItem, SolicitudListItemSkeleton } from "../components/SolicitudListItem"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

type EstadoFiltro = "SOLICITADO" | "OBSERVADO" | "ASIGNADO" | "EN_MANTENIMIENTO"
const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AprobacionesPage() {
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("SOLICITADO")
  const [detailItem, setDetailItem] = useState<SolicitudMantenimiento | null>(null)
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)

  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: selectedEstado,
  })

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()

  // Consulta de resumen y conteos específicos para AprobacionesPage desde el backend
  const resumenQuery = useSolicitudResumen("AprobacionesPage")

  // Consulta filtrada según el estado operativo seleccionado y paginación
  const query = useSolicitudes({
    interfaz: "AprobacionesPage",
    estado: selectedEstado,
    page: search.page,
    size: PAGE_SIZE,
    ...(search.query ? { q: search.query } : {}),
  })

  const solicitudes = query.data?.content ?? []
  const totalElements = query.data?.totalElements ?? 0

  useClampPage(search.page, search.setPage, query.data?.totalPages)

  const resumen: AprobacionResumen = useMemo(() => {
    return {
      porAprobar: resumenQuery.data?.porAprobar ?? 0,
      observadas: resumenQuery.data?.observadas ?? resumenQuery.data?.enObservadas ?? 0,
      asignadas: resumenQuery.data?.asignadas ?? 0,
      enProceso: resumenQuery.data?.enProceso ?? 0,
    }
  }, [resumenQuery.data])

  const handleRefresh = useCallback(() => {
    query.refetch()
    resumenQuery.refetch()
  }, [query, resumenQuery])

  const handleSelectEstado = useCallback((estado: string) => {
    setSelectedEstado(estado as EstadoFiltro)
  }, [])

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-2.5 py-0 sm:px-4 md:px-5 lg:px-6 md:py-0">
      {/* Encabezado Principal */}
      <SolicitudHeader
        title="Aprobación de Solicitudes"
        description="Bandeja de solicitudes de mantenimiento asignadas para revisión, aprobación y asignación técnica."
        icon={
          <div className="flex size-7.5 sm:size-8.5 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            <ShieldCheck className="size-3.5 sm:size-4" />
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
        {/* Tarjetas de Resumen de Aprobación */}
        <AprobacionResumenCards
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
          selectedEstadoLabel={selectedEstado === "EN_MANTENIMIENTO" ? "En Proceso" : undefined}
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
                title="Error al consultar las solicitudes para aprobación"
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
                    : selectedEstado === "EN_MANTENIMIENTO"
                      ? "No tienes solicitudes de aprobación en proceso de mantenimiento."
                      : `No tienes solicitudes de aprobación en estado "${selectedEstado.replace(/_/g, " ")}".`
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
                    const isSolicitado =
                      (solicitud.estado ?? "").trim().toUpperCase() === "SOLICITADO"

                    return (
                      <SolicitudListItem
                        key={solicitud.id}
                        solicitud={solicitud}
                        showWorkflowActions={isSolicitado}
                        onViewDetail={setDetailItem}
                        onSelect={setDetailItem}
                        onActionSelect={isSolicitado ? openAction : undefined}
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
      />

      {/* Diálogo interactivo para completar tareas de workflow (Aprobar / Observar / Rechazar) */}
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
        title="Trazabilidad de Solicitud"
      />
    </PageShell>
  )
}

