import { useState, useMemo, useEffect } from "react"
import { CheckCircle, Clock, Gauge, Hourglass, RefreshCw } from "lucide-react"
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
import { Textarea } from "@/shared/components/ui/textarea"
import { useCompletarMantenimiento } from "../api/programacion-mantenimiento.mutations"
import type { ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"

interface CompletarMantenimientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacion: ProgramacionMantenimiento | null
}

export function CompletarMantenimientoDialog({
  open,
  onOpenChange,
  programacion,
}: CompletarMantenimientoDialogProps) {
  const [fechaServicio, setFechaServicio] = useState(new Date().toISOString().split("T")[0])
  const [kilometrajeServicio, setKilometrajeServicio] = useState<string>("")
  const [horasUsoServicio, setHorasUsoServicio] = useState<string>("")
  const [observacion, setObservacion] = useState<string>("")

  const completarMutation = useCompletarMantenimiento()

  useEffect(() => {
    if (open && programacion) {
      setFechaServicio(new Date().toISOString().split("T")[0])
      const kmCrit = programacion.criterios.find((c) => c.tipoCriterio === "KILOMETRAJE")
      if (kmCrit && kmCrit.proximoValorUso != null) {
        setKilometrajeServicio(String(kmCrit.proximoValorUso))
      } else {
        setKilometrajeServicio("")
      }
      const horasCrit = programacion.criterios.find((c) => c.tipoCriterio === "HORAS_USO")
      if (horasCrit && horasCrit.proximoValorUso != null) {
        setHorasUsoServicio(String(horasCrit.proximoValorUso))
      } else {
        setHorasUsoServicio("")
      }
      setObservacion("")
    }
  }, [open, programacion])

  if (!programacion) return null

  const activo = programacion.planActivo

  // Vista previa de los valores recalculados (Regla 5)
  const criteriosRecalculadosPreview = useMemo(() => {
    return programacion.criterios.map((c) => {
      if (c.tipoCriterio === "TIEMPO" && c.intervaloDias) {
        const baseDate = fechaServicio ? new Date(fechaServicio + "T00:00:00") : new Date()
        baseDate.setDate(baseDate.getDate() + c.intervaloDias)
        return {
          ...c,
          formula: `${fechaServicio || "Hoy"} + ${c.intervaloDias} días`,
          nuevoProximo: baseDate.toISOString().split("T")[0],
        }
      }
      if (c.tipoCriterio === "KILOMETRAJE" && c.intervaloUso) {
        const baseKm = kilometrajeServicio ? Number(kilometrajeServicio) : (c.proximoValorUso ?? 0)
        return {
          ...c,
          formula: `${baseKm.toLocaleString()} + ${c.intervaloUso.toLocaleString()} km`,
          nuevoProximo: `${(baseKm + c.intervaloUso).toLocaleString()} km`,
        }
      }
      if (c.tipoCriterio === "HORAS_USO" && c.intervaloUso) {
        const baseHoras = horasUsoServicio ? Number(horasUsoServicio) : (c.proximoValorUso ?? 0)
        return {
          ...c,
          formula: `${baseHoras.toLocaleString()} + ${c.intervaloUso.toLocaleString()} hrs`,
          nuevoProximo: `${(baseHoras + c.intervaloUso).toLocaleString()} hrs`,
        }
      }
      return { ...c, formula: "", nuevoProximo: "—" }
    })
  }, [programacion.criterios, fechaServicio, kilometrajeServicio, horasUsoServicio])

  async function handleSubmit() {
    await completarMutation.mutateAsync({
      id: programacion!.id,
      payload: {
        fechaServicio: fechaServicio || undefined,
        kilometrajeServicio: kilometrajeServicio ? Number(kilometrajeServicio) : undefined,
        horasUsoServicio: horasUsoServicio ? Number(horasUsoServicio) : undefined,
        observacion: observacion || undefined,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="size-5" />
            <DialogTitle className="text-lg font-bold">
              Completar Mantenimiento y Recalcular Criterios
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Registra los datos del servicio realizado para recalcular todos los umbrales de la programación preventiva (Regla 5).
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del Activo */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
          <div className="font-semibold text-foreground">
            {activo?.activoCodigo} • {activo?.activoNombre}
          </div>
          <div className="text-muted-foreground text-[11.5px]">
            Plan: <span className="text-foreground font-medium">{activo?.planNombre}</span>
          </div>
        </div>

        {/* Campos del servicio */}
        <div className="space-y-3.5 py-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="fechaServicio" className="text-[11.5px] font-medium">
                Fecha del Servicio
              </Label>
              <Input
                id="fechaServicio"
                type="date"
                value={fechaServicio}
                onChange={(e) => setFechaServicio(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>

            {programacion.criterios.some((c) => c.tipoCriterio === "KILOMETRAJE") && (
              <div>
                <Label htmlFor="kmServicio" className="text-[11.5px] font-medium">
                  Km al realizar servicio
                </Label>
                <Input
                  id="kmServicio"
                  type="number"
                  placeholder="Ej: 15200"
                  value={kilometrajeServicio}
                  onChange={(e) => setKilometrajeServicio(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}

            {programacion.criterios.some((c) => c.tipoCriterio === "HORAS_USO") && (
              <div>
                <Label htmlFor="horasServicio" className="text-[11.5px] font-medium">
                  Horas al realizar servicio
                </Label>
                <Input
                  id="horasServicio"
                  type="number"
                  placeholder="Ej: 2500"
                  value={horasUsoServicio}
                  onChange={(e) => setHorasUsoServicio(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="observacionServicio" className="text-[11.5px] font-medium">
              Observaciones del Servicio (opcional)
            </Label>
            <Textarea
              id="observacionServicio"
              placeholder="Detalles del trabajo realizado, insumos cambiados o repuestos..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="text-xs resize-none h-16 mt-1"
            />
          </div>
        </div>

        {/* Vista previa de los criterios recalculados */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <RefreshCw className="size-3.5" />
            <span>Recálculo proyectado de próximos mantenimientos:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {criteriosRecalculadosPreview.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-background/80 p-2.5"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-medium">
                    {c.tipoCriterio === "TIEMPO" && <Clock className="size-3.5 text-blue-500" />}
                    {c.tipoCriterio === "KILOMETRAJE" && <Gauge className="size-3.5 text-amber-500" />}
                    {c.tipoCriterio === "HORAS_USO" && <Hourglass className="size-3.5 text-purple-500" />}
                    <span>{c.tipoCriterio}</span>
                  </div>
                  {c.formula && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {c.formula}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {c.nuevoProximo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs cursor-pointer">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={completarMutation.isPending}
            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <CheckCircle className="size-3.5" />
            <span>{completarMutation.isPending ? "Guardando..." : "Confirmar y Recalcular"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
