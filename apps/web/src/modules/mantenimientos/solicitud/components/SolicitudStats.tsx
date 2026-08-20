import { AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type SolicitudStatsProps = {
  totalCount?: number
  borradorCount?: number
  enProcesoCount?: number
  finalizadoCount?: number
  isLoading?: boolean
}

export function SolicitudStats({
  totalCount = 0,
  borradorCount = 0,
  enProcesoCount = 0,
  finalizadoCount = 0,
  isLoading = false,
}: SolicitudStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card/60 p-2.5"
          >
            <Skeleton className="size-8 rounded-md shrink-0" />
            <div className="space-y-1 min-w-0 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {/* Total */}
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card/80 p-2.5 text-card-foreground shadow-2xs">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Total Solicitudes
          </p>
          <p className="font-heading text-sm font-bold tracking-tight">
            {totalCount}
          </p>
        </div>
      </div>

      {/* Borradores / Pendientes */}
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card/80 p-2.5 text-card-foreground shadow-2xs">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Borrador / Pendiente
          </p>
          <p className="font-heading text-sm font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {borradorCount}
          </p>
        </div>
      </div>

      {/* En Proceso */}
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card/80 p-2.5 text-card-foreground shadow-2xs">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <AlertTriangle className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            En Proceso
          </p>
          <p className="font-heading text-sm font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {enProcesoCount}
          </p>
        </div>
      </div>

      {/* Finalizadas */}
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card/80 p-2.5 text-card-foreground shadow-2xs">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
            Finalizadas
          </p>
          <p className="font-heading text-sm font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {finalizadoCount}
          </p>
        </div>
      </div>
    </div>
  )
}
