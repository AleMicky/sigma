import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, CheckSquare, Layers, Loader2, Plus } from "lucide-react"

import {
  type ActividadAplicacion,
  listAplicacionesByTipoActivo,
} from "@/modules/mantenimientos/actividad/api/actividad-aplicacion.service"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

import { useCreatePlanMantenimientoActividad } from "../api/plan-mantenimiento-actividad.mutations"
import type { PlanMantenimientoActividad } from "../api/plan-mantenimiento-actividad.service"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"

type PlanActividadAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanMantenimiento
  existingActividades: PlanMantenimientoActividad[]
}

export function PlanActividadAddDialog({
  open,
  onOpenChange,
  plan,
  existingActividades,
}: PlanActividadAddDialogProps) {
  const [selectedAplicacion, setSelectedAplicacion] = useState<ActividadAplicacion | null>(null)
  const [orden, setOrden] = useState<number>(0)
  const [obligatorio, setObligatorio] = useState<boolean>(true)

  const createMutation = useCreatePlanMantenimientoActividad()

  const defaultOrder = useMemo(() => {
    if (existingActividades.length === 0) return 0
    return Math.max(...existingActividades.map((a) => a.orden ?? 0)) + 1
  }, [existingActividades])

  useEffect(() => {
    if (open) {
      setSelectedAplicacion(null)
      setOrden(defaultOrder)
      setObligatorio(true)
    }
  }, [open, defaultOrder])

  // Cargar aplicaciones de actividades disponibles para el tipo de activo de este plan
  const aplicacionesQuery = useQuery({
    queryKey: ["actividades-aplicaciones", "tipo-activo", plan.tipoActivoId],
    queryFn: () => listAplicacionesByTipoActivo(plan.tipoActivoId),
    enabled: open && Boolean(plan.tipoActivoId),
  })

  const assignedAplicacionIds = useMemo(
    () => new Set(existingActividades.map((a) => a.actividadMantenimientoAplicacionId)),
    [existingActividades],
  )

  const availableAplicaciones = useMemo(() => {
    const list = aplicacionesQuery.data ?? []
    return list.filter((app) => !assignedAplicacionIds.has(app.id))
  }, [aplicacionesQuery.data, assignedAplicacionIds])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAplicacion) return

    await createMutation.mutateAsync({
      planMantenimientoId: plan.id,
      actividadMantenimientoAplicacionId: selectedAplicacion.id,
      orden: Number.isNaN(orden) ? defaultOrder : orden,
      obligatorio,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="size-4" />
            </span>
            Agregar Actividad al Plan
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecciona una actividad configurada para{" "}
            <span className="font-semibold text-foreground">
              {plan.tipoActivoNombre || "el tipo de activo"}
            </span>{" "}
            e indica su secuencia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Selector de Actividad */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Actividad de mantenimiento <span className="text-destructive">*</span>
            </Label>

            {aplicacionesQuery.isLoading ? (
              <div className="flex h-10 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                Cargando actividades disponibles...
              </div>
            ) : availableAplicaciones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
                {aplicacionesQuery.data && aplicacionesQuery.data.length > 0
                  ? "Todas las actividades disponibles para este tipo de activo ya han sido asignadas al plan."
                  : "No hay actividades de mantenimiento configuradas para este tipo de activo."}
              </div>
            ) : (
              <Combobox
                items={availableAplicaciones}
                itemToStringLabel={(item: ActividadAplicacion) =>
                  item ? `${item.actividad?.codigo ?? ""} - ${item.actividad?.nombre ?? "Actividad"}` : ""
                }
                itemToStringValue={(item: ActividadAplicacion) => item?.id ?? ""}
                value={selectedAplicacion}
                onValueChange={(val: ActividadAplicacion | null) => setSelectedAplicacion(val)}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    placeholder="Buscar actividad por código o nombre..."
                    className="w-full text-xs shadow-2xs"
                    showClear
                  />
                </div>
                <ComboboxContent className="z-50 max-h-60 min-w-[320px] p-1 rounded-xl shadow-lg border border-border/80">
                  <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                    No se encontraron actividades disponibles.
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: ActividadAplicacion) => (
                      <ComboboxItem
                        key={item.id}
                        value={item}
                        className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {item.actividad?.codigo && (
                              <code className="text-[10px] font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {item.actividad.codigo}
                              </code>
                            )}
                            <span className="truncate text-xs font-semibold text-foreground">
                              {item.actividad?.nombre || "Actividad sin nombre"}
                            </span>
                          </div>
                          {item.componente?.nombre && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Layers className="size-2.5" />
                              Componente: {item.componente.nombre}
                            </span>
                          )}
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </div>

          {/* Actividad seleccionada preview */}
          {selectedAplicacion && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedAplicacion.actividad?.codigo && (
                      <code className="font-mono text-[10px] font-bold bg-background/80 px-1 rounded">
                        {selectedAplicacion.actividad.codigo}
                      </code>
                    )}
                    <span className="font-semibold text-foreground">
                      {selectedAplicacion.actividad?.nombre}
                    </span>
                  </div>
                  {selectedAplicacion.actividad?.descripcion && (
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {selectedAplicacion.actividad.descripcion}
                    </p>
                  )}
                  {selectedAplicacion.componente && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                      <Layers className="size-3" />
                      <span>Componente: {selectedAplicacion.componente.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Secuencia / Orden y Obligatorio */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="orden" className="text-xs font-medium">
                Orden de ejecución
              </Label>
              <Input
                id="orden"
                type="number"
                min={0}
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value, 10) || 0)}
                className="text-xs shadow-2xs"
              />
              <span className="text-[10px] text-muted-foreground">
                Posición en la secuencia (0 = primero)
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Requerimiento</Label>
              <button
                type="button"
                onClick={() => setObligatorio(!obligatorio)}
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors cursor-pointer",
                  obligatorio
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-border/80 bg-muted/40 text-muted-foreground",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="size-3.5" />
                  {obligatorio ? "Obligatoria" : "Opcional"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  {obligatorio ? "SÍ" : "NO"}
                </span>
              </button>
              <span className="text-[10px] text-muted-foreground">
                {obligatorio
                  ? "Debe cumplirse obligatoriamente"
                  : "Puede omitirse si no aplica"}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedAplicacion || createMutation.isPending}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Asignar Actividad
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
