import {
  CheckCircle2,
  HelpCircle,
  KeyRound,
  RefreshCw,
  UserCheck,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type UsuarioHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsuarioHelpModal({ open, onOpenChange }: UsuarioHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Seguridad y Usuarios
            </DialogTitle>
          </div>
          <DialogDescription>
            Información sobre la sincronización y administración de cuentas con Keycloak IAM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <KeyRound className="size-4" />
              <h4>Identidad Centralizada con Keycloak</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El sistema utiliza <strong>Keycloak Identity and Access Management</strong> como fuente única de verdad para credenciales, autenticación multifactor y contraseñas. Los datos de usuarios locales se mantienen en sincronía para referencias de auditoría, autorizaciones y módulos operacionales.
            </p>
          </div>

          {/* Tarjetas de funcionamiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <RefreshCw className="size-3.5 text-primary" />
                <span>Sincronización Automática</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Al hacer clic en &ldquo;Sincronizar&rdquo;, se importan cuentas nuevas y se actualizan nombres, correos y estado activo desde el Realm de Keycloak.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Estado y Actividad</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Solo los usuarios con estado activo en el proveedor de identidad pueden iniciar sesión y operar en SIGMA.
              </p>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Recomendaciones de administración
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Los cambios de contraseña o restablecimiento de accesos deben realizarse en la consola de Keycloak.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Tras crear o editar un usuario en Keycloak, ejecuta la sincronización para reflejar los cambios en tiempo real.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>La asignación de roles técnicos (ADMIN, OPERADOR, etc.) se gestiona a través de los realm roles de autenticación.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
