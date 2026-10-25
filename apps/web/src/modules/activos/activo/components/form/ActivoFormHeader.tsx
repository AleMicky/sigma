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
    <header className="flex shrink-0 flex-col gap-3 border-b pb-3 sm:pb-4 pt-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon-sm"
            render={<Link to={routes.activos.root} />}
            aria-label="Volver a activos"
            className="shrink-0 rounded-lg shadow-xs hover:bg-accent transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              {isEditing ? (
                <Box className="size-4.5 sm:size-5" />
              ) : (
                <PackagePlus className="size-4.5 sm:size-5" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isEditing ? "Editar Activo" : "Nuevo Activo"}
                </h1>
                {isEditing && codigo ? (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                    {codigo}
                  </span>
                ) : null}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {isEditing
                  ? "Actualiza la información técnica, ubicación y atributos del activo."
                  : "Completa la ficha técnica para registrar un nuevo activo en el inventario."}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link to={routes.activos.listarActivos} />}
            className="text-xs"
          >
            Volver al listado
          </Button>
        </div>
      </div>
    </header>
  )
}
