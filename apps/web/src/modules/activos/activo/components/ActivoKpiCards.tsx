import { CheckCircle2, Package, PowerOff, Wrench } from "lucide-react"

export type ActivoKpiStats = {
  total: number
  operativos: number
  enMantenimiento: number
  deBaja: number
}

type ActivoKpiCardsProps = {
  stats: ActivoKpiStats
}

export function ActivoKpiCards({ stats }: Readonly<ActivoKpiCardsProps>) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Total Activos
          </p>
          <p className="text-xl font-bold font-heading text-foreground">
            {stats.total}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Operativos
          </p>
          <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {stats.operativos}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Wrench className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            En Mantenimiento
          </p>
          <p className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400">
            {stats.enMantenimiento}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <PowerOff className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            De Baja
          </p>
          <p className="text-xl font-bold font-heading text-muted-foreground">
            {stats.deBaja}
          </p>
        </div>
      </div>
    </div>
  )
}
