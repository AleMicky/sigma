import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Boxes,
  Calendar,
  Check,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
import { Badge } from "@/shared/components/ui/badge"
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

import { useCreatePlanMantenimientoActivo } from "../api/plan-mantenimiento-activo.mutations"
import type { PlanMantenimientoActivo } from "../api/plan-mantenimiento-activo.service"
import type { PlanMantenimiento } from "../api/plan-mantenimiento.service"

type PlanActivoAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: PlanMantenimiento
  existingAsignaciones: PlanMantenimientoActivo[]
}

function getEmpleadoNombre(emp: Empleado | null | undefined): string {
  if (!emp) return ""
  return emp.personaNombreCompleto || emp.personaInfo?.nombreCompleto || emp.codigo || ""
}

export function PlanActivoAddDialog({
  open,
  onOpenChange,
  plan,
  existingAsignaciones,
}: PlanActivoAddDialogProps) {
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null)
  const [selectedResponsable, setSelectedResponsable] = useState<Empleado | null>(null)
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [estadoActivo, setEstadoActivo] = useState<boolean>(true)
  const [dateError, setDateError] = useState<string | null>(null)

  const createMutation = useCreatePlanMantenimientoActivo()

  // Reset del formulario al abrir
  useEffect(() => {
    if (open) {
      setSelectedActivo(null)
      setSelectedResponsable(null)
      const today = new Date().toISOString().split("T")[0]
      setFechaInicio(today)
      setFechaFin("")
      setEstadoActivo(true)
      setDateError(null)
    }
  }, [open])

  // Regla 1: Cargar sólo activos del tipo permitido por el plan
  const activosQuery = useQuery({
    ...activoQueries.byTipoActivo(plan.tipoActivoId, { page: 0, size: 300 }),
    enabled: open && Boolean(plan.tipoActivoId),
  })

  const activosList = useMemo(() => {
    const data = activosQuery.data
    if (!data) return []
    return data.content ?? []
  }, [activosQuery.data])

  // Cargar lista de empleados para responsable opcional
  const empleadosQuery = useQuery({
    ...empleadoQueries.list({ page: 0, size: 200 }),
    enabled: open,
  })

  const empleadosList = useMemo(() => {
    return empleadosQuery.data?.content ?? []
  }, [empleadosQuery.data])

  // Regla 2: Identificar activos que ya tienen asignación activa para este plan
  const activeAssignedActivoIds = useMemo(() => {
    return new Set(
      existingAsignaciones
        .filter((asig) => asig.estadoActivo)
        .map((asig) => asig.activoId),
    )
  }, [existingAsignaciones])

  const isSelectedActivoAlreadyActive = useMemo(() => {
    if (!selectedActivo) return false
    return activeAssignedActivoIds.has(selectedActivo.id)
  }, [selectedActivo, activeAssignedActivoIds])

  // Regla 3: Validar que fechaFin sea igual o posterior a fechaInicio
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      if (fechaFin < fechaInicio) {
        setDateError("La fecha de fin debe ser igual o posterior a la fecha de inicio.")
      } else {
        setDateError(null)
      }
    } else {
      setDateError(null)
    }
  }, [fechaInicio, fechaFin])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedActivo) return
    if (dateError) return

    // Prevenir envío si viola regla 2
    if (estadoActivo && isSelectedActivoAlreadyActive) {
      return
    }

    await createMutation.mutateAsync({
      planMantenimientoId: plan.id,
      activoId: selectedActivo.id,
      responsableId: selectedResponsable?.id ?? null,
      fechaInicio,
      fechaFin: fechaFin ? fechaFin : null,
      estadoActivo,
    })

    onOpenChange(false)
  }

  const isValid =
    Boolean(selectedActivo) &&
    Boolean(fechaInicio) &&
    !dateError &&
    (!estadoActivo || !isSelectedActivoAlreadyActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/80 bg-background shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Plus className="size-4.5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Asignar Activo al Plan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Plan: <span className="font-semibold text-foreground">{plan.nombre}</span> ({plan.codigo})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Regla 1: Aviso de tipo de activo compatible */}
          <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium">
              <ShieldCheck className="size-3.5 text-blue-500" />
              Tipo requerido por el plan:
            </span>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
              <Boxes className="size-3 mr-1" />
              {plan.tipoActivoNombre ?? "Cualquiera"}
            </Badge>
          </div>

          {/* Selector de Activo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Activo a Asignar *</span>
              {activosQuery.isLoading && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Cargando activos...
                </span>
              )}
            </Label>

            <Combobox
              value={selectedActivo}
              onValueChange={setSelectedActivo}
              itemToStringLabel={(act) => `${act.codigo} - ${act.nombre}`}
            >
              <ComboboxInput
                placeholder={
                  activosQuery.isLoading
                    ? "Cargando activos compatibles..."
                    : "Buscar activo por código o nombre..."
                }
                disabled={activosQuery.isLoading}
                className="rounded-xl border-border/80 h-9 text-xs"
              />
              <ComboboxContent>
                <ComboboxEmpty className="py-4 text-center text-xs text-muted-foreground">
                  {activosQuery.isLoading
                    ? "Cargando..."
                    : `No se encontraron activos para el tipo "${plan.tipoActivoNombre}".`}
                </ComboboxEmpty>
                <ComboboxList>
                  {activosList.map((activo) => {
                    const isAlreadyActive = activeAssignedActivoIds.has(activo.id)
                    return (
                      <ComboboxItem
                        key={activo.id}
                        value={activo}
                        className={cn(
                          "cursor-pointer text-xs py-2 flex items-center justify-between",
                          isAlreadyActive && "opacity-60 bg-muted/30",
                        )}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">
                              {activo.nombre}
                            </span>
                            <code className="text-[10px] bg-muted px-1 rounded font-mono text-muted-foreground">
                              {activo.codigo}
                            </code>
                          </div>
                          {activo.descripcion && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              {activo.descripcion}
                            </span>
                          )}
                        </div>
                        {isAlreadyActive && (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] ml-2 shrink-0">
                            Ya activo
                          </Badge>
                        )}
                      </ComboboxItem>
                    )
                  })}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {/* Regla 2: Advertencia si ya tiene asignación activa */}
            {isSelectedActivoAlreadyActive && estadoActivo && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="font-bold">Asignación Activa Existente</span>
                  <span className="text-[11px] leading-tight">
                    Este activo ya cuenta con una asignación activa a este plan. Para crear una nueva, desactive primero la anterior o guarde ésta como inactiva.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Selector de Responsable */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Responsable Asignado <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Combobox
              value={selectedResponsable}
              onValueChange={setSelectedResponsable}
              itemToStringLabel={(emp) => `${emp.codigo} - ${getEmpleadoNombre(emp)}`}
            >
              <ComboboxInput
                placeholder="Seleccionar empleado responsable..."
                className="rounded-xl border-border/80 h-9 text-xs"
              />
              <ComboboxContent>
                <ComboboxEmpty className="py-4 text-center text-xs text-muted-foreground">
                  No se encontraron empleados.
                </ComboboxEmpty>
                <ComboboxList>
                  {empleadosList.map((emp) => (
                    <ComboboxItem
                      key={emp.id}
                      value={emp}
                      className="cursor-pointer text-xs py-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground">{getEmpleadoNombre(emp)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          Código: {emp.codigo} {emp.cargoNombre ? `• ${emp.cargoNombre}` : ""}
                        </span>
                      </div>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Rango de Fechas - Regla 3 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                Fecha de Inicio *
              </Label>
              <Input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="rounded-xl border-border/80 h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                Fecha de Fin <span className="text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio}
                className={cn(
                  "rounded-xl border-border/80 h-9 text-xs",
                  dateError && "border-destructive focus-visible:ring-destructive",
                )}
              />
            </div>
          </div>

          {dateError && (
            <p className="text-[11px] font-medium text-destructive">{dateError}</p>
          )}

          {/* Switch de Asignación Activa - Regla 5 */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
            <div className="flex flex-col gap-0.5 pr-2">
              <Label className="text-xs font-semibold text-foreground cursor-pointer" onClick={() => setEstadoActivo(!estadoActivo)}>
                Asignación Activa
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Permite la generación de solicitudes y órdenes automáticas para este activo.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={estadoActivo}
              onClick={() => setEstadoActivo(!estadoActivo)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                estadoActivo ? "bg-primary" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
                  estadoActivo ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || createMutation.isPending}
              className="rounded-xl cursor-pointer gap-1.5 font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Asignando...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Asignar al Plan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
