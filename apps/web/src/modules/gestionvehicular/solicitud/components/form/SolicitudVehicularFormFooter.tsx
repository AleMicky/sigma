import { Link } from "@tanstack/react-router"
import { Check, Loader2, Plus, X } from "lucide-react"

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-muted/30 p-3 sm:px-4 rounded-b-xl border-t border-border/40">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="flex size-1.5 rounded-full bg-primary animate-pulse" />
        <span>
          Campos con <strong className="text-destructive">*</strong> obligatorios.
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          render={<Link to={routes.gestionVehicular.solicitudes} />}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-8 text-xs font-medium cursor-pointer rounded-lg"
        >
          <X className="size-3 mr-1" />
          <span>Cancelar</span>
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-8 gap-1.5 px-4 text-xs font-semibold shadow-xs cursor-pointer rounded-lg transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              {isEditing ? (
                <Check className="size-3" />
              ) : (
                <Plus className="size-3" />
              )}
              <span>{isEditing ? "Guardar Cambios" : "Registrar Solicitud"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
