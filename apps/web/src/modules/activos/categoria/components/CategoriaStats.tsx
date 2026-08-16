import { FolderTree, Layers, ListOrdered } from "lucide-react"

import { Skeleton } from "@/shared/components/ui/skeleton"

type CategoriaStatsProps = {
  totalCount?: number
  conDescripcionCount?: number
  maxOrden?: number
  isLoading?: boolean
}

export function CategoriaStats({
  totalCount = 0,
  conDescripcionCount = 0,
  maxOrden = 0,
  isLoading = false,
}: CategoriaStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {/* Total Categories */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Total Categorías
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
          <FolderTree className="size-3.5" />
        </div>
      </div>

      {/* Categories with Description */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Detalladas
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {conDescripcionCount}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Layers className="size-3.5" />
        </div>
      </div>

      {/* Ordering levels */}
      <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/60 px-3 py-2 transition-colors hover:bg-card">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-muted-foreground">
            Niveles de Orden
          </p>
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-8 rounded" />
          ) : (
            <p className="font-heading text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {maxOrden}
            </p>
          )}
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ListOrdered className="size-3.5" />
        </div>
      </div>
    </div>
  )
}
