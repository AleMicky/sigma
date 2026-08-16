import { LayoutGrid, Package } from "lucide-react"

interface ActivoCatalogoHeaderProps {
  totalActivos?: number
  totalTipos?: number
}

export function ActivoCatalogoHeader({
  totalActivos,
  totalTipos,
}: ActivoCatalogoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutGrid className="size-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl text-foreground">
            Catálogo Visual de Activos
          </h1>
          <p className="text-xs text-muted-foreground">
            Galería completa de fichas técnicas, especificaciones y estado operativo.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        {typeof totalActivos === "number" && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-foreground">
            <Package className="size-3.5 text-primary" />
            <span>{totalActivos} activos catalogados</span>
          </span>
        )}
        {typeof totalTipos === "number" && totalTipos > 0 && (
          <span className="hidden sm:inline-flex items-center rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {totalTipos} categorías
          </span>
        )}
      </div>
    </div>
  )
}
