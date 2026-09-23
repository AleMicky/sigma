import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Calculator, Eye, Hash, Pencil, Trash2 } from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import type { UnidadMedida } from "../api/unidad-medida.service"

type UnidadMedidaTableViewProps = {
  unidadesMedida: UnidadMedida[]
  onEdit: (unidadMedida: UnidadMedida) => void
  onQuickView: (unidadMedida: UnidadMedida) => void
  onDelete: (unidadMedida: UnidadMedida) => void
  isLoading?: boolean
}

export function UnidadMedidaTableView({
  unidadesMedida,
  onEdit,
  onQuickView,
  onDelete,
  isLoading = false,
}: UnidadMedidaTableViewProps) {
  const columns = React.useMemo<ColumnDef<UnidadMedida>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Código" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.codigo}
          </Badge>
        ),
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.nombre}
          </span>
        ),
      },
      {
        accessorKey: "simbolo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Símbolo" />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
            {row.original.simbolo}
          </span>
        ),
      },
      {
        accessorKey: "permiteDecimal",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Precisión / Decimales"
          />
        ),
        cell: ({ row }) =>
          row.original.permiteDecimal ? (
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
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones</div>,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickView(item)
                }}
                title="Ver Ficha"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                title="Editar"
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item)
                }}
                title="Eliminar"
                className="size-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onDelete, onEdit, onQuickView]
  )

  return (
    <DataTable
      columns={columns}
      data={unidadesMedida}
      isLoading={isLoading}
      emptyTitle="No hay unidades de medida"
      emptyDescription="No se encontraron unidades de medida registradas."
    />
  )
}
