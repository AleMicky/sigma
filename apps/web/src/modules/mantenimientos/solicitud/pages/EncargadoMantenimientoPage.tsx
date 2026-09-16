import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, Inbox, Loader2, Wrench } from "lucide-react"

import { routes } from "@/app/config/routes"
import {
  WorkflowActionDialog,
  WorkflowHistoryDialog,
  WorkflowListView,
  useWorkflowActionTarget,
} from "@/modules/workflow"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"

import { ControlActivoHistorialModal } from "../../control-activo/components/ControlActivoHistorialModal"
import { useCompletarWorkflowSolicitud } from "../api/solicitud.mutations"
import {
  EncargadoResumenCards,
  type EncargadoResumen,
} from "../components/EncargadoResumenCards"
import { SolicitudFilterToolbar } from "../components/SolicitudFilterToolbar"
import { SolicitudHeader } from "../components/SolicitudHeader"
import { SolicitudListItem } from "../components/SolicitudListItem"
import { useSolicitudes, useSolicitudResumen } from "../hooks/use-solicitudes"
import type { SolicitudMantenimiento } from "../types/solicitud.type"

type EstadoFiltro = "ASIGNADO" | "EN_MANTENIMIENTO" | "EN_REVISION" | "FINALIZADO"

export function EncargadoMantenimientoPage() {
  const navigate = useNavigate()
  const [selectedEstado, setSelectedEstado] = useState<EstadoFiltro>("ASIGNADO")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [traceabilityItem, setTraceabilityItem] = useState<SolicitudMantenimiento | null>(null)
  const [controlActivoItem, setControlActivoItem] = useState<SolicitudMantenimiento | null>(null)
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const { target, isOpen, openAction, closeAction } =
    useWorkflowActionTarget<SolicitudMantenimiento>()
  const completarWorkflowMutation = useCompletarWorkflowSolicitud()

  // Consulta de resumen y conteos para el encargado de mantenimiento
  const resumenQuery = useSolicitudResumen("EncargadoMantenimientoPage")

  // Consulta filtrada según el estado operativo seleccionado
  const query = useSolicitudes({
    interfaz: "EncargadoMantenimientoPage",
    estado: selectedEstado,
    ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
  })

  const solicitudes = query.data?.content ?? []
  const totalElements = query.data?.totalElements ?? 0

  const resumen: EncargadoResumen = useMemo(() => {
    return {
      porIniciar: resumenQuery.data?.porIniciar ?? 0,
      enEjecucion: resumenQuery.data?.enEjecucion ?? 0,
      enRevision: resumenQuery.data?.porRevisar ?? resumenQuery.data?.enRevision ?? 0,
      finalizadas: resumenQuery.data?.finalizadas ?? 0,
    }
  }, [resumenQuery.data])

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      {/* Encabezado Principal */}
      <SolicitudHeader
        title="Bandeja de Ejecución de Mantenimiento"
        description="Gestiona las solicitudes de mantenimiento asignadas a tu cargo, inicia intervenciones técnicas y envíalas a revisión."
        icon={
          <div className="flex size-8.5 sm:size-9.5 md:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
            <Wrench className="size-4 sm:size-4.5 md:size-5" />
          </div>
        }
        totalCount={totalElements}
        countLabel="solicitudes en este estado"
        showCreate={false}
        queries={[query, resumenQuery]}
        onRefresh={() => {
          query.refetch()
          resumenQuery.refetch()
        }}
        isRefreshing={query.isRefetching || resumenQuery.isRefetching}
      />

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Tarjetas de Resumen por Estado de Ejecución (sin opción 'Todas') */}
        <EncargadoResumenCards
          resumen={resumen}
          isLoading={resumenQuery.isLoading}
          selectedEstado={selectedEstado}
          onSelectEstado={(estado) => setSelectedEstado(estado as EstadoFiltro)}
        />

        {/* Barra de Búsqueda y Filtros */}
        <SolicitudFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedEstado={selectedEstado}
          placeholder="Buscar por folio, título, activo o solicitante..."
        />

        {/* Listado de Solicitudes */}
        {query.isLoading && (
          <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm">Cargando intervenciones técnicas asignadas...</span>
          </div>
        )}

        {query.isError && (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Error al consultar las solicitudes asignadas
            </p>
            <p className="text-xs text-muted-foreground">
              {query.error instanceof Error
                ? query.error.message
                : "Ocurrió un error inesperado al consultar la API"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                query.refetch()
                resumenQuery.refetch()
              }}
              className="text-xs mt-2 cursor-pointer"
            >
              Reintentar
            </Button>
          </div>
        )}

        {!query.isLoading && !query.isError && solicitudes.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center gap-2.5 text-center text-muted-foreground">
            <Inbox className="size-10 opacity-35" />
            <p className="text-sm font-medium text-foreground">
              No hay solicitudes en este estado
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {debouncedSearch.trim()
                ? `No se encontraron resultados para "${debouncedSearch.trim()}".`
                : `No tienes solicitudes de mantenimiento con estado "${selectedEstado.replace(/_/g, " ")}".`}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer pt-1"
              >
                Limpiar búsqueda
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
                onRegistrarControlActivo={(sol) => {
                  setControlActivoItem(sol)
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
        onSuccess={() => {
          closeAction()
          query.refetch()
          resumenQuery.refetch()
        }}
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
      />
    </PageShell>
  )
}
