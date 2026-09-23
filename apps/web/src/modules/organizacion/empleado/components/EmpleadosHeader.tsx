import { HelpCircle, Plus, UserCheck } from "lucide-react"

import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type EmpleadosHeaderProps = {
  isRefreshing: boolean
  onRefresh: () => void
  onOpenHelp: () => void
  onOpenCreate: () => void
}

export function EmpleadosHeader({
  isRefreshing,
  onRefresh,
  onOpenHelp,
  onOpenCreate,
}: EmpleadosHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2 text-primary shadow-inner border border-primary/10">
          <UserCheck className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Empleados
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Gestión del directorio y perfiles
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
          className="h-9 rounded-full px-4 hover:bg-muted/80 transition-colors"
        >
          <HelpCircle className="size-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Ayuda</span>
        </Button>
        <div className="h-9">
          <RefreshButton isRefreshing={isRefreshing} onRefresh={onRefresh} />
        </div>
        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-9 rounded-full px-4 shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary/90 hover:bg-primary"
        >
          <Plus className="size-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Nuevo Empleado</span>
        </Button>
      </div>
    </div>
  )
}
