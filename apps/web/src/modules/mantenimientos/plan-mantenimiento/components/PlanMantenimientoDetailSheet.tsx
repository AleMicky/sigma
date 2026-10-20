import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Check,
  CheckSquare,
  ClipboardList,
  Copy,
  Layers,
  ListChecks,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"

import {
  useDeletePlanMantenimientoActividad,
  useUpdatePlanMantenimientoActividad,
} from "../api/plan-mantenimiento-actividad.mutations"
import { planMantenimientoActividadQueries } from "../api/plan-mantenimiento-actividad.queries"
import type { PlanMantenimientoActividad } from "../api/plan-mantenimiento-actividad.service"
import { planMantenimientoActivoQueries } from "../api/plan-mantenimiento-activo.queries"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"
import { PlanActividadAddDialog } from "./PlanActividadAddDialog"
import { PlanActivosTabContent } from "./PlanActivosTabContent"

type PlanMantenimientoDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanMantenimiento | null
  initialTab?: "actividades" | "activos"
  onEditPlan?: (plan: PlanMantenimiento) => void
}

export function PlanMantenimientoDetailSheet({
  open,
  onOpenChange,
  plan,
  initialTab = "actividades",
  onEditPlan,
}: PlanMantenimientoDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<"actividades" | "activos">(initialTab)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<PlanMantenimientoActividad | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)

  const planId = plan?.id ?? ""

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
      setSearchFilter("")
    }
  }, [open, initialTab])

  // Consultar actividades del plan
  const actividadesQuery = useQuery({
    ...planMantenimientoActividadQueries.byPlan(planId),
    enabled: open && Boolean(planId),
    refetchOnMount: "always",
  })

  // Consultar activos asignados para el contador en pestaña
  const asignacionesQuery = useQuery({
    ...planMantenimientoActivoQueries.byPlan(planId),
    enabled: open && Boolean(planId),
  })

  const actividades = useMemo<PlanMantenimientoActividad[]>(() => {
    const raw = actividadesQuery.data as unknown
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (typeof raw === "object" && raw !== null) {
      if ("content" in raw && Array.isArray((raw as { content: unknown }).content)) {
        return (raw as { content: PlanMantenimientoActividad[] }).content
      }
      if ("data" in raw && Array.isArray((raw as { data: unknown }).data)) {
        return (raw as { data: PlanMantenimientoActividad[] }).data
      }
    }
    return []
  }, [actividadesQuery.data])

  const asignacionesRaw = asignacionesQuery.data as unknown
  const totalActivosVigentes = useMemo(() => {
    if (!asignacionesRaw) return 0
    if (Array.isArray(asignacionesRaw)) {
      return asignacionesRaw.filter((a) => a.estadoActivo).length
    }
    return 0
  }, [asignacionesRaw])

  const updateMutation = useUpdatePlanMantenimientoActividad(planId)
  const deleteMutation = useDeletePlanMantenimientoActividad(planId)

  // Filtrar actividades según búsqueda
  const filteredActividades = useMemo(() => {
    const q = searchFilter.trim().toLowerCase()
    if (!q) return actividades
    return actividades.filter((item) => {
      const code = item.actividad?.codigo?.toLowerCase() ?? ""
      const name = item.actividad?.nombre?.toLowerCase() ?? ""
      const comp = item.componente?.nombre?.toLowerCase() ?? ""
      return code.includes(q) || name.includes(q) || comp.includes(q)
    })
  }, [actividades, searchFilter])

  // Métricas
  const totalActividades = actividades.length
  const obligatoriasCount = useMemo(
    () => actividades.filter((a) => a.obligatorio).length,
    [actividades],
  )
  const opcionalesCount = totalActividades - obligatoriasCount

  function copyCode() {
    if (!plan?.codigo) return
    navigator.clipboard.writeText(plan.codigo)
    setCopiedCode(true)
    toast.success(`Código "${plan.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  async function handleToggleObligatorio(actividad: PlanMantenimientoActividad) {
    await updateMutation.mutateAsync({
      id: actividad.id,
      payload: {
        obligatorio: !actividad.obligatorio,
      },
    })
  }

  async function handleMoveOrder(
    index: number,
    direction: "up" | "down",
  ) {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= actividades.length) return

    const current = actividades[index]
    const target = actividades[targetIndex]

    const currentOrder = current.orden ?? index
    const targetOrder = target.orden ?? targetIndex

    const newCurrentOrder = currentOrder === targetOrder
      ? (direction === "up" ? targetOrder - 1 : targetOrder + 1)
      : targetOrder
    const newTargetOrder = currentOrder

    await updateMutation.mutateAsync({
      id: current.id,
      payload: { orden: newCurrentOrder },
    })
    await updateMutation.mutateAsync({
      id: target.id,
      payload: { orden: newTargetOrder },
    })
  }

  if (!plan) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-2xl md:max-w-2xl border-l border-border/80 bg-background shadow-2xl"
      >
        {/* Header del Plan */}
        <SheetHeader className="border-b border-border/60 bg-muted/20 px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-3 pb-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 shadow-2xs">
                <ClipboardList className="size-5" />
              </span>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="text-lg font-bold tracking-tight text-foreground truncate">
                    {plan.nombre}
                  </SheetTitle>

                  <div className="flex items-center gap-1">
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground border border-border/50">
                      {plan.codigo}
                    </code>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                      title="Copiar código"
                    >
                      {copiedCode ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                </div>

                <SheetDescription className="flex items-center gap-2 text-xs text-muted-foreground">
                  {plan.tipoActivoNombre && (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Boxes className="size-3 text-muted-foreground" />
                      {plan.tipoActivoNombre}
                    </span>
                  )}
                  {plan.descripcion && <span>• {plan.descripcion}</span>}
                </SheetDescription>
              </div>
            </div>

            {onEditPlan && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPlan(plan)}
                className="h-8 gap-1.5 text-xs rounded-lg shrink-0 cursor-pointer"
                title="Editar información del plan"
              >
                <Pencil className="size-3.5" />
                <span>Editar Plan</span>
              </Button>
            )}
          </div>

          {/* Navegación por Pestañas: Actividades vs Activos Asignados */}
          <div className="flex items-center gap-1 border-t border-border/50 -mx-6 px-6 bg-card/60">
            <button
              type="button"
              onClick={() => setActiveTab("actividades")}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 px-3.5 text-xs font-semibold transition-all cursor-pointer relative",
                activeTab === "actividades"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <ListChecks className="size-4" />
              <span>Actividades Técnicas</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                  activeTab === "actividades"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {totalActividades}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activos")}
              className={cn(
                "flex items-center gap-2 border-b-2 py-3 px-3.5 text-xs font-semibold transition-all cursor-pointer relative",
                activeTab === "activos"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Boxes className="size-4" />
              <span>Activos Asignados</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                  activeTab === "activos"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {totalActivosVigentes}
              </span>
            </button>
          </div>
        </SheetHeader>

        {/* Contenido según pestaña activa */}
        {activeTab === "activos" ? (
          <PlanActivosTabContent plan={plan} />
        ) : (
          <div className="flex flex-col h-full min-h-0 flex-1">
            {/* Barra de Estadísticas Rápidas de Actividades */}
            <div className="grid grid-cols-3 gap-2.5 border-b border-border/40 bg-muted/10 p-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-2 shadow-2xs">
                <span className="text-base font-bold text-foreground">
                  {totalActividades}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Total Actividades
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-2 shadow-2xs">
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {obligatoriasCount}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Obligatorias
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card p-2 shadow-2xs">
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {opcionalesCount}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Opcionales
                </span>
              </div>
            </div>

            {/* Toolbar de Actividades */}
            <div className="flex items-center justify-between gap-2.5 border-b border-border/40 px-6 py-3 bg-card/60">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar en actividades del plan..."
                  className="h-8 pl-8 text-xs shadow-none border-border/80"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={() => actividadesQuery.refetch()}
                  disabled={actividadesQuery.isFetching}
                  title="Refrescar actividades"
                  className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={cn("size-3.5", actividadesQuery.isFetching && "animate-spin")} />
                </Button>

                <Button
                  size="sm"
                  onClick={() => setAddDialogOpen(true)}
                  className="h-8 gap-1.5 text-xs font-semibold rounded-lg cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Agregar Actividad</span>
                </Button>
              </div>
            </div>

            {/* Lista de Actividades */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {actividadesQuery.isLoading ? (
                <ListSkeleton rows={5} rowClassName="h-16 rounded-xl" />
              ) : actividadesQuery.isError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
                    <AlertCircle className="size-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Error al cargar las actividades del plan
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    {getErrorMessage(actividadesQuery.error)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actividadesQuery.refetch()}
                    className="mt-4 rounded-xl cursor-pointer gap-1.5"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Reintentar</span>
                  </Button>
                </div>
              ) : actividades.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList className="size-8 text-muted-foreground/60" />}
                  title="No hay actividades asignadas a este plan"
                  description="Agrega las actividades preventivas que los técnicos deben realizar durante este mantenimiento."
                  action={
                    <Button
                      size="sm"
                      onClick={() => setAddDialogOpen(true)}
                      className="rounded-xl cursor-pointer"
                    >
                      <Plus className="size-4 mr-1" />
                      Asignar Primera Actividad
                    </Button>
                  }
                />
              ) : filteredActividades.length === 0 ? (
                <EmptyState
                  title="Sin resultados para la búsqueda"
                  description="Intenta buscar con otro término o limpia el buscador."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchFilter("")}
                      className="rounded-xl cursor-pointer"
                    >
                      Limpiar búsqueda
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {filteredActividades.map((item, index) => {
                    const isFirst = index === 0
                    const isLast = index === filteredActividades.length - 1

                    return (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs transition-all hover:border-primary/40 hover:bg-muted/15"
                      >
                        {/* Orden / Secuencia badge y Reordenar */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col items-center">
                            <button
                              type="button"
                              disabled={isFirst || updateMutation.isPending}
                              onClick={() => handleMoveOrder(index, "up")}
                              className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed p-0.5 transition-colors"
                              title="Subir posición"
                            >
                              <ArrowUp className="size-3" />
                            </button>
                            <span className="flex size-6 items-center justify-center rounded-md bg-secondary font-mono text-[11px] font-bold text-secondary-foreground shadow-2xs">
                              {item.orden != null ? item.orden : index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={isLast || updateMutation.isPending}
                              onClick={() => handleMoveOrder(index, "down")}
                              className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed p-0.5 transition-colors"
                              title="Bajar posición"
                            >
                              <ArrowDown className="size-3" />
                            </button>
                          </div>
                        </div>

                        {/* Información de la Actividad */}
                        <div className="flex flex-col min-w-0 flex-1 gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.actividad?.codigo && (
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                              {item.actividad.codigo}
                            </code>
                            )}
                            <span className="text-xs font-semibold text-foreground truncate">
                              {item.actividad?.nombre || "Actividad"}
                            </span>
                          </div>

                          {item.actividad?.descripcion && (
                            <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
                              {item.actividad.descripcion}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground pt-0.5">
                            {item.componente?.nombre && (
                              <span className="inline-flex items-center gap-1 font-medium text-primary">
                                <Layers className="size-2.5" />
                                {item.componente.nombre}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges y Acciones */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Botón interactivo Obligatorio / Opcional */}
                          <button
                            type="button"
                            onClick={() => handleToggleObligatorio(item)}
                            disabled={updateMutation.isPending}
                            className="cursor-pointer transition-transform active:scale-95"
                            title="Haz clic para cambiar entre obligatorio y opcional"
                          >
                            <Badge
                              variant={item.obligatorio ? "default" : "secondary"}
                              className={cn(
                                "text-[10px] gap-1 px-2 py-0.5 font-medium transition-colors cursor-pointer",
                                item.obligatorio
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                              )}
                            >
                              <CheckSquare className="size-2.5" />
                              {item.obligatorio ? "Obligatoria" : "Opcional"}
                            </Badge>
                          </button>

                          {/* Botón Eliminar / Desvincular */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setItemToDelete(item)}
                            disabled={deleteMutation.isPending}
                            className="size-7 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                            title="Desvincular actividad del plan"
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Desvincular</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dialog para Agregar Actividad */}
            <PlanActividadAddDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              plan={plan}
              existingActividades={actividades}
            />

            {/* Modal de confirmación para desvincular */}
            <ConfirmDeleteDialog
              open={Boolean(itemToDelete)}
              onOpenChange={(open) => {
                if (!open) setItemToDelete(null)
              }}
              title="Desvincular actividad del plan"
              description={
                itemToDelete
                  ? `¿Seguro que deseas desvincular la actividad "${itemToDelete.actividad?.nombre || itemToDelete.actividad?.codigo}" de este plan de mantenimiento?`
                  : "¿Seguro que deseas desvincular esta actividad?"
              }
              isPending={deleteMutation.isPending}
              onConfirm={async () => {
                if (!itemToDelete) return
                await deleteMutation.mutateAsync(itemToDelete.id)
                setItemToDelete(null)
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
