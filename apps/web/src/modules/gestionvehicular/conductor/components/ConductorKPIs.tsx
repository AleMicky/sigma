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
  selectedEstado?: string
  onSelectEstado?: (estado: string) => void
}

export function ConductorKPIs({
  totalCount = 0,
  activosCount = 0,
  porVencerCount = 0,
  vencidasCount = 0,
  isLoading = false,
  selectedEstado = "",
  onSelectEstado,
}: ConductorKPIsProps) {
  const isActivoSelected = selectedEstado === "ACTIVO"

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Total Conductores */}
      <button
        type="button"
        onClick={() => onSelectEstado?.("")}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer",
          !selectedEstado
            ? "border-primary/40 bg-primary/5 shadow-xs ring-1 ring-primary/20"
            : "border-border/60 bg-card/60 backdrop-blur-xs hover:border-border hover:bg-card/80 hover:shadow-xs"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs group-hover:scale-105 transition-transform">
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
      </button>

      {/* Habilitados / Activos */}
      <button
        type="button"
        onClick={() => onSelectEstado?.(isActivoSelected ? "" : "ACTIVO")}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer",
          isActivoSelected
            ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
            : "border-border/60 bg-card/60 backdrop-blur-xs hover:border-emerald-500/30 hover:bg-card/80 hover:shadow-xs"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:scale-105 transition-transform">
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
      </button>

      {/* Por Vencer (30 días) */}
      <div
        className={cn(
          "relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200",
          porVencerCount > 0
            ? "border-amber-500/30 bg-amber-500/5 shadow-2xs"
            : "border-border/60 bg-card/60 backdrop-blur-xs"
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
          "relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200",
          vencidasCount > 0
            ? "border-destructive/30 bg-destructive/5 shadow-2xs"
            : "border-border/60 bg-card/60 backdrop-blur-xs"
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
