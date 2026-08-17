import {
  CheckSquare,
  Eye,
  Globe2,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadCardProps = {
  actividad: ActividadMantenimiento
  onEdit: (actividad: ActividadMantenimiento) => void
  onQuickView: (actividad: ActividadMantenimiento) => void
  onManageAplicaciones: (actividad: ActividadMantenimiento) => void
  onDelete: (actividad: ActividadMantenimiento) => void
}

export function ActividadCard({
  actividad,
  onEdit,
  onQuickView,
  onManageAplicaciones,
  onDelete,
}: ActividadCardProps) {
  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wrench className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-xs font-semibold text-foreground">
              {actividad.nombre}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {actividad.codigo}
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
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => onQuickView(actividad)}
              className="text-xs"
            >
              <Eye className="size-3.5 mr-1.5" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onManageAplicaciones(actividad)}
              className="text-xs"
            >
              <Layers className="size-3.5 mr-1.5 text-primary" />
              Aplicaciones a Activos
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(actividad)}
              className="text-xs"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDelete(actividad)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <div className="my-2 min-h-[28px]">
        {actividad.descripcion ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {actividad.descripcion}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Sin descripción adicional
          </p>
        )}
      </div>

      {/* Badges / Features */}
      <div className="flex flex-wrap items-center gap-1.5 py-1">
        {actividad.aplicaTodosTiposActivo ? (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1 px-1.5 py-0"
          >
            <Globe2 className="size-3" />
            Todos los Activos
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-[10px] text-muted-foreground gap-1 px-1.5 py-0"
          >
            <Layers className="size-3" />
            Por Tipo Activo
          </Badge>
        )}

        {actividad.requiereChecklist && (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] gap-1 px-1.5 py-0"
          >
            <CheckSquare className="size-3" />
            Checklist Requerido
          </Badge>
        )}
      </div>

      {/* Footer with Audit Info */}
      <div className="border-t border-border/60 pt-2 text-[10px]">
        <AuditInfo data={actividad} compact className="text-[10px]" />
      </div>
    </li>
  )
}
