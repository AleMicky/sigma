import { AlertCircle, AlertTriangle, ArrowDown, Flame } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import type { PrioridadIncidente } from "../api/incidente.types"

interface IncidentePrioridadBadgeProps {
  prioridad: PrioridadIncidente
  className?: string
}

export function IncidentePrioridadBadge({
  prioridad,
  className,
}: IncidentePrioridadBadgeProps) {
  const norm = (prioridad || "MEDIA").toUpperCase().trim()

  switch (norm) {
    case "CRITICA":
    case "CRÍTICA":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800",
            className
          )}
        >
          <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          Crítica
        </span>
      )
    case "ALTA":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
            className
          )}
        >
          <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          Alta
        </span>
      )
    case "MEDIA":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
            className
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Media
        </span>
      )
    case "BAJA":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
            className
          )}
        >
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          Baja
        </span>
      )
  }
}

