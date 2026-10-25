import { useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  CalendarClock,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  Gauge,
  Hourglass,
  LayoutGrid,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useProgramaciones } from "../api/programacion-mantenimiento.queries"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"
import { ProgramacionMantenimientoListView } from "../components/ProgramacionMantenimientoListView"
import { ProgramacionSeguimientoReportView } from "../components/ProgramacionSeguimientoReportView"
import { ProgramacionMantenimientoFormDialog } from "../components/ProgramacionMantenimientoFormDialog"
import { EvaluarTodasDialog } from "../components/EvaluarTodasDialog"
import { EvaluarProgramacionDialog } from "../components/EvaluarProgramacionDialog"

export function ProgramacionesMantenimientoPage() {
  const navigate = useNavigate()
  const [vistaActiva, setVistaActiva] = useState<"tarjetas" | "reporte">("tarjetas")
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos")
  const [showExplain, setShowExplain] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [evaluarTodasOpen, setEvaluarTodasOpen] = useState(false)
  const [editingProgramacion, setEditingProgramacion] = useState<ProgramacionMantenimiento | null>(null)
  const [programacionAEvaluar, setProgramacionAEvaluar] = useState<ProgramacionMantenimiento | null>(null)
  const [evaluarIndividualOpen, setEvaluarIndividualOpen] = useState(false)

  const { data: pageData, isLoading, refetch, isRefetching } = useProgramaciones({
    activo: filtroEstado === "todos" ? undefined : filtroEstado === "activos",
    q: searchTerm.trim() || undefined,
    pageSize: 100,
  })

  const programaciones: ProgramacionMantenimiento[] = useMemo(() => {
    if (Array.isArray(pageData)) return pageData as ProgramacionMantenimiento[]
    if (pageData && Array.isArray((pageData as any).content)) {
      return (pageData as any).content as ProgramacionMantenimiento[]
    }
    return []
  }, [pageData])

  // Métricas
  const total = programaciones.length
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
                Motor de monitoreo preventivo y disparo automatizado por odómetro, horómetro y calendario
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/mantenimientos/planes-mantenimiento" })}
            className="h-9 gap-1.5 text-xs rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300 cursor-pointer font-medium"
          >
            <ClipboardList className="size-3.5 text-blue-500" />
            <span>Ver Planes Base</span>
          </Button>

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
            <span>Evaluar Parque Preventivo</span>
          </Button>

          <Button
            size="sm"
            onClick={handleCreate}
            className="h-9 gap-1.5 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Nueva Programación</span>
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
            <span>Tarjetas de Telemetría</span>
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
            <span>Reporte de Seguimiento y Auditoría</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {vistaActiva === "tarjetas"
            ? "Monitoreo gráfico por activo con barras de progreso y umbrales en tiempo real"
            : "Matriz ejecutiva con estado de alertas preventivas, exportación Excel e impresión oficial"}
        </p>
      </div>

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
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                El sistema monitorea activamente la telemetría de cada activo: <strong>odómetro de retorno</strong> de viajes vehiculares, <strong>horómetro</strong> de operación y <strong>calendario</strong>.
                Cuando un activo alcanza o supera su umbral objetivo, la evaluación genera automáticamente una <strong>Solicitud de Mantenimiento Preventivo</strong> con las actividades técnicas de su plan. Al registrar la culminación en <em>"Completar"</em>, el nuevo umbral se recalcula automáticamente sumando el intervalo de uso.
              </p>
            )}
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Total Programaciones</span>
                <Sparkles className="size-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{total}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">{vigentes} vigentes actualmente</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Tiempo (Días)</span>
                <Clock className="size-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{conTiempo}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Control de fechas límites</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Odómetro (Km)</span>
                <Gauge className="size-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{conKm}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Vehículos y flotas</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="text-[11.5px] font-medium">Por Horómetro (Hrs)</span>
                <Hourglass className="size-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{conHoras}</div>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Maquinaria pesada y equipos</p>
            </div>
          </div>

          {/* Vista de Lista con Tarjetas */}
          <ProgramacionMantenimientoListView
            programaciones={programaciones}
            isLoading={isLoading}
            onEdit={handleEdit}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filtroEstado={filtroEstado}
            onFiltroEstadoChange={setFiltroEstado}
          />
        </>
      ) : (
        /* Vista de Reporte de Seguimiento y Auditoría */
        <ProgramacionSeguimientoReportView
          programaciones={programaciones}
          isLoading={isLoading}
          onEdit={handleEdit}
          onEvaluarIndividual={handleEvaluarIndividual}
        />
      )}

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
