import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type PrioridadHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrioridadHelpModal({
  open,
  onOpenChange,
}: PrioridadHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <DialogTitle className="text-base font-heading">
              Guía de Niveles de Prioridad
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Conceptos sobre el nivel de urgencia y tiempos de respuesta en mantenimientos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs py-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="size-4 text-primary" />
              ¿Cómo funcionan los niveles (1 a 5)?
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              El nivel numérico (del 1 al 5) establece el grado de prioridad técnica. A mayor nivel, más urgente es la asignación de recursos y resolución.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
            <h4 className="font-semibold text-foreground">Escala de Severidad</h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Nivel 5 (Crítica):</strong> Falla crítica de activo principal con riesgo de seguridad o paro operativo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Nivel 4 (Alta):</strong> Afectación seria en la operación que requiere pronta intervención.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Nivel 3 (Media):</strong> Atención estándar programada sin parada total del equipo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">Nivel 1-2 (Baja/Muy Baja):</strong> Trabajos menores, mejoras preventivas o tareas diferibles.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" type="button" onClick={() => onOpenChange(false)} className="text-xs">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
