import { useState } from "react"
import { AlertCircle, CheckCircle2, Clock, Gauge, Hourglass, Play, Sparkles } from "lucide-react"
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
import { useEvaluarProgramacion } from "../api/programacion-mantenimiento.mutations"
import type { EvaluacionProgramacionResponse, ProgramacionMantenimiento } from "../api/programacion-mantenimiento.service"

interface EvaluarProgramacionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programacion: ProgramacionMantenimiento | null
}

export function EvaluarProgramacionDialog({
  open,
  onOpenChange,
  programacion,
}: EvaluarProgramacionDialogProps) {
  const [fechaActual, setFechaActual] = useState(new Date().toISOString().split("T")[0])
  const [kilometrajeActual, setKilometrajeActual] = useState<string>("")
  const [horasUsoActual, setHorasUsoActual] = useState<string>("")
  const [forzarGeneracion, setForzarGeneracion] = useState(false)
  const [resultado, setResultado] = useState<EvaluacionProgramacionResponse | null>(null)

  const evaluarMutation = useEvaluarProgramacion()

  if (!programacion) return null

  const activo = programacion.planActivo

  async function handleEvaluar() {
    setResultado(null)
    const res = await evaluarMutation.mutateAsync({
      id: programacion!.id,
      payload: {
        fechaActual: fechaActual || undefined,
        kilometrajeActual: kilometrajeActual ? Number(kilometrajeActual) : undefined,
        horasUsoActual: horasUsoActual ? Number(horasUsoActual) : undefined,
        forzarGeneracion,
      },
    })
    setResultado(res)
  }

  function handleClose() {
    setResultado(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-500">
            <Sparkles className="size-5" />
            <DialogTitle className="text-lg font-bold">
              Evaluar Disparo de Mantenimiento Preventivo
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Comprueba si se cumple cualquiera de los criterios programados para generar una única solicitud de mantenimiento (Regla 4).
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del Activo y Plan */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              {activo?.activoCodigo} • {activo?.activoNombre}
            </span>
            <Badge variant="outline" className="text-[11px] font-medium">
              {activo?.tipoActivoNombre ?? "Activo"}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <span>Plan:</span>
            <span className="font-medium text-foreground">{activo?.planNombre}</span>
          </div>

          {/* Criterios activos configurados */}
          <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {programacion.criterios
              .filter((c) => c.activo)
              .map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-background/80 border border-border/50 p-2 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
                    {c.tipoCriterio === "TIEMPO" && <Clock className="size-3.5" />}
                    {c.tipoCriterio === "KILOMETRAJE" && <Gauge className="size-3.5" />}
                    {c.tipoCriterio === "HORAS_USO" && <Hourglass className="size-3.5" />}
                    <span>{c.tipoCriterio}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {c.tipoCriterio === "TIEMPO" && `Próx: ${c.proximaFecha ?? "Sin fecha"}`}
                    {c.tipoCriterio === "KILOMETRAJE" && `Próx: ${c.proximoValorUso?.toLocaleString() ?? 0} km`}
                    {c.tipoCriterio === "HORAS_USO" && `Próx: ${c.proximoValorUso?.toLocaleString() ?? 0} hrs`}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Inputs de evaluación */}
        <div className="space-y-3.5 py-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="fechaActual" className="text-[11.5px] font-medium">
                Fecha de evaluación
              </Label>
              <Input
                id="fechaActual"
                type="date"
                value={fechaActual}
                onChange={(e) => setFechaActual(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>

            {programacion.criterios.some((c) => c.tipoCriterio === "KILOMETRAJE" && c.activo) && (
              <div>
                <Label htmlFor="kilometrajeActual" className="text-[11.5px] font-medium">
                  Kilometraje actual (km)
                </Label>
                <Input
                  id="kilometrajeActual"
                  type="number"
                  placeholder="Auto odómetro..."
                  value={kilometrajeActual}
                  onChange={(e) => setKilometrajeActual(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}

            {programacion.criterios.some((c) => c.tipoCriterio === "HORAS_USO" && c.activo) && (
              <div>
                <Label htmlFor="horasUsoActual" className="text-[11.5px] font-medium">
                  Horas de uso actuales (hrs)
                </Label>
                <Input
                  id="horasUsoActual"
                  type="number"
                  placeholder="Auto horómetro..."
                  value={horasUsoActual}
                  onChange={(e) => setHorasUsoActual(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[11.5px] text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={forzarGeneracion}
              onChange={(e) => setForzarGeneracion(e.target.checked)}
              className="rounded border-border text-primary size-3.5"
            />
            <span>Forzar generación de solicitud aunque aún no se alcancen los umbrales</span>
          </label>
        </div>

        {/* Panel de Resultado */}
        {resultado && (
          <div
            className={`rounded-xl border p-3.5 text-xs transition-all ${
              resultado.solicitudGenerada
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : resultado.yaExistiaSolicitudAbierta
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {resultado.solicitudGenerada ? (
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-sm">
                  {resultado.solicitudGenerada
                    ? `¡Solicitud ${resultado.solicitudNumero} generada con éxito!`
                    : resultado.cumpleCriterio
                    ? "Criterio alcanzado"
                    : "Condiciones no cumplidas"}
                </div>
                <p className="text-[11.5px] leading-relaxed opacity-90">{resultado.mensaje}</p>
                {resultado.motivoDisparo && (
                  <div className="text-[11px] opacity-80 pt-1">
                    <strong>Motivo:</strong> {resultado.motivoDisparo}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-8 text-xs cursor-pointer">
            Cerrar
          </Button>
          <Button
            size="sm"
            onClick={handleEvaluar}
            disabled={evaluarMutation.isPending}
            className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
          >
            <Play className="size-3.5 fill-current" />
            <span>{evaluarMutation.isPending ? "Evaluando..." : "Ejecutar Evaluación"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
