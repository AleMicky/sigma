import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"
import { cn } from "@/shared/lib/utils"

interface SalidaVehicularStatusBadgeProps {
  status: string
  className?: string
}

export function SalidaVehicularStatusBadge({
  status,
  className,
}: SalidaVehicularStatusBadgeProps) {
  const norm = status?.toUpperCase() ?? "DESCONOCIDO"

  let variant: StatusBadgeVariant = "neutral"
  if (norm.includes("SALIDA") || norm.includes("REGISTRAD") || norm.includes("INICIAD")) {
    variant = "info"
  } else if (norm.includes("LLEGAD") || norm.includes("FINALIZ") || norm.includes("COMPLET")) {
    variant = "success"
  } else if (norm.includes("CANCEL") || norm.includes("RECHAZ") || norm.includes("ANULAD")) {
    variant = "danger"
  }

  return (
    <StatusBadge
      variant={variant}
      size="md"
      pulse={variant === "info"}
      className={cn("tracking-wide", className)}
    >
      {status}
    </StatusBadge>
  )
}
