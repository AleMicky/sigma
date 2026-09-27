import { Link } from "@tanstack/react-router"
import { ArrowLeft, CarFront, ChevronRight } from "lucide-react"

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
    <header className="space-y-1">
      {/* Breadcrumb de navegación */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Link
          to={routes.gestionVehicular.solicitudes}
          className="hover:text-foreground transition-colors font-medium"
        >
          Gestión Vehicular
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
        <Link
          to={routes.gestionVehicular.solicitudes}
          className="hover:text-foreground transition-colors font-medium"
        >
          Solicitudes
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
        <span className="text-foreground font-semibold truncate">
          {isEditing ? `Editar #${numero || ""}` : "Nueva Solicitud"}
        </span>
      </nav>

      {/* Título principal con ícono y estado */}
      <div className="flex items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Button
            variant="outline"
            size="icon-xs"
            render={<Link to={routes.gestionVehicular.solicitudes} />}
            aria-label="Volver a solicitudes"
            className="shrink-0 rounded-lg shadow-2xs hover:bg-muted cursor-pointer size-7"
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
              <CarFront className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                  {isEditing
                    ? `Editar Solicitud ${numero ? `#${numero}` : ""}`
                    : "Nueva Solicitud Vehicular"}
                </h1>
                {estado ? (
                  <WorkflowStatusBadge status={estado} size="sm" />
                ) : (
                  <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60">
                    Borrador Inicial
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
