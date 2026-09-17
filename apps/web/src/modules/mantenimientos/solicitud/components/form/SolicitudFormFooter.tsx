import { Link } from "@tanstack/react-router"
import { Check, Loader2, Plus } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Button } from "@/shared/components/ui/button"
import { useSolicitudFormContext } from "../../context/solicitud-form.context"

type SolicitudFormFooterProps = {
  isEditing?: boolean
  isSubmitting?: boolean
}

export function SolicitudFormFooter(props: SolicitudFormFooterProps = {}) {
  const context = useSolicitudFormContext()

  const isEditing = props.isEditing ?? context.isEditing
  const isSubmitting = props.isSubmitting ?? context.isSubmitting

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-5 sm:px-7 rounded-b-2xl">
      <p className="text-xs text-muted-foreground">
        Los campos marcados con{" "}
        <span className="text-destructive font-bold">*</span> son requeridos para la emisión.
      </p>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          render={<Link to={routes.mantenimientos.solicitudes} />}
          className="w-full sm:w-auto text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-9 gap-1.5 px-5 text-xs font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              {isEditing ? (
                <Check className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>{isEditing ? "Guardar Cambios" : "Crear Solicitud"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
