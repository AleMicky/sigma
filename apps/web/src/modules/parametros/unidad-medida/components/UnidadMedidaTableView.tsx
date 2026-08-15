import { Calculator, Eye, Hash, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import type { UnidadMedida } from "../api/unidad-medida.service"

type UnidadMedidaTableViewProps = {
  unidadesMedida: UnidadMedida[]
  onEdit: (unidadMedida: UnidadMedida) => void
  onQuickView: (unidadMedida: UnidadMedida) => void
  onDelete: (unidadMedida: UnidadMedida) => void
}

export function UnidadMedidaTableView({
  unidadesMedida,
  onEdit,
  onQuickView,
  onDelete,
}: UnidadMedidaTableViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="py-3 px-4">
                Código
              </th>
              <th scope="col" className="py-3 px-4">
                Nombre
              </th>
              <th scope="col" className="py-3 px-4">
                Símbolo
              </th>
              <th scope="col" className="py-3 px-4">
                Precisión / Decimales
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {unidadesMedida.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-muted/40"
              >
                {/* Code */}
                <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {item.codigo}
                  </Badge>
                </td>

                {/* Name */}
                <td className="py-3.5 px-4 font-medium text-foreground">
                  {item.nombre}
                </td>

                {/* Symbol */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                    {item.simbolo}
                  </span>
                </td>

                {/* Decimal Allowed */}
                <td className="py-3.5 px-4">
                  {item.permiteDecimal ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-normal"
                    >
                      <Calculator className="size-3" />
                      <span>Admite decimales (#.#)</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-normal"
                    >
                      <Hash className="size-3" />
                      <span>Solo enteros (1, 2, 3)</span>
                    </Badge>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onQuickView(item)}
                      title="Ver Ficha"
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(item)}
                      title="Editar"
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      title="Eliminar"
                      className="size-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
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
