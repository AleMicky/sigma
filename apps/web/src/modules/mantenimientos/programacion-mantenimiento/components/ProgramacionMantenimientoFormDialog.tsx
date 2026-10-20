import { useState, useEffect } from "react"
import {
  CalendarClock,
  Clock,
  Gauge,
  Hourglass,
  Plus,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import {
  useCreateProgramacion,
  useUpdateProgramacion,
} from "../api/programacion-mantenimiento.mutations"
import type {
  ProgramacionMantenimiento,
  TipoCriterioMantenimiento,
} from "../api/programacion-mantenimiento.service"

interface CriterioItemState {
  id?: string
  tipoCriterio: TipoCriterioMantenimiento
  intervaloDias: number | null
  intervaloUso: number | null
  proximaFecha: string
  proximoValorUso: number | null
  activo: boolean
}

interface ProgramacionMantenimientoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacionToEdit?: ProgramacionMantenimiento | null
  planMantenimientoActivoId?: string
  planNombre?: string
  activoNombre?: string
  tipoActivoNombre?: string
}

export function ProgramacionMantenimientoFormDialog({
  open,
  onOpenChange,
  programacionToEdit,
  planMantenimientoActivoId,
  planNombre,
  activoNombre,
  tipoActivoNombre,
}: ProgramacionMantenimientoFormDialogProps) {
  const isEditing = Boolean(programacionToEdit)

  const createMutation = useCreateProgramacion()
  const updateMutation = useUpdateProgramacion(programacionToEdit?.id)

  const [activo, setActivo] = useState(true)
  const [criterios, setCriterios] = useState<CriterioItemState[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFormError(null)
      if (programacionToEdit) {
        setActivo(programacionToEdit.activo)
        setCriterios(
          programacionToEdit.criterios.map((c) => ({
            id: c.id,
            tipoCriterio: c.tipoCriterio,
            intervaloDias: c.intervaloDias ?? null,
            intervaloUso: c.intervaloUso ?? null,
            proximaFecha: c.proximaFecha ?? "",
            proximoValorUso: c.proximoValorUso ?? null,
            activo: c.activo,
          })),
        )
      } else {
        setActivo(true)
        setCriterios([
          {
            tipoCriterio: "TIEMPO",
            intervaloDias: 90,
            intervaloUso: null,
            proximaFecha: "",
            proximoValorUso: null,
            activo: true,
          },
        ])
      }
    }
  }, [open, programacionToEdit])

  const selectedTypes = criterios.map((c) => c.tipoCriterio)

  function handleAddCriterio(tipo: TipoCriterioMantenimiento) {
    if (selectedTypes.includes(tipo)) return
    if (tipo === "TIEMPO") {
      setCriterios((prev) => [
        ...prev,
        {
          tipoCriterio: "TIEMPO",
          intervaloDias: 90,
          intervaloUso: null,
          proximaFecha: "",
          proximoValorUso: null,
          activo: true,
        },
      ])
    } else if (tipo === "KILOMETRAJE") {
      setCriterios((prev) => [
        ...prev,
        {
          tipoCriterio: "KILOMETRAJE",
          intervaloDias: null,
          intervaloUso: 5000,
          proximaFecha: "",
          proximoValorUso: 5000,
          activo: true,
        },
      ])
    } else if (tipo === "HORAS_USO") {
      setCriterios((prev) => [
        ...prev,
        {
          tipoCriterio: "HORAS_USO",
          intervaloDias: null,
          intervaloUso: 250,
          proximaFecha: "",
          proximoValorUso: 250,
          activo: true,
        },
      ])
    }
  }

  function handleRemoveCriterio(index: number) {
    setCriterios((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateCriterio(index: number, patch: Partial<CriterioItemState>) {
    setCriterios((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (criterios.length === 0) {
      setFormError("Debe incluir al menos un criterio de mantenimiento.")
      return
    }

    const hasActive = criterios.some((c) => c.activo)
    if (!hasActive) {
      setFormError("Regla 1: Cada programación debe tener al menos un criterio activo.")
      return
    }

    // Regla 2: Sin duplicados
    const tipos = criterios.map((c) => c.tipoCriterio)
    if (new Set(tipos).size !== tipos.length) {
      setFormError("Regla 2: No se permiten criterios duplicados del mismo tipo.")
      return
    }

    for (const crit of criterios) {
      if (crit.tipoCriterio === "TIEMPO") {
        if (!crit.intervaloDias || crit.intervaloDias <= 0) {
          setFormError("El intervalo en días para el criterio por tiempo debe ser mayor a 0.")
          return
        }
      } else {
        if (!crit.intervaloUso || crit.intervaloUso <= 0) {
          setFormError(`El intervalo de uso para el criterio ${crit.tipoCriterio} debe ser mayor a 0.`)
          return
        }
      }
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: programacionToEdit!.id,
          payload: {
            activo,
            criterios: criterios.map((c) => ({
              id: c.id,
              tipoCriterio: c.tipoCriterio,
              intervaloDias: c.tipoCriterio === "TIEMPO" ? c.intervaloDias : null,
              intervaloUso: c.tipoCriterio !== "TIEMPO" ? c.intervaloUso : null,
              proximaFecha: c.tipoCriterio === "TIEMPO" ? (c.proximaFecha || null) : null,
              proximoValorUso: c.tipoCriterio !== "TIEMPO" ? c.proximoValorUso : null,
              activo: c.activo,
            })),
          },
        })
      } else {
        const targetPlanActivoId = planMantenimientoActivoId ?? ""
        if (!targetPlanActivoId) {
          setFormError("Debe especificar la asignación del activo al plan.")
          return
        }
        await createMutation.mutateAsync({
          planMantenimientoActivoId: targetPlanActivoId,
          activo,
          criterios: criterios.map((c) => ({
            tipoCriterio: c.tipoCriterio,
            intervaloDias: c.tipoCriterio === "TIEMPO" ? c.intervaloDias : null,
            intervaloUso: c.tipoCriterio !== "TIEMPO" ? c.intervaloUso : null,
            proximaFecha: c.tipoCriterio === "TIEMPO" ? (c.proximaFecha || null) : null,
            proximoValorUso: c.tipoCriterio !== "TIEMPO" ? c.proximoValorUso : null,
            activo: c.activo,
          })),
        })
      }
      onOpenChange(false)
    } catch {
      // Handled by mutation toast
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CalendarClock className="size-5" />
            <DialogTitle className="text-lg font-bold">
              {isEditing ? "Editar Programación de Mantenimiento" : "Nueva Programación de Mantenimiento"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Configure los criterios preventivos (tiempo, odómetro u horómetro) asociados al activo asignado al plan.
          </DialogDescription>
        </DialogHeader>

        {/* Info del Activo y Plan */}
        {(activoNombre || planNombre) && (
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>{activoNombre}</span>
              {tipoActivoNombre && (
                <Badge variant="outline" className="text-[10px]">
                  {tipoActivoNombre}
                </Badge>
              )}
            </div>
            {planNombre && (
              <div className="text-muted-foreground text-[11px]">
                Plan: <span className="text-foreground font-medium">{planNombre}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {/* Criterios de Programación */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-foreground">
                  Criterios de Mantenimiento
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Cada programación debe tener al menos un criterio activo (Regla 1).
                </p>
              </div>

              {/* Botones para agregar criterios */}
              <div className="flex items-center gap-1.5">
                {!selectedTypes.includes("TIEMPO") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCriterio("TIEMPO")}
                    className="h-7 text-[11px] gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <Clock className="size-3 text-blue-500" />
                    <span>Tiempo</span>
                  </Button>
                )}
                {!selectedTypes.includes("KILOMETRAJE") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCriterio("KILOMETRAJE")}
                    className="h-7 text-[11px] gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <Gauge className="size-3 text-amber-500" />
                    <span>Kilometraje</span>
                  </Button>
                )}
                {!selectedTypes.includes("HORAS_USO") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCriterio("HORAS_USO")}
                    className="h-7 text-[11px] gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <Hourglass className="size-3 text-purple-500" />
                    <span>Horas Uso</span>
                  </Button>
                )}
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-destructive text-[11px] font-medium">
                {formError}
              </div>
            )}

            {/* Tarjetas de Criterios */}
            <div className="space-y-2.5">
              {criterios.map((crit, index) => {
                const tipo = crit.tipoCriterio

                return (
                  <div
                    key={crit.id ?? `${tipo}-${index}`}
                    className={`rounded-xl border p-3.5 space-y-3 transition-all ${
                      crit.activo
                        ? "border-border/70 bg-card shadow-xs"
                        : "border-border/40 bg-muted/20 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          {tipo === "TIEMPO" && <Clock className="size-4 text-blue-500" />}
                          {tipo === "KILOMETRAJE" && <Gauge className="size-4 text-amber-500" />}
                          {tipo === "HORAS_USO" && <Hourglass className="size-4 text-purple-500" />}
                          <span>Criterio: {tipo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={crit.activo}
                            onChange={(e) => handleUpdateCriterio(index, { activo: e.target.checked })}
                            className="rounded border-border text-primary size-3.5"
                          />
                          <span>{crit.activo ? "Activo" : "Inactivo"}</span>
                        </label>

                        {criterios.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveCriterio(index)}
                            className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Eliminar este criterio"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Inputs según tipo */}
                    {tipo === "TIEMPO" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <Label className="text-[11.5px] font-medium">
                            Intervalo en días <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ej: 90"
                            value={crit.intervaloDias ?? ""}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                intervaloDias: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Frecuencia cada cuántos días se repite.
                          </p>
                        </div>
                        <div>
                          <Label className="text-[11.5px] font-medium">Próxima Fecha de Mantenimiento</Label>
                          <Input
                            type="date"
                            value={crit.proximaFecha}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                proximaFecha: e.target.value,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Opcional: Si se deja vacío, se calcula automáticamente.
                          </p>
                        </div>
                      </div>
                    )}

                    {tipo === "KILOMETRAJE" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <Label className="text-[11.5px] font-medium">
                            Intervalo de Kilometraje (km) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ej: 5000"
                            value={crit.intervaloUso ?? ""}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                intervaloUso: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Cada cuántos kilómetros debe realizarse.
                          </p>
                        </div>
                        <div>
                          <Label className="text-[11.5px] font-medium">Próximo Kilometraje Límite</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej: 15000"
                            value={crit.proximoValorUso ?? ""}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                proximoValorUso: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Odómetro exacto en el que se disparará el aviso.
                          </p>
                        </div>
                      </div>
                    )}

                    {tipo === "HORAS_USO" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <Label className="text-[11.5px] font-medium">
                            Intervalo de Horas de Uso (hrs) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ej: 250"
                            value={crit.intervaloUso ?? ""}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                intervaloUso: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Cada cuántas horas de trabajo del horómetro.
                          </p>
                        </div>
                        <div>
                          <Label className="text-[11.5px] font-medium">Próximo Horómetro Límite</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej: 1500"
                            value={crit.proximoValorUso ?? ""}
                            onChange={(e) =>
                              handleUpdateCriterio(index, {
                                proximoValorUso: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="h-8 text-xs mt-1"
                          />
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">
                            Horómetro exacto en el que se disparará el aviso.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <span>{isPending ? "Guardando..." : isEditing ? "Actualizar Programación" : "Guardar Programación"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
