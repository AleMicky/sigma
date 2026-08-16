import { Package, Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

import type { Activo } from "../api/activo.service"
import { ActivoStats } from "./ActivoStats"

type ActivoHeaderProps = {
  totalActivos: number
  totalTipos: number
  activos: Activo[]
  onCreate: () => void
}

export function ActivoHeader({
  totalActivos,
  totalTipos,
  activos,
  onCreate,
}: ActivoHeaderProps) {
  return (
    <header className="flex shrink-0 flex-col gap-3 border-b py-3 sm:py-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="size-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Registro de Activos
            </h1>
            <p className="text-xs text-muted-foreground">
              Inventario completo y gestión centralizada de activos de la institución.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={onCreate}
          className="shrink-0 self-start sm:self-auto shadow-xs font-medium"
        >
          <Plus className="size-3.5" />
          Nuevo Activo
        </Button>
      </div>

      {/* Hero Metrics Row */}
      <ActivoStats
        totalActivos={totalActivos}
        totalTipos={totalTipos}
        activos={activos}
      />
    </header>
  )
}

