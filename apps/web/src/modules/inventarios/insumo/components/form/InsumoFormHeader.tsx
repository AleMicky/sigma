import { Link } from "@tanstack/react-router"
import { ArrowLeft, Package } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Button } from "@/shared/components/ui/button"

type InsumoFormHeaderProps = {
  isEditing: boolean
  insumoName?: string
}

export function InsumoFormHeader({
  isEditing,
  insumoName,
}: InsumoFormHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:py-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link to={routes.inventarios.root} />}
          aria-label="Volver a insumos"
          className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Inventarios / {isEditing ? "Editar Insumo" : "Nuevo Insumo"}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isEditing ? `Editar: ${insumoName || "Insumo"}` : "Registrar Nuevo Insumo"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Actualiza los datos generales y las especificaciones técnicas del insumo."
              : "Completa la información general y los atributos dinámicos según el tipo de insumo seleccionado."}
          </p>
        </div>
      </div>
    </header>
  )
}
