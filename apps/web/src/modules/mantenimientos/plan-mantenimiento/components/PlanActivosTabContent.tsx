import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Boxes,
  Calendar,
  CalendarClock,
  Check,
  Copy,
  Edit3,
  History,
  PauseCircle,
  PlayCircle,
  Plus,
  PowerOff,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

import {
  useActivarPlanMantenimientoActivo,
  useDeletePlanMantenimientoActivo,
  useDesactivarPlanMantenimientoActivo,
} from "../api/plan-mantenimiento-activo.mutations"
import { planMantenimientoActivoQueries } from "../api/plan-mantenimiento-activo.queries"
import type { PlanMantenimientoActivo } from "../api/plan-mantenimiento-activo.service"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"
import { useProgramaciones } from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.queries"
import { ProgramacionMantenimientoFormDialog } from "@/modules/mantenimientos/programacion-mantenimiento/components/ProgramacionMantenimientoFormDialog"
import type { ProgramacionMantenimiento } from "@/modules/mantenimientos/programacion-mantenimiento/api/programacion-mantenimiento.service"
import { PlanActivoAddDialog } from "./PlanActivoAddDialog"
import { PlanActivoEditDialog } from "./PlanActivoEditDialog"

type PlanActivosTabContentProps = {
  plan: PlanMantenimiento
}

