import { Link } from "@tanstack/react-router"
import { ArrowLeft, Printer } from "lucide-react"

import { routes } from "@/app/config/routes"
import {
  RefreshButton,
  type QueryLike,
} from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type VehiculoDetailHeaderProps = {
  titulo: string
  onPrint: () => void
  queries?: QueryLike | QueryLike[]
}

export function VehiculoDetailHeader({
  titulo,
  onPrint,
  queries,
}: Readonly<VehiculoDetailHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="outline"
          size="icon-xs"
          render={<Link to={routes.gestionVehicular.vehiculos} />}
          aria-label="Volver al listado de vehículos"
          title="Volver a vehículos"
          className="size-7.5 shrink-0 rounded-lg shadow-2xs hover:bg-accent"
        >
          <ArrowLeft className="size-3.5" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={routes.gestionVehicular.vehiculos}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Vehículos
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs font-bold text-foreground truncate">
            {titulo}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <RefreshButton queries={queries} className="h-8" />

        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
          className="h-8 px-2.5 text-xs font-medium"
          title="Imprimir Ficha del Vehículo"
        >
          <Printer className="size-3.5" />
          <span className="hidden sm:inline">Imprimir Ficha</span>
        </Button>
      </div>
    </div>
  )
}
