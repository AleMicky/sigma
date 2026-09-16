import { HelpCircle } from "lucide-react"

import { useSolicitudFormContext } from "../../context/solicitud-form.context"

type SolicitudFormErrorBannerProps = {
  error?: string | null
}

export function SolicitudFormErrorBanner(props: SolicitudFormErrorBannerProps = {}) {
  const context = useSolicitudFormContext()
  const error = props.error ?? context.formError

  if (!error) return null

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
      <HelpCircle className="size-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">Error al procesar el formulario</p>
        <p className="text-xs text-destructive/90 mt-0.5">{error}</p>
      </div>
    </div>
  )
}
