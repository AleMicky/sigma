import { useState } from "react"
import {
  CalendarClock,
  CheckCircle,
  Clock,
  Gauge,
  History,
  Hourglass,
  MoreVertical,
  Pencil,
  Play,
  Power,
  Search,
  Trash2,
} from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"
import {
  useActivarProgramacion,
  useDeleteProgramacion,
  useDesactivarProgramacion,
} from "../api/programacion-mantenimiento.mutations"
import { EvaluarProgramacionDialog } from "./EvaluarProgramacionDialog"
import { CompletarMantenimientoDialog } from "./CompletarMantenimientoDialog"
import { ProgramacionHistorialSheet } from "./ProgramacionHistorialSheet"

interface ProgramacionMantenimientoListViewProps {
  programaciones: ProgramacionMantenimiento[]
  isLoading: boolean
  onEdit: (programacion: ProgramacionMantenimiento) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  filtroEstado: "todos" | "activos" | "inactivos"
  onFiltroEstadoChange: (filtro: "todos" | "activos" | "inactivos") => void
}

export function ProgramacionMantenimientoListView({
  programaciones,
  isLoading,
  onEdit,
  searchTerm,
  onSearchChange,
  filtroEstado,
  onFiltroEstadoChange,
}: ProgramacionMantenimientoListViewProps) {
  const [selectedForEval, setSelectedForEval] = useState<ProgramacionMantenimiento | null>(null)
  const [selectedForComplete, setSelectedForComplete] = useState<ProgramacionMantenimiento | null>(null)
  const [selectedForHistorial, setSelectedForHistorial] = useState<ProgramacionMantenimiento | null>(null)

  const activarMutation = useActivarProgramacion()
  const desactivarMutation = useDesactivarProgramacion()
  const deleteMutation = useDeleteProgramacion()

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por activo, código o plan..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50 text-xs self-start">
          <button
            type="button"
            onClick={() => onFiltroEstadoChange("todos")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filtroEstado === "todos"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({programaciones.length})
          </button>
          <button
            type="button"
            onClick={() => onFiltroEstadoChange("activos")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filtroEstado === "activos"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Activos
          </button>
          <button
            type="button"
            onClick={() => onFiltroEstadoChange("inactivos")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              filtroEstado === "inactivos"
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Programación */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : programaciones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-xs text-muted-foreground">
          <CalendarClock className="size-10 mx-auto mb-2 text-muted-foreground/60" />
          <p className="font-semibold text-sm text-foreground">No se encontraron programaciones</p>
          <p className="text-[11.5px] mt-1 max-w-sm mx-auto">
            Cree una nueva programación asignada a un activo de un plan de mantenimiento para automatizar los servicios preventivos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {programaciones.map((prog) => {
            const activo = prog.planActivo
            const criteriosActivos = prog.criterios.filter((c) => c.activo)

            return (
              <div
                key={prog.id}
                className={`relative rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  prog.activo
                    ? "bg-card border-border/70 hover:border-primary/40"
                    : "bg-muted/30 border-border/40 opacity-75"
                }`}
              >
                <div>
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground">
                          {activo?.activoCodigo ?? "Activo"}
                        </span>
                        {activo?.tipoActivoNombre && (
                          <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5">
                            {activo.tipoActivoNombre}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-medium text-foreground line-clamp-1">
                        {activo?.activoNombre}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge
                        variant={prog.activo ? "default" : "secondary"}
                        className={`text-[10.5px] font-semibold py-0.5 ${
                          prog.activo
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {prog.activo ? "Vigente" : "Inactivo"}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            />
                          }
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem
                            onClick={() => setSelectedForEval(prog)}
                            className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400 font-medium"
                          >
                            <Play className="size-3.5 fill-current" />
                            <span>Evaluar Disparo</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setSelectedForComplete(prog)}
                            className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                          >
                            <CheckCircle className="size-3.5" />
                            <span>Completar Mantenimiento</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setSelectedForHistorial(prog)}
                            className="gap-2 cursor-pointer"
                          >
                            <History className="size-3.5" />
                            <span>Ver Historial</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => onEdit(prog)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-3.5" />
                            <span>Editar Programación</span>
                          </DropdownMenuItem>

                          {prog.activo ? (
                            <DropdownMenuItem
                              onClick={() => desactivarMutation.mutate(prog.id)}
                              className="gap-2 cursor-pointer text-amber-600"
                            >
                              <Power className="size-3.5" />
                              <span>Desactivar</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => activarMutation.mutate(prog.id)}
                              className="gap-2 cursor-pointer text-emerald-600"
                            >
                              <Power className="size-3.5" />
                              <span>Activar</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm("¿Está seguro de eliminar esta programación de mantenimiento?")) {
                                deleteMutation.mutate(prog.id)
                              }
                            }}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Plan Asociado */}
                  <div className="text-[11.5px] text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="font-semibold text-primary">Plan:</span>
                    <span className="line-clamp-1">{activo?.planNombre ?? "—"}</span>
                  </div>

                  {/* Criterios Configurados */}
                  <div className="space-y-1.5 mb-3">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Criterios ({criteriosActivos.length} activos):
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {prog.criterios.map((c) => {
                        const isVencido =
                          c.tipoCriterio === "TIEMPO" && c.proximaFecha && c.proximaFecha <= todayStr

                        return (
                          <div
                            key={c.id}
                            className={`flex items-center justify-between rounded-lg border p-2 text-[11px] transition-all ${
                              !c.activo
                                ? "bg-muted/20 border-border/30 opacity-60 line-through"
                                : isVencido
                                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 font-medium"
                                : "bg-muted/40 border-border/50 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-medium">
                              {c.tipoCriterio === "TIEMPO" && (
                                <Clock className="size-3.5 text-blue-500 shrink-0" />
                              )}
                              {c.tipoCriterio === "KILOMETRAJE" && (
                                <Gauge className="size-3.5 text-amber-500 shrink-0" />
                              )}
                              {c.tipoCriterio === "HORAS_USO" && (
                                <Hourglass className="size-3.5 text-purple-500 shrink-0" />
                              )}
                              <span>{c.tipoCriterio}:</span>
                              <span className="text-muted-foreground font-normal">
                                {c.tipoCriterio === "TIEMPO" && `cada ${c.intervaloDias} días`}
                                {c.tipoCriterio === "KILOMETRAJE" &&
                                  `cada ${c.intervaloUso?.toLocaleString()} km`}
                                {c.tipoCriterio === "HORAS_USO" &&
                                  `cada ${c.intervaloUso?.toLocaleString()} hrs`}
                              </span>
                            </div>

                            <div className="font-semibold shrink-0 text-right">
                              {c.tipoCriterio === "TIEMPO" && (c.proximaFecha ?? "Sin fecha")}
                              {c.tipoCriterio === "KILOMETRAJE" &&
                                `${c.proximoValorUso?.toLocaleString() ?? 0} km`}
                              {c.tipoCriterio === "HORAS_USO" &&
                                `${c.proximoValorUso?.toLocaleString() ?? 0} hrs`}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Botones de acción rápida en el pie de tarjeta */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedForHistorial(prog)}
                    className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <History className="size-3" />
                    <span>Historial</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedForComplete(prog)}
                      className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                      title="Registrar servicio completado y recalcular umbrales"
                    >
                      <CheckCircle className="size-3" />
                      <span>Completar</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setSelectedForEval(prog)}
                      className="h-7 text-[11px] gap-1 px-2.5 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
                      title="Evaluar criterios y generar solicitud preventiva si corresponde"
                    >
                      <Play className="size-3 fill-current" />
                      <span>Evaluar</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Diálogos modales */}
      <EvaluarProgramacionDialog
        open={Boolean(selectedForEval)}
        onOpenChange={(open) => !open && setSelectedForEval(null)}
        programacion={selectedForEval}
      />

      <CompletarMantenimientoDialog
        open={Boolean(selectedForComplete)}
        onOpenChange={(open) => !open && setSelectedForComplete(null)}
        programacion={selectedForComplete}
      />

      <ProgramacionHistorialSheet
        open={Boolean(selectedForHistorial)}
        onOpenChange={(open) => !open && setSelectedForHistorial(null)}
        programacion={selectedForHistorial}
      />
    </div>
  )
}
