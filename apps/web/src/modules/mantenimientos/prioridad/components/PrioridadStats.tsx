import { AlertCircle, ShieldAlert } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type PrioridadStatsProps = {
  totalCount?: number
  criticaCount?: number
  isLoading: boolean
}

export function PrioridadStats({
  totalCount = 0,
  criticaCount = 0,
  isLoading,
}: PrioridadStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Card */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <AlertCircle className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Total Prioridades
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mt-0.5" />
          ) : (
            <p className="font-heading text-lg font-bold text-foreground">
              {totalCount}
            </p>
          )}
        </div>
      </div>

      {/* Critical Priorities Count Card */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Niveles de Alta Urgencia (4-5)
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mt-0.5" />
          ) : (
            <p className="font-heading text-lg font-bold text-rose-600 dark:text-rose-400">
              {criticaCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
