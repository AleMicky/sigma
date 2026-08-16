import { FileText, Paperclip, Tags } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type AccesorioStatsProps = {
  totalCount?: number
  tiposCount?: number
  conDescripcionCount?: number
  isLoading?: boolean
}

export function AccesorioStats({
  totalCount = 0,
  tiposCount = 0,
  conDescripcionCount = 0,
  isLoading = false,
}: AccesorioStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Accesorios */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Total Accesorios
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-foreground">
              {totalCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Paperclip className="size-3.5" />
        </div>
      </div>

      {/* Tipos de Activo Asociados */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Tipos de Activo
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {tiposCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Tags className="size-3.5" />
        </div>
      </div>

      {/* Con Descripción */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Con Descripción
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {conDescripcionCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FileText className="size-3.5" />
        </div>
      </div>
    </div>
  )
}
