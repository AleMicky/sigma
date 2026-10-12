import { Link } from "@tanstack/react-router"
import { ArrowLeft, FileQuestion } from "lucide-react"

import { routes } from "@/app/config/routes"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

export function SolicitudVehicularNotFoundAlert() {
  return (
    <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center gap-4 p-6 rounded-2xl border bg-card shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <FileQuestion className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Solicitud no encontrada
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No se pudo encontrar la solicitud vehicular solicitada. Es posible que
            haya sido eliminada o que el identificador sea inválido.
          </p>
        </div>
        <Button
          type="button"
          render={<Link to={routes.gestionVehicular.solicitudes} />}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver a Solicitudes</span>
        </Button>
      </div>
    </PageShell>
  )
}
