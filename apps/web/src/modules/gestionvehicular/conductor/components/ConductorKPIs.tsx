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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Total Conductores */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-3.5 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
          <Users className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Conductores
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-10 rounded-md" />
          ) : (
            <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {totalCount}
            </p>
          )}
        </div>
      </div>

      {/* Habilitados / Activos */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs p-3.5 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <ShieldCheck className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Habilitados
            </p>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-10 rounded-md" />
          ) : (
            <p className="font-heading text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activosCount}
            </p>
          )}
        </div>
      </div>

      {/* Por Vencer (30 días) */}
      <div
        className={cn(
          "flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-2xs backdrop-blur-xs",
          porVencerCount > 0
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border/60 bg-card/60"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
          <Clock className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Por Vencer (≤30d)
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-10 rounded-md" />
          ) : (
            <p className="font-heading text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {porVencerCount}
            </p>
          )}
        </div>
      </div>

      {/* Vencidas */}
      <div
        className={cn(
          "flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-2xs backdrop-blur-xs",
          vencidasCount > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-border/60 bg-card/60"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-2xs">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Licencias Vencidas
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-10 rounded-md" />
          ) : (
            <p className="font-heading text-2xl font-bold tracking-tight text-destructive">
              {vencidasCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
