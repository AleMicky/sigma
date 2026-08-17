import { CheckSquare, Eye, Globe2, Layers, Pencil, Trash2, Wrench } from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import type { ActividadMantenimiento } from "../api/actividad.service"

type ActividadTableViewProps = {
  actividades: ActividadMantenimiento[]
  onEdit: (actividad: ActividadMantenimiento) => void
  onQuickView: (actividad: ActividadMantenimiento) => void
  onManageAplicaciones: (actividad: ActividadMantenimiento) => void
  onDelete: (actividad: ActividadMantenimiento) => void
}

export function ActividadTableView({
  actividades,
  onEdit,
  onQuickView,
  onManageAplicaciones,
  onDelete,
}: ActividadTableViewProps) {
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
                Alcance / Reglas
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
            {actividades.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-muted/40"
              >
                {/* Code */}
                <td className="py-2 px-3 font-mono font-medium text-foreground">
                  <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 inline-flex items-center gap-1">
                    <Wrench className="size-3 text-primary" />
                    {item.codigo}
                  </Badge>
                </td>

                {/* Name */}
                <td className="py-2 px-3 font-medium text-foreground">
                  {item.nombre}
                </td>

                {/* Scope Badges */}
                <td className="py-2 px-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {item.aplicaTodosTiposActivo ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[9px] px-1 py-0"
                      >
                        <Globe2 className="size-2.5 mr-0.5" />
                        Global
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[9px] text-muted-foreground px-1 py-0"
                      >
                        Por Tipo
                      </Badge>
                    )}

                    {item.requiereChecklist && (
                      <Badge
                        variant="outline"
                        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[9px] px-1 py-0"
                      >
                        <CheckSquare className="size-2.5 mr-0.5" />
                        Checklist
                      </Badge>
                    )}
                  </div>
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
                      onClick={() => onManageAplicaciones(item)}
                      title="Aplicaciones a Activos"
                      className="size-7 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Layers className="size-3.5" />
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
