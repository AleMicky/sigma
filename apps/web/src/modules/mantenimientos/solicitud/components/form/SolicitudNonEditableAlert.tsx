import { Link } from "@tanstack/react-router"
import { AlertTriangle, ArrowLeft } from "lucide-react"

import { routes } from "@/app/config/routes"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

type SolicitudNonEditableAlertProps = {
  estado?: string | null
}

export function SolicitudNonEditableAlert({
  estado,
}: SolicitudNonEditableAlertProps) {
  return (
    <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center gap-4 p-6 rounded-2xl border bg-card shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Solicitud no editable
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta solicitud se encuentra en estado{" "}
            <strong className="text-foreground capitalize">{estado}</strong>. Solo
            se pueden modificar solicitudes en estado <strong>Borrador</strong> u{" "}
            <strong>Observado</strong>.
          </p>
        </div>
        <Button
          type="button"
          render={<Link to={routes.mantenimientos.solicitudes} />}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver a Solicitudes</span>
        </Button>
      </div>
    </PageShell>
  )
}
