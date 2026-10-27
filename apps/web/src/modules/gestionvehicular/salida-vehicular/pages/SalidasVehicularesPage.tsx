import { useCallback, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Car,
  Compass,
  Gauge,
  Plus,
  RefreshCw,
  RotateCcw,
  SearchX,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Badge } from "@/shared/components/ui/badge"
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

const DEFAULT_PAGE_SIZE = appConfig.pagination?.defaultPageSize ?? 20

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

function classifyEstado(
  rawEstado?: string | null
): "iniciada" | "transito" | "retorno" | "finalizada" | "cancelada" {
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
  selectedEstadoLabel?: string
  onClearFilters: () => void
  onCreate: () => void
}

function SalidasEmptyState({
  searchQuery,
  selectedEstado,
  selectedEstadoLabel,
  onClearFilters,
  onCreate,
}: Readonly<SalidasEmptyStateProps>) {
  const hasFilters = Boolean(searchQuery.trim() || (selectedEstado && selectedEstado !== "ALL"))

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 my-4 animate-in fade-in-50">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 border border-border/80 shadow-2xs text-muted-foreground/80 mb-3.5">
          <SearchX className="size-7" />
        </div>
        <h3 className="font-heading text-base font-semibold text-foreground mb-1">
          No se encontraron salidas vehiculares coincidentes
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mb-4 leading-relaxed">
          No hay salidas que coincidan con los criterios de búsqueda y filtros seleccionados.
        </p>

        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-4">
          {searchQuery.trim() && (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
              Búsqueda: &ldquo;{searchQuery.trim()}&rdquo;
            </Badge>
          )}
          {selectedEstado && selectedEstado !== "ALL" && (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
              Estado: {selectedEstadoLabel ?? selectedEstado}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-1.5 text-xs font-medium cursor-pointer shadow-2xs hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />
          <span>Restablecer todos los filtros</span>
        </Button>
      </div>
    )
  }

  // Estado cuando no hay ninguna salida registrada en el sistema
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-dashed border-border bg-gradient-to-b from-card/80 to-muted/20 my-4 animate-in fade-in-50">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border border-primary/25 shadow-xs mb-4">
        <Car className="size-8" />
      </div>

      <h3 className="font-heading text-lg font-bold text-foreground mb-1.5">
        Comienza a gestionar tus salidas vehiculares
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mb-6 leading-relaxed">
        Despacha vehículos de la flota, monitorea el trayecto en tiempo real con Flowable BPMN y mantén un registro confiable de bitácoras y novedades.
      </p>

      {/* 3 Pilares informativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-6 text-left">
        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Gauge className="size-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Despacho & Kilometraje</h4>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Control de odómetro inicial y chofer responsable.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Compass className="size-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Seguimiento en Ruta</h4>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Transiciones automáticas por workflow Flowable.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="size-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Bitácoras y Cierre</h4>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Registro de novedades y retorno a base.
            </p>
          </div>
        </div>
      </div>

      <Button
        size="sm"
        onClick={onCreate}
        className="text-xs font-semibold gap-1.5 shadow-sm shadow-primary/20 px-4 h-8.5 cursor-pointer"
      >
        <Plus className="size-4" />
        <span>Registrar Primera Salida</span>
      </Button>
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
  selectedEstadoLabel?: string
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
  selectedEstadoLabel,
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
        selectedEstadoLabel={selectedEstadoLabel}
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
          "flex flex-col gap-2.5 transition-opacity duration-200",
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
          className="border-t border-border/60 pt-2 shrink-0 text-xs rounded-b-xl"
        />
      )}
    </div>
  )
}

export function SalidasVehicularesPage() {
  const navigate = useNavigate()

  const [selectedEstado, setSelectedEstado] = useState<string>("")
  const [sortOption, setSortOption] = useState<string>("createdAt:DESC")
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)

  // Diálogos y acciones operativas
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [actionSalida, setActionSalida] = useState<SalidaVehicular | null>(null)
  const [bitacoraSalida, setBitacoraSalida] = useState<SalidaVehicular | null>(null)
  const [cancelSalida, setCancelSalida] = useState<SalidaVehicular | null>(null)
  const [historySalida, setHistorySalida] = useState<SalidaVehicular | null>(null)

  // Búsqueda paginada reactiva con debounce
  const search = usePaginatedSearch({
    debounceMs: 300,
  })

  // Descomponer ordenamiento (sortBy y direction)
  const [sortBy, direction] = useMemo(() => {
    const [s = "createdAt", d = "DESC"] = sortOption.split(":")
    return [s, d as "ASC" | "DESC"]
  }, [sortOption])

  // Parámetros de consulta
  const queryParams = useMemo(() => {
    const params: SalidaVehicularFiltros = {
      page: search.page,
      size: pageSize,
      sortBy,
      direction,
    }
    if (search.query) {
      params.search = search.query
    }
    if (selectedEstado && selectedEstado !== "ALL") {
      params.estado = selectedEstado
    }
    return params
  }, [search.page, pageSize, sortBy, direction, search.query, selectedEstado])

  const salidasQuery = useQuery(salidaVehicularQueries.list(queryParams))

  // Consulta de Reporte General para métricas globales acumuladas
  const reporteGeneralQuery = useQuery({
    ...salidaVehicularQueries.reporteGeneral(),
    staleTime: 1000 * 60 * 3,
  })

  const salidas = useMemo(
    () => salidasQuery.data?.content ?? [],
    [salidasQuery.data?.content]
  )
  const totalElements = salidasQuery.data?.totalElements ?? 0

  // Resumen reactivo para KPI cards y barra porcentual
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

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortOption(newSort)
      search.setPage(0)
    },
    [search]
  )

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize)
      search.setPage(0)
    },
    [search]
  )

  const handleClearAllFilters = useCallback(() => {
    search.setSearch("")
    search.setPage(0)
    setSelectedEstado("")
    setSortOption("createdAt:DESC")
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
      className="w-full max-w-none px-2.5 py-2.5 sm:px-4 sm:py-3 md:px-5 lg:px-6 space-y-3.5"
    >
      {/* 1. Encabezado principal con acceso a nueva salida y reportes */}
      <SalidaVehicularHeader
        queries={[salidasQuery, reporteGeneralQuery]}
        totalCount={resumen.total}
        onRefresh={handleRefresh}
        isRefreshing={salidasQuery.isRefetching || reporteGeneralQuery.isRefetching}
        onCreate={() => setIsCreateOpen(true)}
        extraActions={
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              navigate({
                to: "/gestion-vehicular/reportes/salidas-vehiculares",
              })
            }
            className="h-7.5 px-2.5 text-xs font-medium cursor-pointer shadow-2xs gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
            title="Ver reportes y métricas analíticas"
          >
            <BarChart3 className="size-3.5 text-primary" />
            <span className="hidden sm:inline-block">Reportes</span>
          </Button>
        }
      />

      {/* 2. Tarjetas KPI de Resumen interactivo con barra porcentual de distribución */}
      <SalidaVehicularResumenCards
        resumen={resumen}
        isLoading={reporteGeneralQuery.isLoading && !reporteGeneralQuery.data}
        selectedEstado={selectedEstado}
        onSelectEstado={handleSelectEstado}
      />

      {/* 3. Panel de Búsqueda, Filtrado Avanzado, Ordenamiento y Listado */}
      <div className="relative flex flex-col space-y-3 rounded-2xl border border-border/70 bg-card/40 p-3 sm:p-4 shadow-2xs backdrop-blur-xs">
        {/* Barra indicadora sutil de sincronización en segundo plano */}
        {isBackgroundSyncing && (
          <div className="absolute -top-1 left-3 right-3 z-10 h-0.5 overflow-hidden bg-primary/10 rounded-full">
            <div className="h-full w-1/3 animate-[shimmer_1.5s_infinite] bg-primary rounded-full" />
          </div>
        )}

        <SalidaVehicularFilterToolbar
          searchQuery={search.search}
          onSearchChange={search.setSearch}
          selectedEstado={selectedEstado}
          selectedEstadoLabel={selectedEstadoLabel}
          onClearEstado={() => setSelectedEstado("")}
          onSelectEstado={handleSelectEstado}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalResults={resumen.total}
          filteredCount={salidasQuery.data?.totalElements}
          onClearAll={handleClearAllFilters}
        />

        <SalidasVehicularesContent
          isLoading={salidasQuery.isLoading}
          isError={salidasQuery.isError}
          error={salidasQuery.error}
          salidas={salidas}
          pageData={salidasQuery.data}
          isFetching={salidasQuery.isFetching}
          searchQuery={search.debouncedSearch}
          selectedEstado={selectedEstado}
          selectedEstadoLabel={selectedEstadoLabel}
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

      {/* 4. Diálogos Operativos y de Workflow */}
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
