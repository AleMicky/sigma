import { Plus } from "lucide-react"

import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type ActivoHeaderProps = {
  totalActivos?: number
  onCreate: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  queries?: QueryLike | QueryLike[]
}

export function ActivoHeader({
  totalActivos,
  onCreate,
  onRefresh,
  isRefreshing,
  queries,
}: ActivoHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
      <div className="min-w-0 flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Registro de Activos
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
            <Button
              size="sm"
              type="button"
              onClick={onCreate}
              className="shrink-0"
            >
              <Plus className="size-4" />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Inventario completo y gestión centralizada de activos de la institución.
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
        <RefreshButton
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          queries={queries}
        />
        <Button
          size="sm"
          type="button"
          onClick={onCreate}
          className="shadow-xs font-medium"
        >
          <Plus className="size-4" />
          Nuevo Activo
        </Button>
      </div>
    </header>
  )
}
