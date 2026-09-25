import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors border select-none",
  {
    variants: {
      variant: {
        success:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
        danger:
          "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
        info:
          "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25",
        indigo:
          "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
        neutral:
          "bg-muted/60 text-muted-foreground border-border/60",
      },
      size: {
        sm: "h-5 text-[11px] px-2",
        md: "h-6 text-xs px-2.5",
        lg: "h-7 text-xs px-3 font-bold",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  },
)

const dotColorMap: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  indigo: "bg-indigo-500",
  neutral: "bg-muted-foreground/60",
}

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "indigo"
  | "neutral"

export type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  children: ReactNode
  className?: string
  dot?: boolean
  pulse?: boolean
  icon?: ReactNode
}

/**
 * Normaliza cualquier texto o estado del backend a una variante semántica estándar.
 */
export function resolveStatusVariant(statusText?: string | null): StatusBadgeVariant {
  if (!statusText) return "neutral"
  const normalized = statusText.trim().toLowerCase()

  // Success / Positivos
  if (
    normalized.includes("operativ") ||
    normalized.includes("aprobad") ||
    normalized.includes("activo") ||
    normalized.includes("completad") ||
    normalized.includes("finalizad") ||
    normalized.includes("ejecutad") ||
    normalized.includes("exitos") ||
    normalized === "si" ||
    normalized === "ok"
  ) {
    return "success"
  }

  // Warning / Transición
  if (
    normalized.includes("pendient") ||
    normalized.includes("proceso") ||
    normalized.includes("revision") ||
    normalized.includes("espera") ||
    normalized.includes("tramite") ||
    normalized.includes("mantenimiento")
  ) {
    return "warning"
  }

  // Danger / Críticos
  if (
    normalized.includes("critic") ||
    normalized.includes("falla") ||
    normalized.includes("rechazad") ||
    normalized.includes("anulad") ||
    normalized.includes("inactiv") ||
    normalized.includes("bloquead") ||
    normalized.includes("urgente") ||
    normalized.includes("error") ||
    normalized === "no"
  ) {
    return "danger"
  }

  // Info / Planificado
  if (
    normalized.includes("programad") ||
    normalized.includes("asignad") ||
    normalized.includes("abierto") ||
    normalized.includes("enviad")
  ) {
    return "info"
  }

  return "neutral"
}

export function StatusBadge({
  children,
  variant,
  size = "sm",
  dot = true,
  pulse = false,
  icon,
  className,
}: StatusBadgeProps) {
  const resolvedVariant: StatusBadgeVariant =
    variant || (typeof children === "string" ? resolveStatusVariant(children) : "neutral")

  const dotBg = dotColorMap[resolvedVariant] || dotColorMap.neutral

  return (
    <span className={cn(statusBadgeVariants({ variant: resolvedVariant, size }), className)}>
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : dot ? (
        <span className="relative flex size-1.5 shrink-0">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                dotBg,
              )}
            />
          )}
          <span className={cn("relative inline-flex size-1.5 rounded-full", dotBg)} />
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  )
}
