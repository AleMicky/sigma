import { CalendarClock, FileCheck, FileText } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type TipoDocumentoStatsProps = {
  totalCount?: number
  vencimientoCount?: number
  permanenteCount?: number
  isLoading?: boolean
}

export function TipoDocumentoStats({
  totalCount = 0,
  vencimientoCount = 0,
  permanenteCount = 0,
  isLoading = false,
}: TipoDocumentoStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Document Types */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Total
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
          <FileText className="size-3.5" />
        </div>
      </div>

      {/* Expiration Required */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Con Vencimiento
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {vencimientoCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <CalendarClock className="size-3.5" />
        </div>
      </div>

      {/* Permanent */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Permanentes
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {permanenteCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <FileCheck className="size-3.5" />
        </div>
      </div>
    </div>
  )
}
