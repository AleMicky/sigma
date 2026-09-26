import { AlertCircle, X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

export function SolicitudVehicularFormErrorBanner() {
  const { formError, setFormError } = useSolicitudVehicularFormContext()

  if (!formError) return null

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive backdrop-blur-xs animate-in fade-in-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircle className="size-4 shrink-0" />
        <p className="font-medium">{formError}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setFormError(null)}
        className="size-6 text-destructive hover:bg-destructive/15 shrink-0"
      >
        <X className="size-3.5" />
        <span className="sr-only">Cerrar error</span>
      </Button>
    </div>
  )
}
