import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors border select-none",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success border-success/25",
        warning: "bg-warning/10 text-warning border-warning/25",
        danger: "bg-destructive/10 text-destructive border-destructive/25",
        info: "bg-info/10 text-info border-info/25",
        indigo: "bg-chart-4/10 text-chart-4 border-chart-4/25",
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

const dotColorMap: Record<StatusBadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  indigo: "bg-chart-4",
  neutral: "bg-muted-foreground/70",
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

  // Success / Positivos / Disponibles
  if (
    normalized.includes("operativ") ||
    normalized.includes("disponibl") ||
    normalized.includes("aprobad") ||
    normalized.includes("activo") ||
    normalized.includes("completad") ||
    normalized.includes("finalizad") ||
    normalized.includes("ejecutad") ||
    normalized.includes("entregad") ||
    normalized.includes("exitos") ||
    normalized === "si" ||
    normalized === "ok"
  ) {
    return "success"
  }

  // Warning / Transición / En Taller / En Proceso
  if (
    normalized.includes("pendient") ||
    normalized.includes("proceso") ||
    normalized.includes("revision") ||
    normalized.includes("espera") ||
    normalized.includes("tramite") ||
    normalized.includes("mantenimiento") ||
    normalized.includes("taller") ||
    normalized.includes("inspeccion")
  ) {
    return "warning"
  }

  // Danger / Críticos / Bajas / Averías
  if (
    normalized.includes("critic") ||
    normalized.includes("falla") ||
    normalized.includes("averi") ||
    normalized.includes("rechazad") ||
    normalized.includes("anulad") ||
    normalized.includes("inactiv") ||
    normalized.includes("bloquead") ||
    normalized.includes("baja") ||
    normalized.includes("desincorporad") ||
    normalized.includes("urgente") ||
    normalized.includes("error") ||
    normalized === "no"
  ) {
    return "danger"
  }

  // Info / Asignados / En Ruta / En Tránsito
  if (
    normalized.includes("programad") ||
    normalized.includes("asignad") ||
    normalized.includes("ruta") ||
    normalized.includes("transit") ||
    normalized.includes("viaje") ||
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
