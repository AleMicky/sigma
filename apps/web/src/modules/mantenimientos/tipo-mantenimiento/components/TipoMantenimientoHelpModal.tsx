import { CheckCircle2, HelpCircle, Wrench } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type TipoMantenimientoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TipoMantenimientoHelpModal({
  open,
  onOpenChange,
}: TipoMantenimientoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <DialogTitle className="text-base font-heading">
              Guía de Tipos de Mantenimiento
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Conceptos y recomendaciones para la parametrización de tipos de mantenimiento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs py-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <Wrench className="size-4 text-primary" />
              ¿Qué es un Tipo de Mantenimiento?
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Es la clasificación estándar de las intervenciones u órdenes de trabajo aplicadas a los activos (por ejemplo: Preventivo, Correctivo, Predictivo, Calibración, Inspección).
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
            <h4 className="font-semibold text-foreground">Tipos Recomendados</h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">PREVENTIVO:</strong> Mantenimientos programados según intervalo de tiempo o uso para evitar fallos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">CORRECTIVO:</strong> Reparaciones no planificadas ante averías o mal funcionamiento.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className="text-foreground">PREDICTIVO:</strong> Intervenciones basadas en monitoreo de condiciones (vibración, temperatura).</span>
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
