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
    <div className="sticky bottom-0 z-10 w-full py-3 bg-background/95 backdrop-blur-md border-t flex items-center justify-between gap-3 mt-auto">
      <p className="text-xs text-muted-foreground hidden sm:block">
        Los campos marcados con <span className="text-destructive font-bold">*</span> son requeridos.
      </p>

      <div className="flex items-center gap-2.5 ml-auto">
        <Button
          type="button"
          variant="outline"
          render={<Link to={routes.activos.root} />}
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
