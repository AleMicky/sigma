import {
  AlignLeft,
  FileCheck2,
  FileText,
} from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type TipoSolicitudKPIsProps = {
  totalCount?: number
  conDescripcionCount?: number
  sinDescripcionCount?: number
  isLoading?: boolean
}

export function TipoSolicitudKPIs({
  totalCount = 0,
  conDescripcionCount = 0,
  sinDescripcionCount = 0,
  isLoading = false,
}: TipoSolicitudKPIsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {/* Total Tipos */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Tipos
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-foreground mt-0.5">
              {totalCount}
            </p>
          )}
        </div>
      </div>

      {/* Con Descripción */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2 shadow-2xs">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <FileCheck2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Detallados
            </p>
            <span className="size-1 rounded-full bg-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              {conDescripcionCount}
            </p>
          )}
        </div>
      </div>

      {/* Sin Descripción */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur-xs px-3 py-2 shadow-2xs col-span-2 sm:col-span-1">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-2xs">
          <AlignLeft className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Básicos
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold leading-none tracking-tight text-foreground mt-0.5">
              {sinDescripcionCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
