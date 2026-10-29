import { Badge } from "@/shared/components/ui/badge"
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

  let badgeVariant = "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/30"

  if (norm.includes("SALIDA") || norm.includes("REGISTRAD") || norm.includes("INICIAD")) {
    badgeVariant = "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-medium"
  } else if (norm.includes("LLEGAD") || norm.includes("FINALIZ") || norm.includes("COMPLET")) {
    badgeVariant = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-medium"
  } else if (norm.includes("CANCEL") || norm.includes("RECHAZ") || norm.includes("ANULAD")) {
    badgeVariant = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-medium"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border tracking-wide transition-all",
        badgeVariant,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full animate-pulse", {
          "bg-blue-500": norm.includes("SALIDA") || norm.includes("REGISTRAD") || norm.includes("INICIAD"),
          "bg-emerald-500": norm.includes("LLEGAD") || norm.includes("FINALIZ") || norm.includes("COMPLET"),
          "bg-rose-500": norm.includes("CANCEL"),
          "bg-slate-500": !norm.includes("SALIDA") && !norm.includes("REGISTRAD") && !norm.includes("LLEGAD") && !norm.includes("FINALIZ") && !norm.includes("CANCEL"),
        })}
      />
      {status}
    </Badge>
  )
}
