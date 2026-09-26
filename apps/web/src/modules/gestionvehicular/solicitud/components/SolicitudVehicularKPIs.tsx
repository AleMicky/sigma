import { CheckCircle2, Clock, FileText, Play } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

export type SolicitudVehicularKPIStats = {
  total: number
  pendientes: number
  aprobadas: number
  enCurso: number
}

type SolicitudVehicularKPIsProps = {
  stats: SolicitudVehicularKPIStats
  isLoading?: boolean
}

export function SolicitudVehicularKPIs({
  stats,
  isLoading = false,
}: SolicitudVehicularKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {/* Total Solicitudes */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Solicitudes
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-foreground mt-0.5">
              {stats.total}
            </p>
          )}
        </div>
      </div>

      {/* Pendientes */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs">
          <Clock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pendientes
            </p>
            <span className="size-1 rounded-full bg-blue-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-blue-600 dark:text-blue-400 mt-0.5">
              {stats.pendientes}
            </p>
          )}
        </div>
      </div>

      {/* Aprobadas */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Aprobadas
            </p>
            <span className="size-1 rounded-full bg-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.aprobadas}
            </p>
          )}
        </div>
      </div>

      {/* En Curso / Viaje */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2.5 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-2xs">
          <Play className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              En Curso
            </p>
            <span className="size-1 rounded-full bg-sky-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-sky-600 dark:text-sky-400 mt-0.5">
              {stats.enCurso}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
