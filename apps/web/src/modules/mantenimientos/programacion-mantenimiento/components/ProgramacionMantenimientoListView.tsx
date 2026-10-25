import { useState } from "react"
import {
  CalendarClock,
  CheckCircle,
  Clock,
  Gauge,
  History,
  Hourglass,
  Info,
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
            const criteriosActivos = (prog.criterios ?? []).filter((c) => c.activo)

            // Evaluar condición general de la tarjeta
            let hasVencido = false
            let hasProximo = false

            for (const c of criteriosActivos) {
              if (c.tipoCriterio === "TIEMPO") {
                if (c.proximaFecha && c.proximaFecha <= todayStr) {
                  hasVencido = true
                } else if (c.proximaFecha) {
                  const diffDays = Math.ceil((new Date(c.proximaFecha).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))
                  if (diffDays <= 7) hasProximo = true
                }
              } else {
                const actual = c.valorActualUso ?? 0
                const proximo = c.proximoValorUso ?? 0
                const intervalo = c.intervaloUso ?? 1
                if (proximo > 0 && actual >= proximo) {
                  hasVencido = true
                } else if (proximo > 0) {
                  const base = Math.max(0, proximo - intervalo)
                  const pct = ((actual - base) / (proximo - base)) * 100
                  if (pct >= 85) hasProximo = true
                }
              }
            }

            return (
              <div
                key={prog.id}
                className={`relative rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md flex flex-col justify-between gap-3 ${
                  !prog.activo
                    ? "bg-muted/20 border-border/40 opacity-75"
                    : hasVencido
                    ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50"
                    : hasProximo
                    ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50"
                    : "bg-card border-border/70 hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {activo?.activoCodigo ?? "Activo"}
                        </span>
                        {activo?.tipoActivoNombre && (
                          <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 border-border/60">
                            {activo.tipoActivoNombre}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-medium text-foreground line-clamp-1">
                        {activo?.activoNombre}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!prog.activo ? (
                        <Badge variant="secondary" className="text-[10px] py-0.5">
                          Inactivo
                        </Badge>
                      ) : hasVencido ? (
                        <Badge variant="destructive" className="text-[10px] font-semibold py-0.5 flex items-center gap-1 bg-red-600 text-white shadow-xs">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          <span>Requiere Servicio</span>
                        </Badge>
                      ) : hasProximo ? (
                        <Badge variant="outline" className="text-[10px] font-semibold py-0.5 border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-300">
                          <span className="size-1.5 rounded-full bg-amber-500 mr-1" />
                          <span>Próximo a Disparar</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold py-0.5 border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500 mr-1" />
                          <span>Monitoreo al Día</span>
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
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
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-border/40">
                    <span className="font-semibold text-primary shrink-0">Plan:</span>
                    <span className="line-clamp-1 font-medium text-foreground/90">{activo?.planNombre ?? "—"}</span>
                  </div>

                  {/* Criterios Configurados con Barra de Avance Real */}
                  <div className="space-y-2">
                    <div className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Criterios Preventivos:</span>
                      <span className="text-[10px] font-medium lowercase text-muted-foreground">
                        {criteriosActivos.length} activos
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(prog.criterios ?? []).map((c) => {
                        if (c.tipoCriterio === "KILOMETRAJE") {
                          const actual = c.valorActualUso ?? 0
                          const proximo = c.proximoValorUso ?? 0
                          const intervalo = c.intervaloUso ?? 5000
                          const base = Math.max(0, proximo - intervalo)
                          const pct = proximo > base ? Math.min(100, Math.max(0, Math.round(((actual - base) / (proximo - base)) * 100))) : 0
                          const restante = proximo - actual
                          const isAlcanzado = proximo > 0 && actual >= proximo
                          const isCerca = pct >= 85 && !isAlcanzado

                          return (
                            <div
                              key={c.id}
                              className={`rounded-xl border p-2.5 text-xs space-y-1.5 transition-all ${
                                !c.activo
                                  ? "bg-muted/20 border-border/30 opacity-60 line-through"
                                  : isAlcanzado
                                  ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                                  : isCerca
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                                  : "bg-muted/30 border-border/50 text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between font-medium text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <Gauge className="size-3.5 text-amber-500 shrink-0" />
                                  <span className="font-semibold">Odómetro</span>
                                  <span className="text-muted-foreground font-normal">
                                    (cada {intervalo.toLocaleString()} km)
                                  </span>
                                </div>
                                <span className="font-bold">
                                  {actual.toLocaleString()} / {proximo.toLocaleString()} km
                                </span>
                              </div>

                              {/* Barra de Progreso del Odómetro */}
                              <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden border border-border/30">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isAlcanzado ? "bg-red-600" : isCerca ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className={isAlcanzado ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                                  {isAlcanzado
                                    ? `⚠️ Umbral alcanzado (+${(actual - proximo).toLocaleString()} km)`
                                    : `Faltan ${restante.toLocaleString()} km para el servicio`}
                                </span>
                                <span className="font-semibold text-muted-foreground">{pct}%</span>
                              </div>
                            </div>
                          )
                        }

                        if (c.tipoCriterio === "HORAS_USO") {
                          const actual = c.valorActualUso ?? 0
                          const proximo = c.proximoValorUso ?? 0
                          const intervalo = c.intervaloUso ?? 250
                          const base = Math.max(0, proximo - intervalo)
                          const pct = proximo > base ? Math.min(100, Math.max(0, Math.round(((actual - base) / (proximo - base)) * 100))) : 0
                          const restante = proximo - actual
                          const isAlcanzado = proximo > 0 && actual >= proximo
                          const isCerca = pct >= 85 && !isAlcanzado

                          return (
                            <div
                              key={c.id}
                              className={`rounded-xl border p-2.5 text-xs space-y-1.5 transition-all ${
                                !c.activo
                                  ? "bg-muted/20 border-border/30 opacity-60 line-through"
                                  : isAlcanzado
                                  ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                                  : isCerca
                                  ? "bg-purple-500/10 border-purple-500/30 text-purple-800 dark:text-purple-300"
                                  : "bg-muted/30 border-border/50 text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between font-medium text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <Hourglass className="size-3.5 text-purple-500 shrink-0" />
                                  <span className="font-semibold">Horómetro</span>
                                  <span className="text-muted-foreground font-normal">
                                    (cada {intervalo.toLocaleString()} hrs)
                                  </span>
                                </div>
                                <span className="font-bold">
                                  {actual.toLocaleString()} / {proximo.toLocaleString()} hrs
                                </span>
                              </div>

                              {/* Barra de Progreso del Horómetro */}
                              <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden border border-border/30">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isAlcanzado ? "bg-red-600" : isCerca ? "bg-purple-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className={isAlcanzado ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                                  {isAlcanzado
                                    ? `⚠️ Umbral alcanzado (+${(actual - proximo).toLocaleString()} hrs)`
                                    : `Faltan ${restante.toLocaleString()} hrs de operación`}
                                </span>
                                <span className="font-semibold text-muted-foreground">{pct}%</span>
                              </div>
                            </div>
                          )
                        }

                        // TIEMPO
                        const targetDate = c.proximaFecha
                        let diffDays = 0
                        let isVencido = false
                        let isCerca = false
                        if (targetDate) {
                          diffDays = Math.ceil((new Date(targetDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24))
                          isVencido = diffDays <= 0
                          isCerca = diffDays > 0 && diffDays <= 7
                        }

                        return (
                          <div
                            key={c.id}
                            className={`rounded-xl border p-2.5 text-xs space-y-1 transition-all ${
                              !c.activo
                                ? "bg-muted/20 border-border/30 opacity-60 line-through"
                                : !targetDate
                                ? "bg-muted/30 border-border/50 text-foreground"
                                : isVencido
                                ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                                : isCerca
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300"
                                : "bg-muted/30 border-border/50 text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between font-medium text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Clock className="size-3.5 text-blue-500 shrink-0" />
                                <span className="font-semibold">Calendario</span>
                                <span className="text-muted-foreground font-normal">
                                  (cada {c.intervaloDias} días)
                                </span>
                              </div>
                              <span className="font-bold">{targetDate ?? "Por evaluar"}</span>
                            </div>

                            <div className="text-[10.5px]">
                              <span className={!targetDate ? "text-muted-foreground italic" : isVencido ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                                {!targetDate
                                  ? "ℹ️ Fecha objetivo aún no calculada (evalúe el parque)"
                                  : isVencido
                                  ? diffDays === 0
                                    ? "⚠️ Vence hoy"
                                    : `⚠️ Vencido hace ${Math.abs(diffDays)} días`
                                  : isCerca
                                  ? `⏰ Próximo a vencer en ${diffDays} días`
                                  : `Faltan ${diffDays} días para la fecha objetivo`}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Resumen explicativo del próximo disparo */}
                  <div className="rounded-xl bg-muted/40 p-2 text-[10.5px] text-muted-foreground flex items-center gap-1.5 border border-border/40">
                    <Info className="size-3.5 text-primary shrink-0" />
                    <span className="line-clamp-2">
                      {hasVencido
                        ? "⚠️ Criterio alcanzado. Haz clic en 'Evaluar' para generar la Solicitud Preventiva."
                        : "Al alcanzarse cualquiera de los umbrales, el sistema generará automáticamente la solicitud preventiva."}
                    </span>
                  </div>
                </div>

                {/* Botones de acción rápida en el pie de tarjeta */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedForHistorial(prog)}
                    className="h-8 text-xs gap-1 px-2.5 cursor-pointer text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <History className="size-3" />
                    <span>Historial</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedForComplete(prog)}
                      className="h-8 text-xs gap-1.5 px-3 cursor-pointer text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/10 border-emerald-500/30 rounded-lg font-medium"
                      title="Registrar servicio completado y recalcular umbrales"
                    >
                      <CheckCircle className="size-3.5" />
                      <span>Completar</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setSelectedForEval(prog)}
                      className={`h-8 text-xs gap-1.5 px-3 cursor-pointer shadow-xs rounded-lg font-medium ${
                        hasVencido
                          ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                      title="Evaluar criterios y generar solicitud preventiva si corresponde"
                    >
                      <Play className="size-3.5 fill-current" />
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
