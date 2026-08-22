import {
  Building,
  CheckCircle2,
  HelpCircle,
  UserCheck,
  Users,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type EmpleadoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmpleadoHelpModal({
  open,
  onOpenChange,
}: EmpleadoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Gestión de Empleados
            </DialogTitle>
          </div>
          <DialogDescription>
            Información sobre la vinculación de personal a la estructura institucional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <UserCheck className="size-4" />
              <h4>¿Qué representa un Registro de Empleado?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Es la relación laboral activa que vincula a una <strong>Persona Natural</strong> con un <strong>Área</strong> (departamento) y un <strong>Cargo</strong> (posición) específico, asignándole un código interno de nómina.
            </p>
          </div>

          {/* Componentes Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Building className="size-3.5 text-primary" />
                <span>Área y Cargo</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Determina el departamento operativo y las funciones asignadas al colaborador.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Asignación de Activos</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Permite realizar transferencias, actas de entrega y custodia de bienes institucionales.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Buenas prácticas de registro
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Asegúrate de que la persona esté previamente registrada en el catálogo de Personas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Usa un formato correlativo y estandarizado para los códigos de empleado (ej. <strong>EMP-001</strong>).</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
