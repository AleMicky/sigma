import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"
import { cn } from "@/shared/lib/utils"

export type IncidenteStatus =
  | "REGISTRADO"
  | "REVISION"
  | "EN_ATENCION"
  | "VALIDACION"
  | "EN_CIERRE"
  | "CERRADO"
  | "RECHAZADO"
  | "CANCELADO"
  | string

interface IncidenteStatusBadgeProps {
  status: IncidenteStatus
  className?: string
}

const statusConfig: Record<
  string,
  { label: string; variant: StatusBadgeVariant }
> = {
  REGISTRADO: { label: "Registrado", variant: "info" },
  REVISION: { label: "En Revisión", variant: "warning" },
  EN_ATENCION: { label: "En Atención", variant: "indigo" },
  VALIDACION: { label: "En Validación", variant: "indigo" },
  EN_CIERRE: { label: "En Cierre", variant: "info" },
  CERRADO: { label: "Cerrado", variant: "success" },
  RECHAZADO: { label: "Rechazado", variant: "danger" },
  CANCELADO: { label: "Cancelado", variant: "neutral" },
}

export function IncidenteStatusBadge({
  status,
  className,
}: IncidenteStatusBadgeProps) {
  const normalized = (status || "REGISTRADO").toUpperCase().trim()
  const config = statusConfig[normalized] ?? {
    label: status || "Desconocido",
    variant: "neutral" as const,
  }

  return (
    <StatusBadge
      variant={config.variant}
      size="md"
      className={cn("font-medium", className)}
    >
      {config.label}
    </StatusBadge>
  )
}
