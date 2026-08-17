import { Tags, Wrench } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type TipoMantenimientoStatsProps = {
  totalCount?: number
  isLoading: boolean
}

export function TipoMantenimientoStats({
  totalCount = 0,
  isLoading,
}: TipoMantenimientoStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total Card */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wrench className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Total Tipos Registrados
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

      {/* Catalog Info Card */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-2xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Tags className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Estado de Catálogo
          </p>
          <p className="font-heading text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            Activo & Parametrizado
          </p>
        </div>
      </div>
    </div>
  )
}
