import {
  Building,
  CheckCircle2,
  HelpCircle,
  Layers,
  Users,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type AreaHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AreaHelpModal({ open, onOpenChange }: AreaHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Estructura de Áreas
            </DialogTitle>
          </div>
          <DialogDescription>
            Recomendaciones para definir departamentos y divisiones en la organización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Building className="size-4" />
              <h4>¿Qué es un Área?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Representa una unidad funcional, departamento o división operativa dentro de la empresa (ej. Tecnología, Finanzas, Operaciones). Permite agrupar al personal y estructurar los activos y responsabilidades.
            </p>
          </div>

          {/* Relación en el Sistema */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Users className="size-3.5 text-primary" />
                <span>Asignación de Personal</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Los colaboradores pertenecen a un área principal que define su centro funcional de trabajo.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Layers className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Custodia y Activos</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Facilita el control de inventarios y activos asignados por departamentos o centros de costo.
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
                <span>Usa códigos cortos en mayúsculas (ej. <strong>TI</strong>, <strong>RRHH</strong>, <strong>ADM</strong>, <strong>MANT</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Utiliza nombres representativos y estandarizados del organigrama oficial.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
