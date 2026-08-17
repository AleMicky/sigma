import {
  AlertCircle,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { Prioridad } from "../api/prioridad.service"

type PrioridadCardProps = {
  prioridad: Prioridad
  onEdit: (prioridad: Prioridad) => void
  onQuickView: (prioridad: Prioridad) => void
  onDelete: (prioridad: Prioridad) => void
}

function getNivelBadgeStyles(nivel: number) {
  switch (nivel) {
    case 5:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case 4:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case 3:
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    case 2:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
}

export function PrioridadCard({
  prioridad,
  onEdit,
  onQuickView,
  onDelete,
}: PrioridadCardProps) {
  const badgeStyle = getNivelBadgeStyles(prioridad.nivel)

  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${badgeStyle}`}>
            <AlertCircle className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-heading text-xs font-semibold text-foreground">
                {prioridad.nombre}
              </h3>
              <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold ${badgeStyle}`}>
                Nivel {prioridad.nivel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {prioridad.codigo}
              </code>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground shrink-0"
              />
            }
          >
            <MoreVertical className="size-3.5" />
            <span className="sr-only">Acciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => onQuickView(prioridad)}
              className="text-xs"
            >
              <Eye className="size-3.5 mr-1.5" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(prioridad)}
              className="text-xs"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDelete(prioridad)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <div className="my-2 min-h-[28px]">
        {prioridad.descripcion ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {prioridad.descripcion}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Sin descripción adicional
          </p>
        )}
      </div>

      {/* Footer with Audit Info */}
      <div className="border-t border-border/60 pt-2 text-[10px]">
        <AuditInfo data={prioridad} compact className="text-[10px]" />
      </div>
    </li>
  )
}
