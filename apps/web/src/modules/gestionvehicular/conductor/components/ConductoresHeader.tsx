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
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-2 text-primary shadow-sm border border-primary/15 ring-1 ring-primary/20">
          <Car className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/75">
              Conductores
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3" />
              Gestión Vehicular
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Control de licencias, categorías y asignaciones del parque automotor
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <RefreshButton
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          className="h-9 w-9 rounded-xl px-0"
          iconClassName="size-4"
        />
        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-9 flex items-center gap-2 rounded-xl px-4 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-4" />
          <span>Nuevo Conductor</span>
        </Button>
      </div>
    </div>
  )
}
