import { CheckCircle2, Clock, FileText, Wrench } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

type SolicitudStatsProps = {
  totalCount?: number
  borradorCount?: number
  enProcesoCount?: number
  finalizadoCount?: number
  isLoading?: boolean
  activeStatus?: string
  onSelectStatus?: (status: string) => void
}

export function SolicitudStats({
  totalCount = 0,
  borradorCount = 0,
  enProcesoCount = 0,
  finalizadoCount = 0,
  isLoading = false,
  activeStatus = "",
  onSelectStatus,
}: SolicitudStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs"
          >
            <Skeleton className="size-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const isAllActive = !activeStatus
  const isBorradorActive = activeStatus === "borrador" || activeStatus === "solicitado"
  const isEnProcesoActive = activeStatus === "en_proceso" || activeStatus === "aprobado"
  const isFinalizadoActive = activeStatus === "finalizado"

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {/* Total */}
      <button
        type="button"
        onClick={() => onSelectStatus?.("")}
        className={cn(
          "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          isAllActive
            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
            : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            isAllActive
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-primary/10 text-primary",
          )}
        >
          <FileText className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Solicitudes
          </p>
          <p className="font-heading text-base font-bold tracking-tight text-foreground">
            {totalCount}
          </p>
        </div>
      </button>

      {/* Borrador / Pendientes */}
      <button
        type="button"
        onClick={() => onSelectStatus?.(isBorradorActive ? "" : "borrador")}
        className={cn(
          "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          isBorradorActive
            ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
            : "border-border/70 bg-card hover:border-amber-500/30 hover:bg-amber-500/5",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            isBorradorActive
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          )}
        >
          <Clock className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Pendientes
          </p>
          <p className="font-heading text-base font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {borradorCount}
          </p>
        </div>
      </button>

      {/* En Proceso */}
      <button
        type="button"
        onClick={() => onSelectStatus?.(isEnProcesoActive ? "" : "en_proceso")}
        className={cn(
          "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          isEnProcesoActive
            ? "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30"
            : "border-border/70 bg-card hover:border-blue-500/30 hover:bg-blue-500/5",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            isEnProcesoActive
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
          )}
        >
          <Wrench className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            En Proceso
          </p>
          <p className="font-heading text-base font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {enProcesoCount}
          </p>
        </div>
      </button>

      {/* Finalizadas */}
      <button
        type="button"
        onClick={() => onSelectStatus?.(isFinalizadoActive ? "" : "finalizado")}
        className={cn(
          "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer",
          isFinalizadoActive
            ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
            : "border-border/70 bg-card hover:border-emerald-500/30 hover:bg-emerald-500/5",
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            isFinalizadoActive
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          )}
        >
          <CheckCircle2 className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Finalizadas
          </p>
          <p className="font-heading text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {finalizadoCount}
          </p>
        </div>
      </button>
    </div>
  )
}
