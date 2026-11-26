import {
  CheckCircle2,
  Package,
  PowerOff,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

export type ActivoKpiStats = {
  total: number
  operativos: number
  enMantenimiento: number
  deBaja: number
}

type KpiCardProps = {
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
  valueClassName: string
  isLoading: boolean
  isError: boolean
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  isLoading,
  isError,
}: Readonly<KpiCardProps>) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </p>
        {isLoading ? (
          <Skeleton
            className="mt-1 h-6 w-12"
            role="status"
            aria-label={`Cargando ${label}`}
          />
        ) : isError ? (
          <p
            className={cn(
              "text-xl font-bold font-heading",
              valueClassName,
            )}
            aria-label={`${label} no disponible`}
          >
            —
          </p>
        ) : (
          <p className={cn("text-xl font-bold font-heading", valueClassName)}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

type ActivoKpiCardsProps = {
  stats: ActivoKpiStats
  isLoading?: boolean
  isError?: boolean
}

export function ActivoKpiCards({
  stats,
  isLoading = false,
  isError = false,
}: Readonly<ActivoKpiCardsProps>) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1"
      aria-busy={isLoading}
    >
      <KpiCard
        label="Total Activos"
        value={stats.total}
        icon={Package}
        iconClassName="bg-primary/10 text-primary"
        valueClassName="text-foreground"
        isLoading={isLoading}
        isError={isError}
      />
      <KpiCard
        label="Operativos"
        value={stats.operativos}
        icon={CheckCircle2}
        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        valueClassName="text-emerald-600 dark:text-emerald-400"
        isLoading={isLoading}
        isError={isError}
      />
      <KpiCard
        label="En Mantenimiento"
        value={stats.enMantenimiento}
        icon={Wrench}
        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        valueClassName="text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
        isError={isError}
      />
      <KpiCard
        label="De Baja"
        value={stats.deBaja}
        icon={PowerOff}
        iconClassName="bg-muted text-muted-foreground"
        valueClassName="text-muted-foreground"
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  )
}
