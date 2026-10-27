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
import type { PageResponse } from "@/shared/types/api.types"

import { salidaVehicularQueries } from "../api/salida-vehicular.queries"
import type {
  ReporteSalidasGeneral,
  SalidaVehicular,
  SalidaVehicularFiltros,
} from "../api/salida-vehicular.types"
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

const PAGE_SIZE = appConfig.pagination?.defaultPageSize ?? 20

const ESTADO_LABELS: Record<string, string> = {
  INICIADO: "Iniciadas",
  EN_TRANSITO: "En Tránsito",
  RETORNO: "En Retorno",
  FINALIZADO: "Finalizadas",
  CANCELADO: "Canceladas",
}

const ESTADO_PATTERNS = {
  iniciada: ["INICIAD", "BORRADOR", "CREAD"],
  transito: ["TRANSIT", "CURSO", "DESTINO"],
  retorno: ["RETORN"],
  finalizada: ["FINALIZ", "COMPLET"],
  cancelada: ["CANCEL", "ANULAD"],
} as const

function matchesPattern(value: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => value.includes(p))
}

function classifyEstado(rawEstado?: string | null): "iniciada" | "transito" | "retorno" | "finalizada" | "cancelada" {
  const est = (rawEstado || "").toUpperCase().trim()
  if (matchesPattern(est, ESTADO_PATTERNS.iniciada)) return "iniciada"
  if (matchesPattern(est, ESTADO_PATTERNS.transito)) return "transito"
  if (matchesPattern(est, ESTADO_PATTERNS.retorno)) return "retorno"
  if (matchesPattern(est, ESTADO_PATTERNS.finalizada)) return "finalizada"
  if (matchesPattern(est, ESTADO_PATTERNS.cancelada)) return "cancelada"
  return "transito"
}

interface ResumenCounts {
  iniciadas: number
  enTransito: number
  retorno: number
  finalizadas: number
  canceladas: number
}

function accumulateEstado(
  counts: ResumenCounts,
  category: ReturnType<typeof classifyEstado>,
  hasReporte: boolean
) {
  switch (category) {
    case "iniciada":
      counts.iniciadas++
      break
    case "retorno":
      counts.retorno++
      break
    case "finalizada":
      if (!hasReporte) counts.finalizadas++
      break
    case "cancelada":
      if (!hasReporte) counts.canceladas++
      break
    default:
      counts.enTransito++
      break
  }
}

function calculateResumen(
  reporte: ReporteSalidasGeneral | undefined,
  totalElements: number,
  salidas: SalidaVehicular[]
): SalidaVehicularResumen {
  const counts: ResumenCounts = {
    iniciadas: 0,
    enTransito: 0,
    retorno: 0,
    finalizadas: reporte?.salidasFinalizadas ?? 0,
    canceladas: reporte?.salidasCanceladas ?? 0,
  }

  const sourceList = reporte?.items ?? salidas
  const hasReporte = Boolean(reporte)

  for (const item of sourceList) {
    accumulateEstado(counts, classifyEstado(item.estado), hasReporte)
  }

  const hasNoMovement = counts.iniciadas === 0 && counts.retorno === 0
  if (reporte && hasNoMovement) {
    counts.enTransito = reporte.salidasActivas
  }

  return {
    total: reporte?.totalSalidas ?? totalElements,
    ...counts,
  }
}

function getSelectedEstadoLabel(selectedEstado: string): string | undefined {
  if (!selectedEstado || selectedEstado === "ALL") return undefined
  return ESTADO_LABELS[selectedEstado] ?? selectedEstado.replace(/_/g, " ")
}

interface SalidasEmptyStateProps {
  searchQuery: string
  selectedEstado: string
  onClearFilters: () => void
  onCreate: () => void
}

function getEmptyStateInfo(searchQuery: string, selectedEstado: string) {
  if (searchQuery) {
    return {
      title: "No se encontraron salidas vehiculares coincidentes",
      description: `No se hallaron resultados para "${searchQuery}". Prueba con otro término o limpia la búsqueda.`,
    }
  }
  if (selectedEstado) {
    return {
      title: "No hay salidas vehiculares con los filtros seleccionados",
      description: "Puedes seleccionar otros estados o restablecer los filtros.",
    }
  }
  return {
    title: "No hay salidas vehiculares registradas",
    description: "Registra una salida vehicular para comenzar el seguimiento de viajes y bitácoras.",
  }
}

function SalidasEmptyState({
  searchQuery,
  selectedEstado,
  onClearFilters,
  onCreate,
}: Readonly<SalidasEmptyStateProps>) {
  const hasFilters = Boolean(searchQuery || selectedEstado)
  const { title, description } = getEmptyStateInfo(searchQuery, selectedEstado)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<Car className="size-8 text-muted-foreground/60" />}
        title={title}
        description={description}
        action={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="mt-2 text-xs font-medium cursor-pointer shadow-2xs"
            >
              Limpiar todos los filtros
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onCreate}
              className="mt-2 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Registrar Primera Salida</span>
            </Button>
          )
        }
      />
    </div>
  )
}

