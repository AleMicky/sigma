import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Calendar,
  FileCode2,
  Pencil,
  Trash2,
} from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"

import type { TipoSolicitudVehicular } from "../api/tipo-solicitud.service"

type TipoSolicitudTableViewProps = {
  tiposSolicitud: TipoSolicitudVehicular[]
  onEdit: (tipo: TipoSolicitudVehicular) => void
  onDelete: (tipo: TipoSolicitudVehicular) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function TipoSolicitudTableView({
  tiposSolicitud,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: TipoSolicitudTableViewProps) {
  const columns = React.useMemo<ColumnDef<TipoSolicitudVehicular>[]>(
    () => [
      {
        accessorKey: "codigo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Código" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2 py-0.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs font-mono font-bold text-xs">
                <FileCode2 className="size-3.5" />
              </div>
              <Badge
                variant="outline"
                className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted/60 border-border/60"
              >
                {item.codigo}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "nombre",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre / Motivo" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex flex-col min-w-0 py-0.5">
              <span
                className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                title={item.nombre}
              >
                {item.nombre}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "descripcion",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Descripción" hideSortMenu />
        ),
        cell: ({ row }) => {
          const desc = row.original.descripcion
          if (!desc) {
            return <span className="text-xs text-muted-foreground/60 italic">Sin descripción</span>
          }
          return (
            <span
              className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md inline-block"
              title={desc}
            >
              {desc}
            </span>
          )
        },
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.auditoria?.createdAt || row.createdAt || "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha Registro" hideSortMenu />
        ),
        cell: ({ row }) => {
          const rawDate = row.original.auditoria?.createdAt || row.original.createdAt
          if (!rawDate) return <span className="text-xs text-muted-foreground">-</span>

          return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
              <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
              <span>{formatDate(rawDate)}</span>
            </div>
          )
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <div className="text-right text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(item)}
                className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Editar tipo de solicitud"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(item)}
                className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Eliminar tipo de solicitud"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={tiposSolicitud}
      onRowClick={onEdit}
      isLoading={isLoading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyAction={emptyAction}
      density="compact"
      stickyHeader
      containerClassName="gap-0"
      className="border-0 rounded-none shadow-none"
    />
  )
}
