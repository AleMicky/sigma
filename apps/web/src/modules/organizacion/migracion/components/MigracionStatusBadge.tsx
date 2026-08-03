import React from "react"
import { AlertCircle, CheckCircle2, Clock, MinusCircle, RefreshCw } from "lucide-react"

import type { EstadoMigracion } from "../api/migracion.service"
import { cn } from "@/shared/lib/utils"

interface MigracionStatusBadgeProps {
  estado: EstadoMigracion
  showIcon?: boolean
  className?: string
}

export const MigracionStatusBadge: React.FC<MigracionStatusBadgeProps> = ({
  estado,
  showIcon = true,
  className,
}) => {
  switch (estado) {
    case "MIGRADO":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 leading-none",
            className,
          )}
        >
          {showIcon && <CheckCircle2 className="size-3" />}
          MIGRADO
        </span>
      )
    case "ACTUALIZADO":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 shrink-0 leading-none",
            className,
          )}
        >
          {showIcon && <RefreshCw className="size-3" />}
          ACTUALIZADO
        </span>
      )
    case "PENDIENTE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0 leading-none",
            className,
          )}
        >
          {showIcon && <Clock className="size-3" />}
          PENDIENTE
        </span>
      )
    case "OMITIDO":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border shrink-0 leading-none",
            className,
          )}
        >
          {showIcon && <MinusCircle className="size-3" />}
          OMITIDO
        </span>
      )
    case "ERROR":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-destructive/10 text-destructive border border-destructive/20 shrink-0 leading-none",
            className,
          )}
        >
          {showIcon && <AlertCircle className="size-3" />}
          ERROR
        </span>
      )
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border shrink-0 leading-none",
            className,
          )}
        >
          {estado}
        </span>
      )
  }
}
