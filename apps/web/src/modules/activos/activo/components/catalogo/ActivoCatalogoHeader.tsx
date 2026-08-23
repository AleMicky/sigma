import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"

interface ActivoCatalogoHeaderProps {
  totalActivos?: number
  onRefresh?: () => void
  isRefreshing?: boolean
  queries?: QueryLike | QueryLike[]
}

export function ActivoCatalogoHeader({
  totalActivos,
  onRefresh,
  isRefreshing,
  queries,
}: ActivoCatalogoHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
      <div className="min-w-0 flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Catálogo de Activos
          </h1>
          {totalActivos !== undefined && (
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {totalActivos}
            </span>
          )}
          <div className="flex items-center gap-1.5 md:hidden ml-auto">
            <RefreshButton
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              queries={queries}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Galería completa de fichas técnicas, especificaciones y estado operativo.
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
        <RefreshButton
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          queries={queries}
        />
      </div>
    </header>
  )
}
