import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, FileText, Loader2 } from "lucide-react"

import { routes } from "@/app/config/routes"
import {
  WorkflowActionDialog,
  WorkflowHistoryDialog,
  WorkflowListView,
  useWorkflowActionTarget,
} from "@/modules/workflow"
import { PageShell } from "@/shared/components/page-shell"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { useCompletarWorkflowSolicitud } from "../api/solicitud.mutations"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudListItem } from "../components/SolicitudListItem"
import { SolicitudResumenCards } from "../components/SolicitudResumenCards"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

export function SolicitudesPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()

  const query = useSolicitudes({
    interfaz: "SolicitudesPage",
    ...(selectedEstado ? { estado: selectedEstado } : {}),
    ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
  })
  const resumenQuery = useSolicitudResumen()

  const solicitudes = query.data?.content ?? []
  const resumen = resumenQuery.data

  const handleSelectEstado = (estado: string) => {
    if (!estado) {
      setSelectedEstado("")
      return
    }
    setSelectedEstado((prev) => (prev === estado ? "" : estado))
  }


  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      <SolicitudHeader
        queries={[query, resumenQuery]}
        totalCount={resumen?.total ?? query.data?.totalElements}
        onRefresh={() => {
          query.refetch()
          resumenQuery.refetch()
        }}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Tarjetas de Resumen */}
        <SolicitudResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading}
          selectedEstado={selectedEstado}
          onSelectEstado={handleSelectEstado}
        />

        {/* Barra de Búsqueda y Filtros */}
        <SolicitudFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedEstado={selectedEstado}
          onClearEstado={() => setSelectedEstado("")}
        />

        {/* Listado */}
        {query.isLoading && (
          <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Cargando solicitudes de mantenimiento...</span>
          </div>
        )}

        {query.isError && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Error al cargar las solicitudes de mantenimiento
            </p>
            <p className="text-xs text-muted-foreground">
              {query.error instanceof Error
                ? query.error.message
                : "Ocurrió un error inesperado al consultar la API"}
            </p>
          </div>
        )}

        {!query.isLoading && !query.isError && solicitudes.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-8 opacity-40" />
            <p className="text-sm">
              {debouncedSearch.trim()
                ? `No se encontraron solicitudes que coincidan con "${debouncedSearch.trim()}".`
                : selectedEstado
                  ? `No se encontraron solicitudes con estado "${selectedEstado}".`
                  : "No se encontraron solicitudes de mantenimiento."}
            </p>
            {(searchQuery || selectedEstado) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedEstado("")
                }}
                className="text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!query.isLoading && !query.isError && solicitudes.length > 0 && (
          <WorkflowListView>
            {solicitudes.map((solicitud) => (
              <SolicitudListItem
                key={solicitud.id}
                solicitud={solicitud}
                onSelect={(sol) => {
                  navigate({
                    to: routes.mantenimientos.editarSolicitud(sol.id),
                  })
                }}
                onActionSelect={(sol, action, taskName, fields) => {
                  openAction(sol, action, taskName, fields)
                }}
                onTraceability={(sol) => {
                  setTraceabilityItem(sol)
                }}
              />
            ))}
          </WorkflowListView>
        )}
      </div>

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
    </PageShell>
  )
}
