import { Link } from "@tanstack/react-router"
import { ArrowLeft, Wrench } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useSolicitudFormContext } from "../../context/solicitud-form.context"
import { getEstadoBadgeVariant } from "../../lib/solicitud.utils"

type SolicitudFormHeaderProps = {
  isEditing?: boolean
  numero?: string | null
  estado?: string | null
}

export function SolicitudFormHeader(props: SolicitudFormHeaderProps = {}) {
  const context = useSolicitudFormContext()

  const isEditing = props.isEditing ?? context.isEditing
  const numero = props.numero ?? context.solicitud?.numero
  const estado = props.estado ?? context.solicitud?.estado

  return (
    <header className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link to={routes.mantenimientos.solicitudes} />}
          aria-label="Volver a solicitudes"
          className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                {isEditing
                  ? `Editar Solicitud ${numero ? `#${numero}` : ""}`
                  : "Nueva Solicitud"}
              </h1>
              {estado ? (
                <Badge variant={getEstadoBadgeVariant(estado)}>
                  {estado}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isEditing
                ? "Actualiza los datos técnicos y requerimientos de esta solicitud."
                : "Completa la información técnica para registrar una nueva solicitud de mantenimiento."}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
