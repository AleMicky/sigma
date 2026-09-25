import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

type ConductorKPIsProps = {
  totalCount?: number
  activosCount?: number
  porVencerCount?: number
  vencidasCount?: number
  isLoading?: boolean
}

export function ConductorKPIs({
  totalCount = 0,
  activosCount = 0,
  porVencerCount = 0,
  vencidasCount = 0,
  isLoading = false,
}: ConductorKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {/* Total Conductores */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
          <Users className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-foreground mt-0.5">
              {totalCount}
            </p>
          )}
        </div>
      </div>

      {/* Habilitados / Activos */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <ShieldCheck className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Habilitados
            </p>
            <span className="size-1 rounded-full bg-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activosCount}
            </p>
          )}
        </div>
      </div>

      {/* Por Vencer (30 días) */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border px-3 py-2 shadow-2xs backdrop-blur-xs transition-colors",
          porVencerCount > 0
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border/60 bg-card/60"
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
          <Clock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Por Vencer (≤30d)
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-amber-600 dark:text-amber-400 mt-0.5">
              {porVencerCount}
            </p>
          )}
        </div>
      </div>

      {/* Vencidas */}
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border px-3 py-2 shadow-2xs backdrop-blur-xs transition-colors",
          vencidasCount > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-border/60 bg-card/60"
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive shadow-2xs">
          <AlertTriangle className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vencidas
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-destructive mt-0.5">
              {vencidasCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

