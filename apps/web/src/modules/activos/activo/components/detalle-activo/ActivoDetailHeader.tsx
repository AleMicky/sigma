import { Link } from "@tanstack/react-router"
import { ArrowLeft, Edit2, Printer, X } from "lucide-react"

import { routes } from "@/app/config/routes"
import { RefreshButton, type QueryLike } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"

type ActivoDetailHeaderProps = {
  activoId: string
  codigo: string
  isEditing?: boolean
  onToggleEdit?: (editing: boolean) => void
  onPrint: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  queries?: QueryLike | QueryLike[]
}

export function ActivoDetailHeader({
  activoId: _activoId,
  codigo,
  isEditing = false,
  onToggleEdit,
  onPrint,
  onRefresh,
  isRefreshing,
  queries,
}: ActivoDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-xs"
          render={<Link to={routes.activos.catalogo} />}
          aria-label="Volver al catálogo de activos"
          title="Volver al catálogo"
          className="size-7.5 shrink-0 rounded-lg shadow-2xs hover:bg-accent"
        >
          <ArrowLeft className="size-3.5" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to={routes.activos.catalogo}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Catálogo
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs font-bold text-foreground font-mono truncate">
            {codigo}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <RefreshButton
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          queries={queries}
          className="h-8"
        />

        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
          className="h-8 px-2.5 text-xs font-medium"
          title="Imprimir Ficha Técnica"
        >
          <Printer className="size-3.5" />
          <span className="hidden sm:inline">Imprimir Ficha</span>
        </Button>

        {isEditing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleEdit?.(false)}
            className="h-8 px-3 text-xs font-medium gap-1.5"
          >
            <X className="size-3.5" />
            Salir de Edición
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onToggleEdit?.(true)}
            className="h-8 px-3 text-xs font-medium shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            <Edit2 className="size-3.5" />
            Editar Información
          </Button>
        )}
      </div>
    </div>
  )
}
