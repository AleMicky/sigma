import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Mail,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
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
      <DialogContent className="max-w-md sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl">
                Guía del Registro de Personas
              </DialogTitle>
              <DialogDescription className="text-xs">
                Catálogo maestro de personas naturales registradas en el sistema.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <User className="size-4" />
                <span>¿Qué es el Registro de Persona Natural?</span>
              </div>
              <Badge variant="secondary" className="text-[10px] h-4.5 px-2">
                Catálogo Maestro
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Es el padrón centralizado de personas naturales. Almacena la identidad biográfica, documento de identidad (CI, DNI, Pasaporte) y vías de contacto. Es la entidad base para vincular colaboradores como <strong>Empleados</strong> o asignar responsabilidades de bienes.
            </p>
          </div>

          {/* Componentes Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <FileText className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Documento</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Tipo, número y complemento que garantizan la unicidad de la persona.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Mail className="size-3.5 text-purple-600 dark:text-purple-400" />
                <span>Contacto</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Correo electrónico y teléfono para notificaciones y trazabilidad.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Vinculación</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Permite la asignación directa a puestos de trabajo y nómina.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Recomendaciones de captura
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <FileCheck2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">1. Verificación del Documento:</strong> Asegúrate de incluir el complemento si el documento lo requiere (ej. duplicados o extensiones).
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <Users className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">2. Nombres Completos:</strong> Registra nombres y apellidos tal como figuran en el documento de identidad oficial.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

