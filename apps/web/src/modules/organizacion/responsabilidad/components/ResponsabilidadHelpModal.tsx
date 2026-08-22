import {
  Award,
  CheckCircle2,
  Clock,
  Layers,
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

type ResponsabilidadHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResponsabilidadHelpModal({
  open,
  onOpenChange,
}: ResponsabilidadHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl">
                Guía de Responsabilidades Organizacionales
              </DialogTitle>
              <DialogDescription className="text-xs">
                Asignación de roles transversales, comités y facultades institucionales.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Award className="size-4" />
                <span>¿Qué es una Responsabilidad en Sigma?</span>
              </div>
              <Badge variant="secondary" className="text-[10px] h-4.5 px-2">
                Maestro-Detalle
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Representa una función, rol o encargo temporal o permanente (ej. <em>Líder de Proyecto, Supervisor SSO, Aprobador de Compras</em>) que puede ser asignado a uno o múltiples colaboradores de la institución con periodos de vigencia específicos.
            </p>
          </div>

          {/* Componentes Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Layers className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Catálogo Maestro</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Define el código y nombre del rol institucional en el panel izquierdo.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <UserCheck className="size-3.5 text-purple-600 dark:text-purple-400" />
                <span>Asignación</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Vincula colaboradores específicos mediante búsqueda rápida y autocompletado.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Vigencia</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Permite registrar vigencia indefinida o con fecha límite controlada.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Buenas Prácticas
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <Users className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">Asignaciones Múltiples:</strong> Una misma responsabilidad puede contar con varios empleados asignados de forma simultánea.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-medium">Flujos de Aprobación:</strong> Las responsabilidades asignadas aquí pueden integrarse como pasos en los Grupos Aprobadores institucionales.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
