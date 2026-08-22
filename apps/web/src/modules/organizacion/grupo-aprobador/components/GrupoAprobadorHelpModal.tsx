import {
  Award,
  Briefcase,
  Building,
  CheckCircle2,
  GitMerge,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type GrupoAprobadorHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GrupoAprobadorHelpModal({
  open,
  onOpenChange,
}: GrupoAprobadorHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold sm:text-lg">
                Guía de Grupos Aprobadores
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Comprende el funcionamiento de los flujos de aprobación y tipos de aprobador.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs text-muted-foreground leading-relaxed">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <GitMerge className="size-4 text-primary" />
              ¿Qué es un Grupo Aprobador?
            </h4>
            <p>
              Un <strong>Grupo Aprobador</strong> define una secuencia ordenada y estructurada de validadores necesarios para autorizar solicitudes, órdenes de mantenimiento, contrataciones o transacciones dentro de la institución.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Tipos de Aprobador Soportados
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <UserCheck className="size-3.5 text-blue-500" />
                  <span>Empleado Específico</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Asigna la aprobación directamente a una persona/funcionario identificado por código.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Briefcase className="size-3.5 text-purple-500" />
                  <span>Cargo Institucional</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  La aprobación recae sobre quien ocupe un cargo (ej. Gerente de Operaciones).
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Building className="size-3.5 text-emerald-500" />
                  <span>Unidad / Área</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  La aprobación se delega a los responsables de un área departamental.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Award className="size-3.5 text-amber-500" />
                  <span>Responsabilidad</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  La aprobación corresponde a quienes ejerzan una función o rol transversal.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              Regla de Ejecución Secuencial
            </h4>
            <p className="text-[11px]">
              Los pasos con menor número de <code>#Orden</code> deben completarse antes de que la solicitud avance al siguiente nivel aprobador.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
