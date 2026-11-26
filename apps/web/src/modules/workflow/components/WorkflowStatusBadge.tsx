import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  ShieldCheck,
} from "lucide-react"
import type { ReactNode } from "react"

import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"
import { cn } from "@/shared/lib/utils"

export type WorkflowStatusBadgeProps = {
  status: string
  label?: string
  className?: string
  size?: "sm" | "md" | "lg"
  withIcon?: boolean
}

type StatusAppearance = {
  variant: StatusBadgeVariant
  icon: ReactNode
}

function resolveAppearance(normalized: string): StatusAppearance {
  if (normalized.includes("BORRADOR") || normalized === "DRAFT") {
    return {
      variant: "neutral",
      icon: <FileText className="size-3 text-muted-foreground" />,
    }
  }
  if (
    normalized.includes("PENDIENTE") ||
    normalized.includes("ENVIAD") ||
    normalized.includes("EN_APROBACION")
  ) {
    return { variant: "info", icon: <Clock className="size-3 text-info" /> }
  }
  if (
    normalized.includes("REVISION") ||
    normalized.includes("SUPERVISOR") ||
    normalized.includes("VALIDACION")
  ) {
    return {
      variant: "indigo",
      icon: <ShieldCheck className="size-3 text-chart-4" />,
    }
  }
  if (normalized.includes("OBSERVAD") || normalized.includes("CORREG")) {
    return {
      variant: "warning",
      icon: <AlertCircle className="size-3 text-warning" />,
    }
  }
  if (
    normalized.includes("APROBAD") ||
    normalized.includes("ACEPTAD") ||
    normalized.includes("COMPLETAD")
  ) {
    return {
      variant: "success",
      icon: <CheckCircle2 className="size-3 text-success" />,
    }
  }
  if (
    normalized.includes("RETORNO") ||
    normalized.includes("EN_CURSO") ||
    normalized.includes("VIAJE") ||
    normalized.includes("RUTA")
  ) {
    return { variant: "warning", icon: <Play className="size-3 text-warning" /> }
  }
  if (normalized.includes("PROCESO") || normalized.includes("EJECUCION")) {
    return { variant: "info", icon: <Play className="size-3 text-info" /> }
  }
  if (normalized.includes("RECHAZAD") || normalized.includes("CANCELAD")) {
    return {
      variant: "danger",
      icon: <AlertOctagon className="size-3 text-destructive" />,
    }
  }
  return { variant: "neutral", icon: <Clock className="size-3 text-muted-foreground" /> }
}

export function WorkflowStatusBadge({
  status,
  label,
  className,
  size = "md",
  withIcon = true,
}: WorkflowStatusBadgeProps) {
  const normalized = (status ?? "").toUpperCase().trim()
  const { variant, icon } = resolveAppearance(normalized)

  return (
    <StatusBadge
      variant={variant}
      size={size}
      dot={false}
      icon={withIcon ? icon : undefined}
      className={cn("rounded-md font-medium", className)}
    >
      {label ?? status}
    </StatusBadge>
  )
}
