import { AlertCircle, Eye, Pencil, Trash2 } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import type { Prioridad } from "../api/prioridad.service"

type PrioridadTableViewProps = {
  prioridades: Prioridad[]
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

export function PrioridadTableView({
  prioridades,
  onEdit,
  onQuickView,
  onDelete,
}: PrioridadTableViewProps) {
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
                Nivel
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
            {prioridades.map((item) => {
              const badgeStyle = getNivelBadgeStyles(item.nivel)
              return (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-muted/40"
                >
                  {/* Code */}
                  <td className="py-2 px-3 font-mono font-medium text-foreground">
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                      <AlertCircle className="size-3 text-primary" />
                      {item.codigo}
                    </Badge>
                  </td>

                  {/* Name */}
                  <td className="py-2 px-3 font-medium text-foreground">
                    {item.nombre}
                  </td>

                  {/* Level */}
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}>
                      Nivel {item.nivel}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-2 px-3 max-w-[280px] truncate text-muted-foreground text-[11px]">
                    {item.descripcion || "—"}
                  </td>

                  {/* Audit */}
                  <td className="py-2 px-3">
                    <AuditInfo data={item} compact className="max-w-[190px] text-[10px]" />
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
