import { useState, useMemo } from "react"
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  FileSpreadsheet,
  Gauge,
  Hourglass,
  LayoutGrid,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { getErrorMessage } from "@/shared/api"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useClampPage, usePaginatedSearch } from "@/shared/hooks/use-paginated-search"
import { useProgramaciones } from "../api/programacion-mantenimiento.queries"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"
import { ProgramacionMantenimientoListView } from "../components/ProgramacionMantenimientoListView"
import { ProgramacionSeguimientoReportView } from "../components/ProgramacionSeguimientoReportView"
import { ProgramacionMantenimientoFormDialog } from "../components/ProgramacionMantenimientoFormDialog"
import { EvaluarTodasDialog } from "../components/EvaluarTodasDialog"
import { EvaluarProgramacionDialog } from "../components/EvaluarProgramacionDialog"

const PAGE_SIZE = 20

export function ProgramacionesMantenimientoPage() {
  const [vistaActiva, setVistaActiva] = useState<"tarjetas" | "reporte">("tarjetas")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos")
  const search = usePaginatedSearch({
    debounceMs: 300,
    resetKey: `${vistaActiva}|${filtroEstado}`,
  })
  const [showExplain, setShowExplain] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [evaluarTodasOpen, setEvaluarTodasOpen] = useState(false)
  const [editingProgramacion, setEditingProgramacion] = useState<ProgramacionMantenimiento | null>(null)
  const [programacionAEvaluar, setProgramacionAEvaluar] = useState<ProgramacionMantenimiento | null>(null)
  const [evaluarIndividualOpen, setEvaluarIndividualOpen] = useState(false)

  const { data: pageData, isLoading, isError, error, refetch, isFetching, isRefetching } = useProgramaciones({
    activo: filtroEstado === "todos" ? undefined : filtroEstado === "activos",
    q: search.debouncedSearch.trim() || undefined,
    page: search.page,
    size: PAGE_SIZE,
    sortBy: "id",
    direction: "ASC",
  })

  useClampPage(search.page, search.setPage, pageData?.totalPages)

  const programaciones: ProgramacionMantenimiento[] = useMemo(() => {
    if (Array.isArray(pageData)) return pageData
    if (pageData && "content" in pageData && Array.isArray(pageData.content)) {
      return pageData.content
    }
    return []
  }, [pageData])

  const errorMessage = isError ? getErrorMessage(error) : undefined
  const valorKpi = (valor: string | number) => {
    if (isLoading) return <Skeleton className="h-8 w-12" />
    return isError ? "—" : valor
  }

  // Métricas: el total viene del agregado del servidor, no de la página parcial.
  const totalElements = pageData?.totalElements ?? 0
  const total = totalElements
  const vigentes = useMemo(() => programaciones.filter((p) => p.activo).length, [programaciones])
  const conTiempo = useMemo(
    () => programaciones.filter((p) => (p.criterios ?? []).some((c) => c.tipoCriterio === "TIEMPO" && c.activo)).length,
    [programaciones],
  )
  const conKm = useMemo(
    () => programaciones.filter((p) => (p.criterios ?? []).some((c) => c.tipoCriterio === "KILOMETRAJE" && c.activo)).length,
    [programaciones],
  )
  const conHoras = useMemo(
    () => programaciones.filter((p) => (p.criterios ?? []).some((c) => c.tipoCriterio === "HORAS_USO" && c.activo)).length,
    [programaciones],
  )

  function handleCreate() {
    setEditingProgramacion(null)
    setFormDialogOpen(true)
  }

  function handleEdit(prog: ProgramacionMantenimiento) {
    setEditingProgramacion(prog)
    setFormDialogOpen(true)
  }

  function handleEvaluarIndividual(prog: ProgramacionMantenimiento) {
    setProgramacionAEvaluar(prog)
    setEvaluarIndividualOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Programaciones de Mantenimiento
              </h1>
              <p className="text-xs text-muted-foreground">
                Controla cuándo le toca mantenimiento a cada equipo según fecha, kilometraje u horas de uso.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEvaluarTodasOpen(true)}
            className="h-9 gap-1.5 text-xs rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 hover:text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20 cursor-pointer shadow-xs transition-colors font-medium"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Revisar Vencimientos</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCreate}
            className="h-9 gap-1.5 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Programar Activo</span>
          </Button>
        </div>
      </div>

      {/* Selector de Modo de Visualización: Tarjetas vs Reporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3 print:hidden">
        <div className="flex items-center p-1 bg-muted/60 border border-border/70 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setVistaActiva("tarjetas")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              vistaActiva === "tarjetas"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5 text-amber-500" />
            <span>Vista por Equipo</span>
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva("reporte")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              vistaActiva === "reporte"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-500" />
            <span>Tabla y Exportar Excel</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {vistaActiva === "tarjetas"
            ? "Ver cada activo con su avance actual y botón para completar o revisar"
            : "Ver listado resumido por alerta (Crítico / Próximo / Al día) y descargar Excel"}
        </p>
      </div>

      {/* Alerta si falla la consulta */}
      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Ocurrió un error al cargar las programaciones de mantenimiento:{" "}
              {errorMessage}. Los indicadores no están disponibles.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 text-xs cursor-pointer border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Contenido según la vista seleccionada */}
      {vistaActiva === "tarjetas" ? (
        <>
          {/* Banner Explicativo: Funcionamiento del Motor Preventivo */}
          <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-amber-500/5 via-primary/5 to-emerald-500/5 p-4 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="size-4 text-amber-500" />
                <span>Motor Preventivo: ¿Cómo se disparan las Solicitudes Automáticas?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExplain((prev) => !prev)}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer font-medium"
              >
                {showExplain ? "Ocultar explicación" : "¿Cómo funciona?"}
              </button>
            </div>

            {showExplain && (
              <div className="grid grid-cols-1 gap-2 pt-1 md:grid-cols-3 text-[11.5px] text-muted-foreground">
                <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                  <strong className="text-foreground">1. Programa un Activo:</strong>{" "}
                  Usa <em>Programar Activo</em> para asignar un plan y frecuencia a un equipo o a todo un tipo de activo.
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                  <strong className="text-foreground">2. Controla el vencimiento:</strong>{" "}
                  Cada tarjeta muestra cuánto falta por <strong>fecha</strong>, <strong>km</strong> u <strong>horas</strong>.
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                  <strong className="text-foreground">3. Completa el servicio:</strong>{" "}
                  Al marcar <em>Completar</em>, el sistema guarda el histórico y calcula automáticamente la siguiente fecha o lectura.
                </div>
              </div>
            )}
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Total Programaciones</span>
                <Sparkles className="size-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{valorKpi(total)}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">
                {valorKpi(vigentes)} vigentes en esta página
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Tiempo (Días)</span>
                <Clock className="size-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{valorKpi(conTiempo)}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Control de fechas límites</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Odómetro (Km)</span>
                <Gauge className="size-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{valorKpi(conKm)}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Vehículos y flotas</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Horómetro (Hrs)</span>
                <Hourglass className="size-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{valorKpi(conHoras)}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Maquinaria pesada y equipos</p>
            </div>
          </div>

          {/* Vista de Lista con Tarjetas */}
          <ProgramacionMantenimientoListView
            programaciones={programaciones}
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            errorMessage={errorMessage}
            onRetry={refetch}
            onEdit={handleEdit}
            searchTerm={search.search}
            onSearchChange={search.setSearch}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
          />
        </>
      ) : (
        /* Vista de Reporte de Seguimiento y Auditoría */
        <ProgramacionSeguimientoReportView
          programaciones={programaciones}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          errorMessage={errorMessage}
          onRetry={refetch}
          onEdit={handleEdit}
          onEvaluarIndividual={handleEvaluarIndividual}
        />
      )}

      {/* Paginación real del servidor: page/size/sortBy/direction viajan en la query y en la query key */}
      <Pagination
        page={{
          page: pageData?.page ?? search.page,
          size: pageData?.size ?? PAGE_SIZE,
          totalElements,
          totalPages: pageData?.totalPages ?? 0,
          first: pageData?.first ?? true,
          last: pageData?.last ?? true,
        }}
        onPageChange={search.setPage}
      />

      {/* Diálogo de Creación / Edición */}
      <ProgramacionMantenimientoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        programacionToEdit={editingProgramacion}
      />

      {/* Diálogo de Evaluación en Lote */}
      <EvaluarTodasDialog
        open={evaluarTodasOpen}
        onOpenChange={setEvaluarTodasOpen}
      />

      {/* Diálogo de Evaluación Individual */}
      <EvaluarProgramacionDialog
        open={evaluarIndividualOpen}
        onOpenChange={setEvaluarIndividualOpen}
        programacion={programacionAEvaluar}
      />
    </div>
  )
}
