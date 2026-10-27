import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Car, Plus, RefreshCw } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { WorkflowHistoryDialog } from "@/modules/workflow"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { CancelarSalidaDialog } from "../components/CancelarSalidaDialog"
import { EjecutarAccionFlowableDialog } from "../components/EjecutarAccionFlowableDialog"
import { RegistrarBitacoraDialog } from "../components/RegistrarBitacoraDialog"
import { RegistrarSalidaDialog } from "../components/RegistrarSalidaDialog"
import { SalidaVehicularFilterToolbar } from "../components/SalidaVehicularFilterToolbar"
import { SalidaVehicularHeader } from "../components/SalidaVehicularHeader"
import {
  SalidaVehicularListItem,
  SalidaVehicularListItemSkeleton,
} from "../components/SalidaVehicularListItem"
import {
  SalidaVehicularResumenCards,
  type SalidaVehicularResumen,
} from "../components/SalidaVehicularResumenCards"
import { SalidaVehicularTable } from "../components/SalidaVehicularTable"

const PAGE_SIZE = appConfig.pagination?.defaultPageSize ?? 20

export function SalidasVehicularesPage() {
  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")

  // Diálogos y acciones
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionSalida, setActionSalida] = useState<SalidaVehicular | null>(null)
  const [bitacoraSalida, setBitacoraSalida] = useState<SalidaVehicular | null>(null)
  const [cancelSalida, setCancelSalida] = useState<SalidaVehicular | null>(null)
  const [historySalida, setHistorySalida] = useState<SalidaVehicular | null>(null)

  // Búsqueda paginada reactiva
  const search = usePaginatedSearch({
    debounceMs: 300,
  })

  // Consulta de Salidas Vehiculares
  const queryParams = useMemo(
    () => ({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC" as const,
      ...(search.query ? { search: search.query } : {}),
      ...(selectedEstado && selectedEstado !== "ALL" ? { estado: selectedEstado } : {}),
    }),
    [search.page, search.query, selectedEstado]
  )

  const salidasQuery = useQuery(salidaVehicularQueries.list(queryParams))

  // Consulta de Reporte General para métricas globales
  const reporteGeneralQuery = useQuery({
    ...salidaVehicularQueries.reporteGeneral(),
    staleTime: 1000 * 60 * 3,
  })

  const salidas = useMemo(
    () => salidasQuery.data?.content ?? [],
    [salidasQuery.data?.content]
  )
  const totalElements = salidasQuery.data?.totalElements ?? 0

  // Resumen calculado para tarjetas KPI interactivas
  const resumen: SalidaVehicularResumen = useMemo(() => {
    const total = reporteGeneralQuery.data?.totalSalidas ?? totalElements
    let iniciadas = 0
    let enTransito = 0
    let retorno = 0
    let finalizadas = reporteGeneralQuery.data?.salidasFinalizadas ?? 0
    let canceladas = reporteGeneralQuery.data?.salidasCanceladas ?? 0

    const sourceList = reporteGeneralQuery.data?.items ?? salidas

    for (const item of sourceList) {
      const est = (item.estado || "").toUpperCase().trim()
      if (est.includes("INICIAD") || est.includes("BORRADOR") || est.includes("CREAD")) {
        iniciadas++
      } else if (est.includes("TRANSIT") || est.includes("CURSO") || est.includes("DESTINO")) {
        enTransito++
      } else if (est.includes("RETORN")) {
        retorno++
      } else if (est.includes("FINALIZ") || est.includes("COMPLET")) {
        if (!reporteGeneralQuery.data) finalizadas++
      } else if (est.includes("CANCEL") || est.includes("ANULAD")) {
        if (!reporteGeneralQuery.data) canceladas++
      } else {
        enTransito++
      }
    }

    if (reporteGeneralQuery.data && iniciadas === 0 && retorno === 0) {
      enTransito = reporteGeneralQuery.data.salidasActivas
    }

    return {
      total,
      iniciadas,
      enTransito,
      retorno,
      finalizadas,
      canceladas,
    }
  }, [reporteGeneralQuery.data, totalElements, salidas])

  useClampPage(search.page, search.setPage, salidasQuery.data?.totalPages)

  const handleSelectEstado = useCallback(
    (estado: string) => {
      setSelectedEstado((prev) => (!estado || prev === estado ? "" : estado))
      search.setPage(0)
    },
    [search]
  )

  const handleClearAllFilters = useCallback(() => {
    search.setSearch("")
    search.setPage(0)
    setSelectedEstado("")
  }, [search])

  const selectedEstadoLabel = useMemo(() => {
    if (!selectedEstado || selectedEstado === "ALL") return undefined
    const map: Record<string, string> = {
      INICIADO: "Iniciadas",
      EN_TRANSITO: "En Tránsito",
      RETORNO: "En Retorno",
      FINALIZADO: "Finalizadas",
      CANCELADO: "Canceladas",
    }
    return map[selectedEstado] ?? selectedEstado.replace(/_/g, " ")
  }, [selectedEstado])

  const handleRefresh = useCallback(() => {
    void salidasQuery.refetch()
    void reporteGeneralQuery.refetch()
  }, [salidasQuery, reporteGeneralQuery])

  return (
    <PageShell
      layout="scroll"
      className="w-full max-w-none px-2.5 py-2 sm:px-4 sm:py-2.5 md:px-5 lg:px-6 space-y-3"
    >
      {/* 1. Encabezado principal */}
      <SalidaVehicularHeader
        queries={[salidasQuery, reporteGeneralQuery]}
        totalCount={resumen.total}
        onRefresh={handleRefresh}
        isRefreshing={salidasQuery.isRefetching || reporteGeneralQuery.isRefetching}
        onCreate={() => setIsCreateOpen(true)}
      />

      {/* 2. Tarjetas KPI de Resumen interactivo con barra porcentual y elevación */}
      <SalidaVehicularResumenCards
        resumen={resumen}
        isLoading={reporteGeneralQuery.isLoading && !reporteGeneralQuery.data}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* 3. Barra de Búsqueda, Filtros y Selector de Vista */}
      <SalidaVehicularFilterToolbar
        searchQuery={search.search}
        onSearchChange={search.setSearch}
        selectedEstado={selectedEstado}
        selectedEstadoLabel={selectedEstadoLabel}
        onClearEstado={() => setSelectedEstado("")}
        onSelectEstado={handleSelectEstado}
        totalResults={resumen.total}
        filteredCount={salidasQuery.data?.totalElements}
        onClearAll={handleClearAllFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Listado y Estados UX */}
      <div className="relative flex flex-col space-y-2.5">
        {/* Barra indicadora de sincronización en segundo plano */}
        {salidasQuery.isFetching && !salidasQuery.isLoading && (
          <div className="absolute -top-1 left-0 right-0 z-10 h-0.5 overflow-hidden bg-primary/10 rounded-full">
            <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
          </div>
        )}

        {salidasQuery.isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SalidaVehicularListItemSkeleton key={index} />
            ))}
          </div>
        ) : salidasQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<AlertCircle className="size-8 text-destructive" />}
              title="Error al cargar las salidas vehiculares"
              description={getErrorMessage(salidasQuery.error)}
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
        ) : salidas.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<Car className="size-8 text-muted-foreground/60" />}
              title={
                search.debouncedSearch
                  ? "No se encontraron salidas vehiculares coincidentes"
                  : selectedEstado
                    ? "No hay salidas vehiculares con los filtros seleccionados"
                    : "No hay salidas vehiculares registradas"
              }
              description={
                search.debouncedSearch
                  ? `No se hallaron resultados para "${search.debouncedSearch}". Prueba con otro término o limpia la búsqueda.`
                  : selectedEstado
                    ? "Puedes seleccionar otros estados o restablecer los filtros."
                    : "Registra una salida vehicular para comenzar el seguimiento de viajes y bitácoras."
              }
              action={
                search.debouncedSearch || selectedEstado ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="mt-2 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    Limpiar todos los filtros
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-2 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Registrar Primera Salida</span>
                  </Button>
                )
              }
            />
          </div>
        ) : viewMode === "cards" ? (
          <div className="space-y-3">
            <div
              className={cn(
                "flex flex-col gap-3 transition-opacity duration-200",
                salidasQuery.isFetching && !salidasQuery.isLoading && "opacity-75"
              )}
            >
              {salidas.map((salida) => (
                <SalidaVehicularListItem
                  key={salida.id}
                  salida={salida}
                  onExecuteAction={setActionSalida}
                  onAddBitacora={setBitacoraSalida}
                  onCancel={setCancelSalida}
                  onTraceability={setHistorySalida}
                />
              ))}
            </div>

            {/* Paginación */}
            {salidasQuery.data && salidasQuery.data.totalPages > 1 && (
              <Pagination
                page={salidasQuery.data}
                onPageChange={search.setPage}
                className="border-t pt-2 shrink-0 text-xs"
              />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <SalidaVehicularTable
              items={salidas}
              isLoading={salidasQuery.isLoading}
              onExecuteAction={setActionSalida}
              onAddBitacora={setBitacoraSalida}
              onCancel={setCancelSalida}
            />

            {/* Paginación en tabla */}
            {salidasQuery.data && salidasQuery.data.totalPages > 1 && (
              <Pagination
                page={salidasQuery.data}
                onPageChange={search.setPage}
                className="border-t pt-2 shrink-0 text-xs"
              />
            )}
          </div>
        )}
      </div>

      {/* 5. Diálogos Operativos y de Workflow */}
      <RegistrarSalidaDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EjecutarAccionFlowableDialog
        open={Boolean(actionSalida)}
        onOpenChange={(open) => !open && setActionSalida(null)}
        salida={actionSalida}
      />

      <RegistrarBitacoraDialog
        open={Boolean(bitacoraSalida)}
        onOpenChange={(open) => !open && setBitacoraSalida(null)}
        salidaId={bitacoraSalida?.id ?? ""}
        salidaNumero={bitacoraSalida?.numero}
      />

      <CancelarSalidaDialog
        open={Boolean(cancelSalida)}
        onOpenChange={(open) => !open && setCancelSalida(null)}
        salida={cancelSalida}
      />

      {/* Diálogo de trazabilidad BPMN Flowable */}
      <WorkflowHistoryDialog
        open={Boolean(historySalida)}
        onOpenChange={(open) => !open && setHistorySalida(null)}
        processInstanceId={historySalida?.processInstanceId}
        entityCode={historySalida?.numero}
        title="Trazabilidad Flowable BPMN de Salida Vehicular"
      />
    </PageShell>
  )
}
