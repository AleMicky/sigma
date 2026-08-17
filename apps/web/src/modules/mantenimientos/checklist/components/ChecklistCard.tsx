import {
  CheckSquare,
  Eye,
  ListTodo,
  MoreVertical,
  Pencil,
  Trash2,
  Wrench,
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

import type { ChecklistMantenimiento } from "../api/checklist.service"

type ChecklistCardProps = {
  checklist: ChecklistMantenimiento
  onEdit: (checklist: ChecklistMantenimiento) => void
  onQuickView: (checklist: ChecklistMantenimiento) => void
  onManageItems: (checklist: ChecklistMantenimiento) => void
  onDelete: (checklist: ChecklistMantenimiento) => void
}

export function ChecklistCard({
  checklist,
  onEdit,
  onQuickView,
  onManageItems,
  onDelete,
}: ChecklistCardProps) {
  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckSquare className="size-4" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-xs font-semibold text-foreground">
              {checklist.nombre}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {checklist.codigo}
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
              onClick={() => onQuickView(checklist)}
              className="text-xs"
            >
              <Eye className="size-3.5 mr-1.5" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onManageItems(checklist)}
              className="text-xs"
            >
              <ListTodo className="size-3.5 mr-1.5 text-primary" />
              Gestionar Ítems
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(checklist)}
              className="text-xs"
            >
              <Pencil className="size-3.5 mr-1.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive"
              onClick={() => onDelete(checklist)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actividad Badge */}
      {checklist.actividadMantenimiento && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Wrench className="size-3 text-primary shrink-0" />
          <span className="truncate">
            Actividad: <strong>{checklist.actividadMantenimiento.nombre}</strong>
          </span>
        </div>
      )}

      {/* Description */}
      <div className="my-2 min-h-[28px]">
        {checklist.descripcion ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground leading-snug">
            {checklist.descripcion}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Sin descripción adicional
          </p>
        )}
      </div>

      {/* Quick Action to manage items */}
      <div className="pb-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onManageItems(checklist)}
          className="w-full h-7 text-xs justify-center gap-1.5 border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40"
        >
          <ListTodo className="size-3.5" />
          <span>Configurar Ítems y Pasos</span>
        </Button>
      </div>

      {/* Footer with Audit Info */}
      <div className="border-t border-border/60 pt-2 text-[10px]">
        <AuditInfo data={checklist} compact className="text-[10px]" />
      </div>
    </li>
  )
}
