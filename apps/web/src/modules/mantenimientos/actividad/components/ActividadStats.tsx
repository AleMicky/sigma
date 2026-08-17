import { CheckSquare, Globe2, Wrench } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type ActividadStatsProps = {
  totalCount?: number
  globalCount?: number
  checklistCount?: number
  isLoading: boolean
}

export function ActividadStats({
  totalCount = 0,
  globalCount = 0,
  checklistCount = 0,
  isLoading,
}: ActividadStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Card */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wrench className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Total Actividades
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

      {/* Global Activities */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Globe2 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Aplica a Todos los Activos
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mt-0.5" />
          ) : (
            <p className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {globalCount}
            </p>
          )}
        </div>
      </div>

      {/* Checklist Required */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <CheckSquare className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Requieren Checklist
          </p>
          {isLoading ? (
            <Skeleton className="h-5 w-12 mt-0.5" />
          ) : (
            <p className="font-heading text-lg font-bold text-blue-600 dark:text-blue-400">
              {checklistCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
