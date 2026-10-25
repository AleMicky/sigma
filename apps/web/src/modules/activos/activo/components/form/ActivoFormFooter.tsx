import { Link } from "@tanstack/react-router"

import { routes } from "@/app/config/routes"
import { FormDialogSubmit } from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"

type ActivoFormFooterProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function ActivoFormFooter({ form }: ActivoFormFooterProps) {
  return (
    <div className="w-full py-3.5 px-4 sm:px-6 bg-card border border-border/80 rounded-2xl shadow-xs flex items-center justify-between gap-3 mt-4 transition-all">
      <p className="text-xs text-muted-foreground hidden sm:block">
        Los campos marcados con <span className="text-destructive font-bold">*</span> son requeridos.
      </p>

      <div className="flex items-center gap-2.5 ml-auto">
        <Button
          type="button"
          variant="outline"
          render={<Link to={routes.activos.root} />}
          className="shadow-2xs"
        >
          Cancelar
        </Button>
        <form.Subscribe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selector={(state: any) =>
            [state.canSubmit, state.isSubmitting] as const
          }
        >
          {([canSubmit, isSubmitting]: readonly [boolean, boolean]) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </form.Subscribe>
      </div>
    </div>
  )
}
