import { Car, Plus, ShieldCheck } from "lucide-react"

import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type ConductoresHeaderProps = {
  isRefreshing: boolean
  onRefresh: () => void
  onOpenCreate: () => void
}

export function ConductoresHeader({
  isRefreshing,
  onRefresh,
  onOpenCreate,
}: ConductoresHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Título & Contexto */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
          <Car className="size-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Conductores
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <ShieldCheck className="size-3" />
              Gestión Vehicular
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Control de licencias, categorías y asignaciones del parque automotor
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <RefreshButton
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          className="h-8 w-8 rounded-lg px-0"
          iconClassName="size-3.5"
        />
        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-8 flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-3.5" />
          <span>Nuevo Conductor</span>
        </Button>
      </div>
    </div>
  )
}

