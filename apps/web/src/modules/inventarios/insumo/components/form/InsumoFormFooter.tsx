import { Link } from "@tanstack/react-router"
import { Check, Loader2, X } from "lucide-react"

import { routes } from "@/app/config/routes"
import { Button } from "@/shared/components/ui/button"

type InsumoFormFooterProps = {
  isSubmitting: boolean
  canSubmit: boolean
  isEditing: boolean
}

export function InsumoFormFooter({
  isSubmitting,
  canSubmit,
  isEditing,
}: InsumoFormFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border/60 py-4">
      <Button
        type="button"
        variant="outline"
        render={<Link to={routes.inventarios.root} />}
        disabled={isSubmitting}
        className="rounded-xl px-4 text-xs font-medium"
      >
        <X className="size-3.5" />
        Cancelar
      </Button>

      <Button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="gap-2 rounded-xl px-5 text-xs font-medium shadow-sm transition-all hover:shadow-md"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Guardando…</span>
          </>
        ) : (
          <>
            <Check className="size-4" />
            <span>{isEditing ? "Guardar Cambios" : "Crear Insumo"}</span>
          </>
        )}
      </Button>
    </div>
  )
}
