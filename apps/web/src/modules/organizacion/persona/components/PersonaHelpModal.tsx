import {
  CheckCircle2,
  FileText,
  HelpCircle,
  Mail,
  User,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type PersonaHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PersonaHelpModal({
  open,
  onOpenChange,
}: PersonaHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía del Registro de Personas
            </DialogTitle>
          </div>
          <DialogDescription>
            Información sobre el catálogo maestro de personas naturales en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <User className="size-4" />
              <h4>¿Qué es el Registro de Persona?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Es el catálogo maestro de personas naturales. Contiene información biográfica, documentos de identidad (CI, Pasaporte) y canales de contacto. Es la entidad base para vincular colaboradores a la nómina de empleados o usuarios del sistema.
            </p>
          </div>

          {/* Relaciones en el Sistema */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <FileText className="size-3.5 text-primary" />
                <span>Identidad Única</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                El tipo y número de documento garantizan la unicidad del registro en el sistema.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Mail className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Canales de Contacto</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Permite registrar correos y teléfonos para notificaciones de mantenimiento y asignaciones.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Buenas prácticas
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Verifica que el número de documento y complemento coincidan con el documento oficial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Registra nombres y apellidos con mayúsculas iniciales y ortografía correcta.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