export function PlanActivosTabContent({ plan }: PlanActivosTabContentProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanMantenimientoActivo | null>(null)
  const [itemToDelete, setItemToDelete] = useState<PlanMantenimientoActivo | null>(null)
  const [itemToDesactivar, setItemToDesactivar] = useState<PlanMantenimientoActivo | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const planId = plan.id

  // Cargar asignaciones del plan
  const asignacionesQuery = useQuery({
    ...planMantenimientoActivoQueries.byPlan(planId),
    enabled: Boolean(planId),
    refetchOnMount: "always",
  })

  const rawData = asignacionesQuery.data as unknown
  const asignaciones = useMemo<PlanMantenimientoActivo[]>(() => {
    if (!rawData) return []
    if (Array.isArray(rawData)) return rawData
    if (typeof rawData === "object" && rawData !== null) {
      if ("content" in rawData && Array.isArray((rawData as { content: unknown }).content)) {
        return (rawData as { content: PlanMantenimientoActivo[] }).content
      }
      if ("data" in rawData && Array.isArray((rawData as { data: unknown }).data)) {
        return (rawData as { data: PlanMantenimientoActivo[] }).data
      }
    }
    return []
  }, [rawData])

  const deleteMutation = useDeletePlanMantenimientoActivo(planId)
  const desactivarMutation = useDesactivarPlanMantenimientoActivo(planId)
  const activarMutation = useActivarPlanMantenimientoActivo(planId)

  // Consultar programaciones preventivas activas para asociar a cada activo asignado
  const { data: programacionesData, refetch: refetchProgramaciones } = useProgramaciones({ pageSize: 200 })
  const programacionesByPlanActivo = useMemo(() => {
    const map = new Map<string, ProgramacionMantenimiento>()
    if (programacionesData?.content) {
      for (const prog of programacionesData.content) {
        if (prog.planMantenimientoActivoId) {
          map.set(prog.planMantenimientoActivoId, prog)
        }
      }
    }
    return map
  }, [programacionesData])

  const [selectedPlanActivoForProgramacion, setSelectedPlanActivoForProgramacion] = useState<PlanMantenimientoActivo | null>(null)
  const [programacionToEdit, setProgramacionToEdit] = useState<ProgramacionMantenimiento | null>(null)
  const [programacionDialogOpen, setProgramacionDialogOpen] = useState(false)

  // Métricas
  const totalAsignados = asignaciones.length
  const vigentesCount = useMemo(
    () => asignaciones.filter((a) => a.estadoActivo).length,
    [asignaciones],
  )
  const inactivosCount = totalAsignados - vigentesCount

  // Filtrado
  const filteredAsignaciones = useMemo(() => {
    return asignaciones.filter((item) => {
      // Filtro de estado
      if (statusFilter === "active" && !item.estadoActivo) return false
      if (statusFilter === "inactive" && item.estadoActivo) return false

      // Filtro de texto
      const q = searchFilter.trim().toLowerCase()
      if (!q) return true

      const actCodigo = item.activo?.codigo?.toLowerCase() ?? ""
      const actNombre = item.activo?.nombre?.toLowerCase() ?? ""
      const actDesc = item.activo?.descripcion?.toLowerCase() ?? ""
      const respNombre = item.responsable?.nombreCompleto?.toLowerCase() ?? ""
      return (
        actCodigo.includes(q) ||
        actNombre.includes(q) ||
        actDesc.includes(q) ||
        respNombre.includes(q)
      )
    })
  }, [asignaciones, searchFilter, statusFilter])

  function copyText(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Código "${code}" copiado`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Resumen de Métricas */}
      <div className="grid grid-cols-3 gap-2 border-b border-border/40 bg-muted/10 p-4">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-2.5 shadow-2xs">
          <span className="text-base font-bold text-foreground">
            {totalAsignados}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            Total Activos
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 shadow-2xs">
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {vigentesCount}
          </span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 uppercase font-semibold tracking-wider">
            Vigentes
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-2.5 shadow-2xs">
          <span className="text-base font-bold text-muted-foreground">
            {inactivosCount}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
            Históricos
          </span>
        </div>
      </div>

      {/* Toolbar: Búsqueda, Filtro de Estado y Botón de Asignar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-border/40 px-6 py-3 bg-card/60">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por código, activo o responsable..."
              className="h-8 pl-8 text-xs shadow-none border-border/80"
            />
          </div>

          {/* Filtros de estado rápido */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todos ({totalAsignados})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                statusFilter === "active"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Vigentes ({vigentesCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                statusFilter === "inactive"
                  ? "bg-background text-muted-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Histórico ({inactivosCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => asignacionesQuery.refetch()}
            disabled={asignacionesQuery.isFetching}
            title="Refrescar asignaciones"
            className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", asignacionesQuery.isFetching && "animate-spin")} />
          </Button>

          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold rounded-lg cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Asignar Activo</span>
          </Button>
        </div>
      </div>

      {/* Lista de Activos Asignados */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {asignacionesQuery.isLoading ? (
          <ListSkeleton rows={4} rowClassName="h-20 rounded-xl" />
        ) : asignacionesQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Error al cargar los activos del plan
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {getErrorMessage(asignacionesQuery.error)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => asignacionesQuery.refetch()}
              className="mt-4 rounded-xl cursor-pointer gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              <span>Reintentar</span>
            </Button>
          </div>
        ) : asignaciones.length === 0 ? (
          <EmptyState
            icon={<Boxes className="size-8 text-muted-foreground/60" />}
            title="No hay activos asignados a este plan"
            description={`Asigna los activos del tipo "${plan.tipoActivoNombre ?? 'correspondiente'}" que recibirán este programa de mantenimiento.`}
            action={
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="rounded-xl cursor-pointer"
              >
                <Plus className="size-4 mr-1" />
                Asignar Primer Activo
              </Button>
            }
          />
        ) : filteredAsignaciones.length === 0 ? (
          <EmptyState
            title="Sin resultados para la búsqueda"
            description="Intenta buscar con otro término o limpia los filtros."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchFilter("")
                  setStatusFilter("all")
                }}
                className="rounded-xl cursor-pointer"
              >
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredAsignaciones.map((item) => {
              const isCopied = copiedCode === item.activo?.codigo
              const isActivo = Boolean(item.estadoActivo)
              const prog = programacionesByPlanActivo.get(item.id)

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-all shadow-2xs",
                    isActivo
                      ? "border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-xs"
                      : "border-border/50 bg-muted/20 opacity-80 hover:opacity-100",
                  )}
                >
                  {/* Fila superior: Datos del Activo y Acciones */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105",
                          isActivo
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                            : "bg-muted text-muted-foreground border-border/60",
                        )}
                      >
                        <Boxes className="size-5" />
                      </span>

                      <div className="flex flex-col min-w-0 flex-1 gap-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {item.activo?.nombre ?? "Activo sin nombre"}
                          </span>

                          {item.activo?.codigo && (
                            <div className="flex items-center gap-1">
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-foreground border border-border/50">
                                {item.activo.codigo}
                              </code>
                              <button
                                type="button"
                                onClick={() => copyText(item.activo!.codigo)}
                                className="inline-flex size-4 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                                title="Copiar código"
                              >
                                {isCopied ? (
                                  <Check className="size-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="size-2.5" />
                                )}
                              </button>
                            </div>
                          )}

                          {item.activo?.tipoActivoNombre && (
                            <Badge variant="outline" className="border-border/60 text-[10.5px] font-medium text-muted-foreground">
                              {item.activo.tipoActivoNombre}
                            </Badge>
                          )}
                        </div>

                        {item.activo?.descripcion && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {item.activo.descripcion}
                          </p>
                        )}

                        {/* Información de Vigencia y Responsable */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span>Desde: <strong>{item.fechaInicio}</strong></span>
                            <span>•</span>
                            <span>Hasta: <strong>{item.fechaFin ?? "Indefinido"}</strong></span>
                          </span>

                          {item.responsable && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border/40">
                              <UserCheck className="size-3 text-primary" />
                              {item.responsable.nombreCompleto}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado derecho: Estado y Acciones de la Asignación */}
                    <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="flex items-center mr-1">
                        {isActivo ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Vigente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border/50">
                            <History className="size-3 text-muted-foreground" />
                            Desactivado
                          </span>
                        )}
                      </div>

                      {/* Botón Desactivar / Reactivar */}
                      {isActivo ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setItemToDesactivar(item)}
                          disabled={desactivarMutation.isPending}
                          title="Desactivar asignación (impedir solicitudes automáticas sin borrar historial)"
                          className="h-8 gap-1.5 text-xs text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer rounded-lg"
                        >
                          <PauseCircle className="size-3.5" />
                          <span className="hidden sm:inline">Desactivar</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => activarMutation.mutate(item.id)}
                          disabled={activarMutation.isPending}
                          title="Reactivar asignación para este activo"
                          className="h-8 gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer rounded-lg"
                        >
                          <PlayCircle className="size-3.5" />
                          <span className="hidden sm:inline">Reactivar</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setEditingItem(item)}
                        title="Editar fechas y responsable"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Edit3 className="size-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setItemToDelete(item)}
                        disabled={deleteMutation.isPending}
                        title="Eliminar asignación permanentemente"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Fila inferior: Estado de la Programación Preventiva Automática */}
                  {prog && prog.activo ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                          <CalendarClock className="size-3.5" />
                          <span>Programación Preventiva Activa</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setProgramacionToEdit(prog)
                            setSelectedPlanActivoForProgramacion(item)
                            setProgramacionDialogOpen(true)
                          }}
                          className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
                        >
                          <Edit3 className="size-3" />
                          <span>Modificar Criterios</span>
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {prog.criterios.filter((c) => c.activo).map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-0.5 font-medium border border-border/60 text-foreground text-[10.5px]"
                          >
                            {c.tipoCriterio === "TIEMPO" && `📅 Cada ${c.intervaloDias} días (Próx: ${c.proximaFecha ?? "—"})`}
                            {c.tipoCriterio === "KILOMETRAJE" && `🚗 Cada ${c.intervaloUso?.toLocaleString()} km (Próx: ${c.proximoValorUso?.toLocaleString()} km)`}
                            {c.tipoCriterio === "HORAS_USO" && `⏱️ Cada ${c.intervaloUso?.toLocaleString()} hrs (Próx: ${c.proximoValorUso?.toLocaleString()} hrs)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                          <span>Sin Programación Preventiva</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Este activo no disparará solicitudes automáticas hasta configurar sus criterios de telemetría (km, horas o días).
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setSelectedPlanActivoForProgramacion(item)
                          setProgramacionToEdit(null)
                          setProgramacionDialogOpen(true)
                        }}
                        className="h-7 shrink-0 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs rounded-lg font-medium"
                      >
                        <Plus className="size-3.5" />
                        <span>Configurar Programación</span>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Diálogo de Asignar Activo */}
      <PlanActivoAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        plan={plan}
        existingAsignaciones={asignaciones}
      />

      {/* Diálogo de Editar Asignación */}
      <PlanActivoEditDialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null)
        }}
        asignacion={editingItem}
        planId={planId}
      />

      {/* Diálogo de Confirmación para Desactivar (Regla 5) */}
      <Dialog
        open={Boolean(itemToDesactivar)}
        onOpenChange={(open) => {
          if (!open) setItemToDesactivar(null)
        }}
      >
        <DialogContent className="sm:max-w-md border-border/80 bg-background shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <PowerOff className="size-4.5" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Desactivar Asignación
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Activo: <span className="font-semibold text-foreground">{itemToDesactivar?.activo?.nombre}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-muted-foreground">
            <p>
              Al desactivar esta asignación, el sistema <strong>impedirá automáticamente la generación de nuevas solicitudes y órdenes de trabajo</strong> para este activo en este plan.
            </p>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-blue-700 dark:text-blue-300">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="size-3.5 text-blue-500" />
                Historial Preservado
              </p>
              <p className="text-[11px] leading-relaxed">
                Todo el historial de mantenimientos pasados, fechas y auditoría se mantendrá intacto para consultas y reportes.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemToDesactivar(null)}
              className="rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                if (!itemToDesactivar) return
                await desactivarMutation.mutateAsync(itemToDesactivar.id)
                setItemToDesactivar(null)
              }}
              disabled={desactivarMutation.isPending}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer font-semibold"
            >
              Confirmar Desactivación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación para Eliminar Físicamente (Regla 4) */}
      <ConfirmDeleteDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
        title="Eliminar asignación de activo"
        description={
          itemToDelete
            ? `¿Deseas eliminar permanentemente la asignación del activo "${itemToDelete.activo?.nombre}"? Nota: Si el activo ya cuenta con órdenes de trabajo o mantenimientos ejecutados, la eliminación física será bloqueada por seguridad.`
            : "¿Seguro que deseas eliminar esta asignación?"
        }
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!itemToDelete) return
          await deleteMutation.mutateAsync(itemToDelete.id)
          setItemToDelete(null)
        }}
      />
      {/* Diálogo para Configurar / Editar Programación Preventiva desde el Activo */}
      <ProgramacionMantenimientoFormDialog
        open={programacionDialogOpen}
        onOpenChange={(isOpen) => {
          setProgramacionDialogOpen(isOpen)
          if (!isOpen) {
            refetchProgramaciones()
            setSelectedPlanActivoForProgramacion(null)
            setProgramacionToEdit(null)
          }
        }}
        programacionToEdit={programacionToEdit}
        planMantenimientoActivoId={selectedPlanActivoForProgramacion?.id ?? programacionToEdit?.planMantenimientoActivoId}
        planNombre={plan.nombre}
        activoNombre={selectedPlanActivoForProgramacion?.activo?.nombre ?? programacionToEdit?.planActivo?.activoNombre}
        tipoActivoNombre={(selectedPlanActivoForProgramacion?.activo?.tipoActivoNombre ?? plan.tipoActivoNombre) || undefined}
      />
    </div>
  )
}
