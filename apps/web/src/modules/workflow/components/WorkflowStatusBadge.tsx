import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

export type WorkflowStatusBadgeProps = {
  status: string
  label?: string
  className?: string
  size?: "sm" | "md" | "lg"
  withIcon?: boolean
}

export function WorkflowStatusBadge({
  status,
  label,
  className,
  size = "md",
  withIcon = true,
}: WorkflowStatusBadgeProps) {
  const normalized = (status ?? "").toUpperCase().trim()
  const displayLabel = label ?? status

  let icon = <Clock className="size-3" />
  let badgeStyle = "bg-muted text-muted-foreground border-border"

  if (normalized.includes("BORRADOR") || normalized === "DRAFT") {
    icon = <FileText className="size-3 text-muted-foreground" />
    badgeStyle =
      "bg-muted/80 text-muted-foreground border-border/80"
  } else if (
    normalized.includes("PENDIENTE") ||
    normalized.includes("ENVIAD") ||
    normalized.includes("EN_APROBACION")
  ) {
    icon = <Clock className="size-3 text-blue-500 animate-pulse" />
    badgeStyle =
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
  } else if (
    normalized.includes("REVISION") ||
    normalized.includes("SUPERVISOR") ||
    normalized.includes("VALIDACION")
  ) {
    icon = <ShieldCheck className="size-3 text-indigo-500" />
    badgeStyle =
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
  } else if (
    normalized.includes("OBSERVAD") ||
    normalized.includes("CORREG")
  ) {
    icon = <AlertCircle className="size-3 text-amber-500" />
    badgeStyle =
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
  } else if (
    normalized.includes("APROBAD") ||
    normalized.includes("ACEPTAD") ||
    normalized.includes("COMPLETAD")
  ) {
    icon = <CheckCircle2 className="size-3 text-emerald-500" />
    badgeStyle =
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
  } else if (
    normalized.includes("PROCESO") ||
    normalized.includes("EJECUCION")
  ) {
    icon = <Play className="size-3 text-sky-500" />
    badgeStyle =
      "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
  } else if (
    normalized.includes("RECHAZAD") ||
    normalized.includes("CANCELAD")
  ) {
    icon = <AlertOctagon className="size-3 text-rose-500" />
    badgeStyle =
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
  }

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 h-4.5 gap-1",
    md: "text-xs px-2 py-0.5 h-5.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 h-6.5 gap-2 font-semibold",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center font-medium rounded-md border shadow-2xs transition-colors",
        sizeClasses[size],
        badgeStyle,
        className,
      )}
    >
      {withIcon && icon}
      <span className="truncate">{displayLabel}</span>
    </Badge>
  )
}
