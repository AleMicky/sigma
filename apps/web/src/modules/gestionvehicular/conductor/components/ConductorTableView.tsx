import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  IdCard,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import type { Conductor } from "../api/conductor.service"

function getInitials(name?: string | null): string {
  const clean = (name || "").trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

type ConductorTableViewProps = {
  conductores: Conductor[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  onEdit: (conductor: Conductor) => void
  onDelete: (conductor: Conductor) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function ConductorTableView({
  conductores,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: ConductorTableViewProps) {
  const columns = React.useMemo<ColumnDef<Conductor>[]>(
    () => [
      {
        id: "empleado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Conductor / Empleado" />
        ),
        cell: ({ row }) => {
          const c = row.original
          const nombre = c.empleado?.nombreCompleto || "Empleado asignado"
          const codigo = c.empleado?.codigo || "-"
          const cargo = c.empleado?.cargo || null
          const area = c.empleado?.area || null
          const initials = getInitials(nombre)

          return (
            <div className="flex items-center gap-3.5 min-w-[240px]">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary/40 font-bold text-xs text-primary-foreground shadow-sm ring-2 ring-background">
                <span>{initials}</span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background shadow-xs",
                    c.activo ? "bg-emerald-500" : "bg-zinc-400"
                  )}
                  title={c.activo ? "Activo" : "Inactivo"}
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="truncate text-left text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {nombre}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono text-[11px] font-medium text-foreground/80 bg-muted/60 px-1.5 py-0.2 rounded-md">
                    {codigo}
                  </span>
                  {cargo && (
                    <>
                      <span>•</span>
                      <span className="truncate">{cargo}</span>
                    </>
                  )}
                  {area && (
                    <>
                      <span>•</span>
                      <span className="truncate text-muted-foreground/70">{area}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "numeroLicencia",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nº Licencia" />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <IdCard className="size-3.5" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-wide text-foreground">
                {row.original.numeroLicencia}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "categoriaLicencia",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Categoría" />
        ),
        cell: ({ row }) => {
          const cat = row.original.categoriaLicencia
          return (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex size-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/20 shadow-xs">
                {cat}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Cat. {cat}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "fechaVencimiento",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vencimiento Licencia" />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.fechaVencimiento
          if (!dateStr) return <span className="text-xs text-muted-foreground">-</span>

          const vencimiento = new Date(dateStr)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

          const isExpired = diasRestantes < 0
          const isExpiringSoon = diasRestantes >= 0 && diasRestantes <= 30

          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>{formatDate(dateStr)}</span>
              </div>
              {isExpired && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                  <AlertTriangle className="size-2.5" />
                  Vencida hace {Math.abs(diasRestantes)} días
                </span>
              )}
              {isExpiringSoon && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="size-2.5" />
                  Vence en {diasRestantes} días
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "activo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ row }) => {
          const activo = row.original.activo
          return activo ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium rounded-full px-2.5"
            >
              <CheckCircle2 className="size-3" />
              Habilitado
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium rounded-full px-2.5"
            >
              <XCircle className="size-3" />
              Inactivo
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const c = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <AuditInfo
                data={c}
                compact
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(c)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                title="Editar conductor"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(c)}
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Eliminar conductor"
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
      data={conductores}
      page={page}
      onPageChange={onPageChange}
      isLoading={isLoading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyAction={emptyAction}
    />
  )
}
