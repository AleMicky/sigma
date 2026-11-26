import { cn } from "@/shared/lib/utils"
import type { TipoUbicacion } from "../api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "../lib/tipo-ubicacion.config"

type TipoUbicacionBadgeProps = {
  tipo: TipoUbicacion
  showIcon?: boolean
  className?: string
}

export function TipoUbicacionBadge({
  tipo,
  showIcon = true,
  className,
}: TipoUbicacionBadgeProps) {
  const config = TIPO_UBICACION_CONFIG[tipo] || TIPO_UBICACION_CONFIG.OTRO
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors shrink-0",
        config.badgeClass,
        className,
      )}
    >
      {showIcon ? <Icon className="size-3.5 shrink-0" /> : null}
      <span>{config.label}</span>
    </span>
  )
}
