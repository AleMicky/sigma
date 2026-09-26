import { Link } from "@tanstack/react-router"
import { ArrowLeft, CarFront } from "lucide-react"

import { routes } from "@/app/config/routes"
import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { Button } from "@/shared/components/ui/button"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

type SolicitudVehicularFormHeaderProps = {
  isEditing?: boolean
  numero?: string | null
  estado?: string | null
}

export function SolicitudVehicularFormHeader(
  props: SolicitudVehicularFormHeaderProps = {}
) {
  const context = useSolicitudVehicularFormContext()

  const isEditing = props.isEditing ?? context.isEditing
  const numero = props.numero ?? context.solicitud?.numero
  const estado = props.estado ?? context.solicitud?.estado

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link to={routes.gestionVehicular.solicitudes} />}
          aria-label="Volver a solicitudes"
          className="shrink-0 rounded-lg shadow-2xs hover:bg-accent mt-0.5 sm:mt-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 sm:mt-0">
            <CarFront className="size-4 sm:size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
                {isEditing
                  ? `Editar Solicitud ${numero ? `#${numero}` : ""}`
                  : "Nueva Solicitud Vehicular"}
              </h1>
              {estado ? (
                <WorkflowStatusBadge status={estado} size="sm" />
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
              {isEditing
                ? "Actualiza los datos del itinerario, solicitante y motivo de la solicitud."
                : "Registra una nueva solicitud de vehículo para comisiones, viajes o traslados."}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