interface SalidasVehicularesContentProps {
  isLoading: boolean
  isError: boolean
  error: unknown
  salidas: SalidaVehicular[]
  pageData?: PageResponse<SalidaVehicular>
  isFetching: boolean
  searchQuery: string
  selectedEstado: string
  onRefresh: () => void
  onClearFilters: () => void
  onCreate: () => void
  onPageChange: (page: number) => void
  onExecuteAction: (salida: SalidaVehicular) => void
  onAddBitacora: (salida: SalidaVehicular) => void
  onCancel: (salida: SalidaVehicular) => void
  onTraceability: (salida: SalidaVehicular) => void
}

function SalidasVehicularesContent({
  isLoading,
  isError,
  error,
  salidas,
  pageData,
  isFetching,
  searchQuery,
  selectedEstado,
  onRefresh,
  onClearFilters,
  onCreate,
  onPageChange,
  onExecuteAction,
  onAddBitacora,
  onCancel,
  onTraceability,
}: Readonly<SalidasVehicularesContentProps>) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SalidaVehicularListItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={<AlertCircle className="size-8 text-destructive" />}
          title="Error al cargar las salidas vehiculares"
          description={getErrorMessage(error)}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
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

  if (salidas.length === 0) {
    return (
      <SalidasEmptyState
        searchQuery={searchQuery}
        selectedEstado={selectedEstado}
        onClearFilters={onClearFilters}
        onCreate={onCreate}
      />
    )
  }

  const showPagination = Boolean(pageData && pageData.totalPages > 1)

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col gap-3 transition-opacity duration-200",
          isFetching && !isLoading && "opacity-75"
        )}
      >
        {salidas.map((salida) => (
          <SalidaVehicularListItem
            key={salida.id}
            salida={salida}
            onExecuteAction={onExecuteAction}
            onAddBitacora={onAddBitacora}
            onCancel={onCancel}
            onTraceability={onTraceability}
          />
        ))}
      </div>

      {showPagination && pageData && (
        <Pagination
          page={pageData}
          onPageChange={onPageChange}
          className="border-t pt-2 shrink-0 text-xs"
        />
      )}
    </div>
  )
}

export function SalidasVehicularesPage() {
  const [selectedEstado, setSelectedEstado] = useState<string>("")

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
  const queryParams = useMemo(() => {
    const params: SalidaVehicularFiltros = {
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
    }
    if (search.query) {
      params.search = search.query
    }
    if (selectedEstado && selectedEstado !== "ALL") {
      params.estado = selectedEstado
    }
    return params
  }, [search.page, search.query, selectedEstado])

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
  const resumen = useMemo(
    () => calculateResumen(reporteGeneralQuery.data, totalElements, salidas),
    [reporteGeneralQuery.data, totalElements, salidas]
  )

  useClampPage(search.page, search.setPage, salidasQuery.data?.totalPages)

  const handleSelectEstado = useCallback(
    (estado: string) => {
      setSelectedEstado((prev) => (prev === estado || !estado ? "" : estado))
      search.setPage(0)
    },
    [search]
  )

  const handleClearAllFilters = useCallback(() => {
    search.setSearch("")
    search.setPage(0)
    setSelectedEstado("")
  }, [search])

  const selectedEstadoLabel = useMemo(
    () => getSelectedEstadoLabel(selectedEstado),
    [selectedEstado]
  )

  const handleRefresh = useCallback(() => {
    void salidasQuery.refetch()
    void reporteGeneralQuery.refetch()
  }, [salidasQuery, reporteGeneralQuery])

  const isBackgroundSyncing = salidasQuery.isFetching && !salidasQuery.isLoading

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

      {/* 3. Barra de Búsqueda y Filtros */}
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
      />

      {/* 4. Listado y Estados UX */}
      <div className="relative flex flex-col space-y-2.5">
        {/* Barra indicadora de sincronización en segundo plano */}
        {isBackgroundSyncing && (
          <div className="absolute -top-1 left-0 right-0 z-10 h-0.5 overflow-hidden bg-primary/10 rounded-full">
            <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
          </div>
        )}

        <SalidasVehicularesContent
          isLoading={salidasQuery.isLoading}
          isError={salidasQuery.isError}
          error={salidasQuery.error}
          salidas={salidas}
          pageData={salidasQuery.data}
          isFetching={salidasQuery.isFetching}
          searchQuery={search.debouncedSearch}
          selectedEstado={selectedEstado}
          onRefresh={handleRefresh}
          onClearFilters={handleClearAllFilters}
          onCreate={() => setIsCreateOpen(true)}
          onPageChange={search.setPage}
          onExecuteAction={setActionSalida}
          onAddBitacora={setBitacoraSalida}
          onCancel={setCancelSalida}
          onTraceability={setHistorySalida}
        />
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

