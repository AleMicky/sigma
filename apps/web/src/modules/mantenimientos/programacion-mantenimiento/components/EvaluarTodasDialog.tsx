import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Wrench,
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
import { Badge } from "@/shared/components/ui/badge"
import { useEvaluarTodasProgramaciones } from "../api/programacion-mantenimiento.mutations"
import type { BatchEvaluacionProgramacionResponse } from "../api/programacion-mantenimiento.service"

interface EvaluarTodasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EvaluarTodasDialog({ open, onOpenChange }: EvaluarTodasDialogProps) {
  const [resultado, setResultado] = useState<BatchEvaluacionProgramacionResponse | null>(null)
  const evaluarTodasMutation = useEvaluarTodasProgramaciones()

  async function handleEvaluar() {
    setResultado(null)
    const res = await evaluarTodasMutation.mutateAsync()
    setResultado(res)
  }

  function handleClose() {
    setResultado(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header con gradiente sutil */}
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Evaluación en Lote de Mantenimiento Preventivo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Evalúa automáticamente todos los activos y genera las solicitudes preventivas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto">
          {!resultado ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                  <Info className="size-4 shrink-0" />
                  <span>¿Cómo funciona la evaluación en lote?</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  El sistema revisará cada activo con programación preventiva activa, comparando:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    <strong>Criterio por tiempo:</strong> Si la fecha programada ya llegó o venció.
                  </li>
                  <li>
                    <strong>Criterio por odómetro / horómetro:</strong> Si la lectura actual en telemetría alcanzó el valor límite.
                  </li>
                </ul>
                <p className="text-muted-foreground pt-1">
                  Para cada activo que cumpla criterios, se creará de forma segura su <strong>Solicitud de Mantenimiento Preventivo</strong> y se registrará el historial correspondiente.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-foreground block">Control anti-duplicados</span>
                    <span className="text-muted-foreground text-[11px]">
                      Si un activo ya tiene una solicitud preventiva en curso, no se duplicará.
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  Activo
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Tarjetas resumen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl border bg-muted/20 text-center">
                  <span className="text-[11px] text-muted-foreground block">Evaluadas</span>
                  <span className="text-xl font-bold text-foreground">{resultado.totalEvaluadas}</span>
                </div>

                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">Generadas</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {resultado.solicitudesGeneradas}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 text-center">
                  <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium block">Ya abiertas</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {resultado.yaExistiaSolicitudAbierta}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-center">
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium block">Errores</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {resultado.errores}
                  </span>
                </div>
              </div>

              {/* Mensaje global */}
              {resultado.solicitudesGeneradas > 0 ? (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Se generaron exitosamente <strong>{resultado.solicitudesGeneradas}</strong> solicitudes de mantenimiento preventivo.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border text-muted-foreground text-xs">
                  <Info className="size-4 shrink-0 text-muted-foreground" />
                  <span>
                    Todas las programaciones evaluadas se encuentran al día o ya cuentan con una solicitud abierta.
                  </span>
                </div>
              )}

              {/* Lista detallada de solicitudes generadas */}
              {resultado.evaluaciones.filter((e) => e.solicitudGenerada).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Nuevas solicitudes preventivas creadas:
                  </span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-muted/10">
                    {resultado.evaluaciones
                      .filter((e) => e.solicitudGenerada)
                      .map((e) => (
                        <div
                          key={e.programacionId}
                          className="flex items-center justify-between p-2 rounded-lg bg-card border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Wrench className="size-3.5 text-primary" />
                            <span className="font-semibold text-foreground">{e.solicitudNumero}</span>
                            <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600">
                              {e.criterioCumplido ?? "PREVENTIVO"}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground text-[11px] truncate max-w-[200px]">
                            {e.motivoDisparo}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-muted/30 border-t flex items-center justify-between sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs rounded-xl cursor-pointer"
          >
            {resultado ? "Cerrar" : "Cancelar"}
          </Button>

          {!resultado ? (
            <Button
              type="button"
              size="sm"
              onClick={handleEvaluar}
              disabled={evaluarTodasMutation.isPending}
              className="gap-1.5 text-xs rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
            >
              {evaluarTodasMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Evaluando programaciones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Iniciar Evaluación Ahora</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleEvaluar}
              disabled={evaluarTodasMutation.isPending}
              className="gap-1.5 text-xs rounded-xl cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${evaluarTodasMutation.isPending ? "animate-spin" : ""}`} />
              <span>Volver a Evaluar</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
