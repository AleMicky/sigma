import { useState, useMemo } from "react"
import {
  CalendarClock,
  Clock,
  Gauge,
  Hourglass,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useProgramaciones } from "../api/programacion-mantenimiento.queries"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"
import { ProgramacionMantenimientoListView } from "../components/ProgramacionMantenimientoListView"
import { ProgramacionMantenimientoFormDialog } from "../components/ProgramacionMantenimientoFormDialog"

export function ProgramacionesMantenimientoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("todos")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingProgramacion, setEditingProgramacion] = useState<ProgramacionMantenimiento | null>(null)

  const { data: pageData, isLoading, refetch, isRefetching } = useProgramaciones({
    activo: filtroEstado === "todos" ? undefined : filtroEstado === "activos",
    q: searchTerm.trim() || undefined,
    pageSize: 100,
  })

  const programaciones = pageData?.content ?? []

  // Métricas
  const total = programaciones.length
  const vigentes = useMemo(() => programaciones.filter((p) => p.activo).length, [programaciones])
  const conTiempo = useMemo(
    () => programaciones.filter((p) => p.criterios.some((c) => c.tipoCriterio === "TIEMPO" && c.activo)).length,
    [programaciones],
  )
  const conKm = useMemo(
    () => programaciones.filter((p) => p.criterios.some((c) => c.tipoCriterio === "KILOMETRAJE" && c.activo)).length,
    [programaciones],
  )
  const conHoras = useMemo(
    () => programaciones.filter((p) => p.criterios.some((c) => c.tipoCriterio === "HORAS_USO" && c.activo)).length,
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

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                Gestión automatizada de planes preventivos basados en tiempo, odómetro y horómetro
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            size="sm"
            onClick={handleCreate}
            className="h-9 gap-1.5 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Nueva Programación</span>
          </Button>
        </div>
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

      {/* Vista de Lista */}
      <ProgramacionMantenimientoListView
        programaciones={programaciones}
        isLoading={isLoading}
        onEdit={handleEdit}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
      />

      {/* Diálogo de Creación / Edición */}
      <ProgramacionMantenimientoFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        programacionToEdit={editingProgramacion}
      />
    </div>
  )
}
