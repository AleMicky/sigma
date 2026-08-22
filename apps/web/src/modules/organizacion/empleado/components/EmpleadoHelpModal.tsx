import {
  Briefcase,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  UserCheck,
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
      <DialogContent className="max-w-md sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl">
                Guía de Gestión de Empleados
              </DialogTitle>
              <DialogDescription className="text-xs">
                Vinculación de personal a la estructura organizacional y asignación de activos.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <UserCheck className="size-4" />
                <span>¿Qué representa un Empleado en Sigma?</span>
              </div>
              <Badge variant="secondary" className="text-[10px] h-4.5 px-2">
                Estructura
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Es la vinculación activa que asocia a una <strong>Persona Natural</strong> con un <strong>Área funcional</strong> y un <strong>Cargo</strong> institucional, asignándole un código interno de nómina para control de custodia y responsabilidades.
            </p>
          </div>

          {/* Componentes Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Building className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Área</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Departamento o división donde presta servicios el colaborador.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Briefcase className="size-3.5 text-purple-600 dark:text-purple-400" />
                <span>Cargo</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Puesto laboral que define las funciones y nivel de responsabilidad.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Custodia</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Habilita la asignación y transferencia directa de activos fijos.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Recomendaciones para el registro
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <Users className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">1. Registrar la Persona primero:</strong> Si el colaborador no aparece en la lista, regístralo previamente en el módulo de Personas.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <FileSpreadsheet className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">2. Formato de Código:</strong> Emplea una nomenclatura clara (ej. <code className="font-mono text-primary font-bold">EMP-001</code>, <code className="font-mono text-primary font-bold">EMP-002</code>) para facilitar reportes y búsquedas.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

