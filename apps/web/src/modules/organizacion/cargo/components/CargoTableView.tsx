import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Briefcase,
  Pencil,
  Trash2,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Button } from "@/shared/components/ui/button"
import type { PageResponse } from "@/shared/types/api.types"

import type { Cargo } from "../api/cargo.service"

type CargoTableViewProps = {
  cargos: Cargo[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  onEdit: (cargo: Cargo) => void
  onDelete: (cargo: Cargo) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function CargoTableView({
  cargos,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: CargoTableViewProps) {
  const columns = React.useMemo<ColumnDef<Cargo>[]>(
    () => [
      {
        id: "cargo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cargo" />
        ),
        cell: ({ row }) => {
          const cargo = row.original

          return (
            <div className="flex items-center gap-3.5 min-w-[200px]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/10 shadow-xs">
                <Briefcase className="size-5" />
              </div>

              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => onEdit(cargo)}
                  className="truncate text-left text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {cargo.nombre}
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono text-muted-foreground/80">{cargo.codigo}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "descripcion",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Descripción" />
        ),
        cell: ({ row }) => {
          const cargo = row.original
          return cargo.descripcion ? (
            <span className="text-xs text-muted-foreground line-clamp-2 max-w-md">
              {cargo.descripcion}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40 italic">
              Sin descripción
            </span>
          )
        },
      },
      {
        id: "audit",
        header: () => (
          <div className="hidden 2xl:block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </div>
        ),
        cell: ({ row }) => (
          <div className="hidden 2xl:block">
            <AuditInfo data={row.original} compact className="max-w-[160px]" />
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const cargo = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(cargo)
                }}
                title="Editar cargo"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(cargo)
                }}
                title="Eliminar cargo"
                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onDelete, onEdit]
  )

  return (
    <DataTable
      columns={columns}
      data={cargos}
      isLoading={isLoading}
      page={page}
      onPageChange={onPageChange}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyAction={emptyAction}
      showViewOptions
      density="compact"
    />
  )
}
