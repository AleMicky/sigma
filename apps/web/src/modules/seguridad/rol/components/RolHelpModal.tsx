import {
  BookOpen,
  CheckCircle2,
  Info,
  KeyRound,
  RefreshCw,
  Shield,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type RolHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolHelpModal({ open, onOpenChange }: RolHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Guía de Roles y Permisos
              </DialogTitle>
              <DialogDescription className="text-xs">
                Arquitectura de roles en SIGMA y sincronización con Keycloak
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 text-sm max-h-[70vh] overflow-y-auto pr-1">
          {/* Introducción */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed text-foreground">
            <p className="flex items-start gap-2">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Los roles representan perfiles de acceso y permisos dentro de
                SIGMA. La fuente de verdad de los roles es el servidor de identidades
                <strong> Keycloak</strong>.
              </span>
            </p>
          </div>

          {/* Cómo Funciona la Sincronización */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3.5">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
              <RefreshCw className="size-3.5 text-primary" />
              ¿Cómo funciona la sincronización?
            </span>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Al pulsar <strong>&ldquo;Sincronizar con Keycloak&rdquo;</strong>, SIGMA
                  consulta el endpoint <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">/admin/realms/sigma/roles</code>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Si el rol ya existe en SIGMA (coincidencia por <em>Keycloak Role ID</em> o <em>Código</em>), se actualiza su nombre y descripción.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Si el rol es nuevo en Keycloak, se registra automáticamente en la base de datos local de SIGMA.
                </span>
              </li>
            </ul>
          </div>

          {/* Creación de Roles en Keycloak */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-border/80 bg-card p-3.5">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
              <Shield className="size-3.5 text-amber-500" />
              ¿Cómo crear un nuevo rol?
            </span>
            <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
              <li>
                Accede a la consola de administración de <strong>Keycloak</strong> en el Realm <code>sigma</code>.
              </li>
              <li>
                Ve al menú lateral <strong>Realm roles</strong> y pulsa en <strong>Create role</strong>.
              </li>
              <li>
                Ingresa el nombre del rol en mayúsculas (por ejemplo: <code>OPERADOR</code>, <code>SUPERVISOR</code>, <code>TECNICO</code>).
              </li>
              <li>
                Guarda los cambios en Keycloak y regresa a SIGMA para presionar <strong>Sincronizar con Keycloak</strong>.
              </li>
            </ol>
          </div>

          {/* Roles en Spring Security */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-primary" />
              Uso en el Backend:
            </span>
            <p>
              En los controladores del backend, los endpoints se protegen utilizando anotaciones como <code className="bg-background border border-border/60 px-1 py-0.5 rounded font-mono text-[11px]">@PreAuthorize(&quot;hasAnyRole(&apos;ADMIN&apos;, &apos;OPERADOR&apos;)&quot;)</code>.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
