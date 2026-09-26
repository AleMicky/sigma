import { Link } from "@tanstack/react-router"
import { Check, Loader2, Plus } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Button } from "@/shared/components/ui/button"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

type SolicitudVehicularFormFooterProps = {
  isEditing?: boolean
  isSubmitting?: boolean
}

export function SolicitudVehicularFormFooter(
  props: SolicitudVehicularFormFooterProps = {}
) {
  const context = useSolicitudVehicularFormContext()

  const isEditing = props.isEditing ?? context.isEditing
  const isSubmitting = props.isSubmitting ?? context.isSubmitting

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-3.5 sm:px-5 rounded-b-xl">
      <p className="text-xs text-muted-foreground">
        Los campos marcados con{" "}
        <span className="text-destructive font-bold">*</span> son obligatorios para el registro.
      </p>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          render={<Link to={routes.gestionVehicular.solicitudes} />}
          className="w-full sm:w-auto text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-9 gap-1.5 px-5 text-xs font-semibold shadow-2xs cursor-pointer"
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
