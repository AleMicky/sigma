import { Briefcase, HelpCircle, Plus } from "lucide-react"

import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type CargosHeaderProps = {
  isRefreshing: boolean
  onRefresh: () => void
  onOpenHelp: () => void
  onOpenCreate: () => void
}

export function CargosHeader({
  isRefreshing,
  onRefresh,
  onOpenHelp,
  onOpenCreate,
}: CargosHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2 text-primary shadow-inner border border-primary/10">
          <Briefcase className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Cargos
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Gestión de puestos y estructura ocupacional
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenHelp}
          title="Ayuda"
          className="h-9 flex items-center gap-1.5 rounded-full px-4 hover:bg-muted/80 transition-colors"
        >
          <HelpCircle className="size-4" />
          <span className="hidden sm:inline">Ayuda</span>
        </Button>
        <RefreshButton
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          className="h-9 w-9 rounded-full px-0"
          iconClassName="size-4"
        />
        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-9 flex items-center gap-1.5 rounded-full px-4 shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary/90 hover:bg-primary"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nuevo Cargo</span>
        </Button>
      </div>
    </div>
  )
}
