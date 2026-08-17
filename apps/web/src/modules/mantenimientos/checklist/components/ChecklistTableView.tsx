import { CheckSquare, Eye, ListTodo, Pencil, Trash2, Wrench } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import type { ChecklistMantenimiento } from "../api/checklist.service"

type ChecklistTableViewProps = {
  checklists: ChecklistMantenimiento[]
  onEdit: (checklist: ChecklistMantenimiento) => void
  onQuickView: (checklist: ChecklistMantenimiento) => void
  onManageItems: (checklist: ChecklistMantenimiento) => void
  onDelete: (checklist: ChecklistMantenimiento) => void
}

export function ChecklistTableView({
  checklists,
  onEdit,
  onQuickView,
  onManageItems,
  onDelete,
}: ChecklistTableViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="py-2.5 px-3">
                Código
              </th>
              <th scope="col" className="py-2.5 px-3">
                Nombre
              </th>
              <th scope="col" className="py-2.5 px-3">
                Actividad Asociada
              </th>
              <th scope="col" className="py-2.5 px-3">
                Descripción
              </th>
              <th scope="col" className="py-2.5 px-3">
                Auditoría
              </th>
              <th scope="col" className="py-2.5 px-3 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {checklists.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-muted/40"
              >
                {/* Code */}
                <td className="py-2 px-3 font-mono font-medium text-foreground">
                  <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                    <CheckSquare className="size-3 text-blue-500" />
                    {item.codigo}
                  </Badge>
                </td>

                {/* Name */}
                <td className="py-2 px-3 font-medium text-foreground">
                  {item.nombre}
                </td>

                {/* Actividad */}
                <td className="py-2 px-3">
                  {item.actividadMantenimiento ? (
                    <div className="inline-flex items-center gap-1 text-[11px]">
                      <Wrench className="size-3 text-primary shrink-0" />
                      <span>{item.actividadMantenimiento.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/60 italic">—</span>
                  )}
                </td>

                {/* Description */}
                <td className="py-2 px-3 max-w-[240px] truncate text-muted-foreground text-[11px]">
                  {item.descripcion || "—"}
                </td>

                {/* Audit */}
                <td className="py-2 px-3">
                  <AuditInfo data={item} compact className="max-w-[180px] text-[10px]" />
                </td>

                {/* Actions */}
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onQuickView(item)}
                      title="Ver Ficha"
                      className="size-7 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onManageItems(item)}
                      title="Gestionar Ítems y Pasos"
                      className="size-7 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <ListTodo className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(item)}
                      title="Editar"
                      className="size-7 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                      className="size-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
