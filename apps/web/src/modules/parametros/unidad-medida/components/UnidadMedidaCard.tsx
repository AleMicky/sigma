import { Calculator, Eye, Hash, MoreVertical, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { UnidadMedida } from "../api/unidad-medida.service"

type UnidadMedidaCardProps = {
  unidadMedida: UnidadMedida
  onEdit: (unidadMedida: UnidadMedida) => void
  onQuickView: (unidadMedida: UnidadMedida) => void
  onDelete: (unidadMedida: UnidadMedida) => void
}

export function UnidadMedidaCard({
  unidadMedida,
  onEdit,
  onQuickView,
  onDelete,
}: UnidadMedidaCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex flex-col justify-between p-4 h-full gap-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary text-base shadow-inner">
              {unidadMedida.simbolo}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-foreground truncate">
                  {unidadMedida.nombre}
                </h3>
              </div>
              <p className="font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {unidadMedida.codigo}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 text-muted-foreground opacity-80 hover:opacity-100"
                />
              }
            >
              <MoreVertical className="size-4" />
              <span className="sr-only">Acciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onQuickView(unidadMedida)}>
                <Eye className="size-4 mr-2" />
                Ver Ficha
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(unidadMedida)}>
                <Pencil className="size-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(unidadMedida)}
              >
                <Trash2 className="size-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer Badge & Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1.5">
            {unidadMedida.permiteDecimal ? (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-normal"
              >
                <Calculator className="size-3" />
                <span>Admite decimales</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-normal"
              >
                <Hash className="size-3" />
                <span>Solo enteros</span>
              </Badge>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            {unidadMedida.permiteDecimal ? "ej: 1.50 " + unidadMedida.simbolo : "ej: 10 " + unidadMedida.simbolo}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
