import type { ReactNode } from "react"
import { AlertCircle, CheckCircle2, Clock, MinusCircle, RefreshCw } from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/shared/components/status-badge"
import { cn } from "@/shared/lib/utils"

import type { EstadoMigracion } from "../api/migracion.service"

interface MigracionStatusBadgeProps {
  estado: EstadoMigracion
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<
  string,
  { variant: StatusBadgeVariant; icon: ReactNode }
> = {
  MIGRADO: {
    variant: "success",
    icon: <CheckCircle2 className="size-3" />,
  },
  ACTUALIZADO: {
    variant: "info",
    icon: <RefreshCw className="size-3" />,
  },
  PENDIENTE: {
    variant: "warning",
    icon: <Clock className="size-3" />,
  },
  OMITIDO: {
    variant: "neutral",
    icon: <MinusCircle className="size-3" />,
  },
  ERROR: {
    variant: "danger",
    icon: <AlertCircle className="size-3" />,
  },
}

export const MigracionStatusBadge = ({
  estado,
  showIcon = true,
  className,
}: MigracionStatusBadgeProps) => {
  const config = statusConfig[estado] ?? {
    variant: "neutral" as const,
    icon: null,
  }

  return (
    <StatusBadge
      variant={config.variant}
      size="sm"
      dot={false}
      icon={showIcon ? config.icon : undefined}
      className={cn("rounded-md font-mono text-[10px] leading-none shrink-0", className)}
    >
      {estado}
    </StatusBadge>
  )
}
