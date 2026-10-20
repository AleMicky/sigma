import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Check,
  Edit3,
  Loader2,
} from "lucide-react"

import { empleadoQueries } from "@/modules/organizacion/empleado/api/empleado.queries"
import type { Empleado } from "@/modules/organizacion/empleado/api/empleado.service"
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

import { useUpdatePlanMantenimientoActivo } from "../api/plan-mantenimiento-activo.mutations"
import type { PlanMantenimientoActivo } from "../api/plan-mantenimiento-activo.service"

type PlanActivoEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  asignacion: PlanMantenimientoActivo | null
  planId: string
}

function getEmpleadoNombre(emp: Empleado | null | undefined): string {
  if (!emp) return ""
  return emp.personaNombreCompleto || emp.personaInfo?.nombreCompleto || emp.codigo || ""
}

export function PlanActivoEditDialog({
  open,
  onOpenChange,
  asignacion,
  planId,
}: PlanActivoEditDialogProps) {
  const [selectedResponsable, setSelectedResponsable] = useState<Empleado | null>(null)
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [estadoActivo, setEstadoActivo] = useState<boolean>(true)
  const [dateError, setDateError] = useState<string | null>(null)

  const updateMutation = useUpdatePlanMantenimientoActivo(planId)

  const empleadosQuery = useQuery({
    ...empleadoQueries.list({ page: 0, size: 200 }),
    enabled: open,
  })

  const empleadosList = useMemo(() => {
    return empleadosQuery.data?.content ?? []
  }, [empleadosQuery.data])

  useEffect(() => {
    if (open && asignacion) {
      setFechaInicio(asignacion.fechaInicio ?? "")
      setFechaFin(asignacion.fechaFin ?? "")
      setEstadoActivo(Boolean(asignacion.estadoActivo))
      setDateError(null)

      if (asignacion.responsableId && empleadosList.length > 0) {
        const found = empleadosList.find((e) => e.id === asignacion.responsableId) ?? null
        setSelectedResponsable(found)
      } else if (asignacion.responsable) {
        setSelectedResponsable({
          id: asignacion.responsable.id,
          codigo: asignacion.responsable.codigo,
          personaNombreCompleto: asignacion.responsable.nombreCompleto,
        } as unknown as Empleado)
      } else {
        setSelectedResponsable(null)
      }
    }
  }, [open, asignacion, empleadosList])

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
    if (!asignacion) return
    if (dateError) return

    await updateMutation.mutateAsync({
      id: asignacion.id,
      payload: {
        responsableId: selectedResponsable?.id ?? null,
        fechaInicio,
        fechaFin: fechaFin ? fechaFin : null,
        estadoActivo,
      },
    })

    onOpenChange(false)
  }

  if (!asignacion) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 bg-background shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Edit3 className="size-4.5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Editar Asignación de Activo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Activo: <span className="font-semibold text-foreground">{asignacion.activo?.nombre}</span> ({asignacion.activo?.codigo})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                {estadoActivo
                  ? "Vigente: genera órdenes preventivas automáticas."
                  : "Desactivada: no generará órdenes automáticas; historial conservado."}
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
              disabled={Boolean(dateError) || updateMutation.isPending}
              className="rounded-xl cursor-pointer gap-1.5 font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Actualizar Asignación</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
