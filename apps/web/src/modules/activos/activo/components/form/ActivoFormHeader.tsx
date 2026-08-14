import { Link } from "@tanstack/react-router"
import { ArrowLeft, Box, PackagePlus } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Button } from "@/shared/components/ui/button"

type ActivoFormHeaderProps = {
  isEditing: boolean
  codigo?: string
}

export function ActivoFormHeader({ isEditing, codigo }: ActivoFormHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-4 border-b py-4 sm:py-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          render={<Link to={routes.activos.root} />}
          aria-label="Volver a activos"
          className="shrink-0 rounded-lg shadow-xs hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isEditing ? (
              <Box className="size-5" />
            ) : (
              <PackagePlus className="size-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {isEditing ? `Editar Activo: ${codigo || ""}` : "Nuevo Activo"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {isEditing
                ? "Actualiza la información básica y los atributos de este activo."
                : "Registra un nuevo activo en el inventario institucional."}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
