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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link to={routes.mantenimientos.solicitudes} />}
          aria-label="Volver a solicitudes"
          className="shrink-0 rounded-lg shadow-xs hover:bg-accent mt-0.5 sm:mt-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5 sm:mt-0">
            <Wrench className="size-4.5 sm:size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground truncate">
                {isEditing
                  ? `Editar Solicitud ${numero ? `#${numero}` : ""}`
                  : "Nueva Solicitud"}
              </h1>
              {estado ? (
                <Badge variant={getEstadoBadgeVariant(estado)} className="capitalize text-xs shrink-0">
                  {estado.replace(/_/g, " ")}
                </Badge>
              ) : null}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
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
