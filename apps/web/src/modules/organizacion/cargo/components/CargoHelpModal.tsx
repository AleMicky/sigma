import {
  Briefcase,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Users,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type CargoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CargoHelpModal({ open, onOpenChange }: CargoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Estructura de Cargos
            </DialogTitle>
          </div>
          <DialogDescription>
            Recomendaciones para definir y estandarizar los cargos en la organización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Briefcase className="size-4" />
              <h4>¿Qué es un Cargo?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Representa la posición o puesto laboral oficial dentro de la institución. Los cargos definen el rol que desempeñan los empleados y facilitan la asignación de responsabilidades, flujos de aprobación y custodia de activos.
            </p>
          </div>

          {/* Relación con Empleados y Aprobaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Users className="size-3.5 text-primary" />
                <span>Asignación de Personal</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Cada empleado puede vincularse a su cargo oficial para clasificar la nómina y reportes organizacionales.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Grupos Aprobadores</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Permite configurar flujos de firmas y autorizaciones basadas en cargos jerárquicos o directivos.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Buenas prácticas de codificación
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Usa códigos concisos y estandarizados en mayúsculas (ej. <strong>ANALISTA-TI</strong>, <strong>GER-OPER</strong>, <strong>JEFE-MANT</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Mantén los nombres descriptivos y claros sin abreviaciones ambiguas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Documenta las responsabilidades y funciones clave en el campo de descripción.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
