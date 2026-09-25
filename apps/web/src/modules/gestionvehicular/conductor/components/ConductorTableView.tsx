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

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import type { Conductor } from "../api/conductor.service"

function getInitials(name?: string | null): string {
  const clean = (name || "").trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getCategoryColor(cat?: string | null) {
  const c = (cat || "").toUpperCase()
  switch (c) {
    case "M":
    case "P":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25"
    case "A":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25"
    case "B":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25"
    case "C":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
    case "T":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25"
    default:
      return "bg-primary/15 text-primary border-primary/25"
  }
}

type ConductorTableViewProps = {
  conductores: Conductor[]
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
        id: "conductor",
        accessorFn: (row) => row.empleado?.nombreCompleto || "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Conductor / Colaborador" hideSortMenu />
        ),
        cell: ({ row }) => {
          const c = row.original
          const nombre = c.empleado?.nombreCompleto || "Empleado asignado"
          const codigo = c.empleado?.codigo || "-"
          const cargo = c.empleado?.cargo || null
          const area = c.empleado?.area || null
          const initials = getInitials(nombre)

          return (
            <div className="flex items-center gap-3 py-0.5 min-w-0">
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 via-primary/60 to-primary/30 font-bold text-xs text-primary-foreground shadow-2xs ring-2 ring-background">
                <span>{initials}</span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-background shadow-2xs",
                    c.activo ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                  )}
                  title={c.activo ? "Habilitado / Activo" : "Inactivo"}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="text-left text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                  title={nombre}
                >
                  {nombre}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                  <span className="font-mono text-[10px] font-semibold text-foreground/85 bg-muted/80 px-1.5 py-0.2 rounded border border-border/40">
                    {codigo}
                  </span>
                  {cargo && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="font-medium text-foreground/75 truncate max-w-[140px]" title={cargo}>
                        {cargo}
                      </span>
                    </>
                  )}
                  {area && (
                    <>
                      <span className="opacity-40 hidden sm:inline">•</span>
                      <span className="text-muted-foreground/70 hidden sm:inline truncate max-w-[140px]" title={area}>
                        {area}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "licencia",
        accessorFn: (row) => row.numeroLicencia,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Licencia" hideSortMenu />
        ),
        cell: ({ row }) => {
          const c = row.original
          const colorClasses = getCategoryColor(c.categoriaLicencia)

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-lg font-bold text-[10px] border shadow-2xs",
                  colorClasses
                )}
                title={`Categoría ${c.categoriaLicencia}`}
              >
                {c.categoriaLicencia}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground/90">
                <IdCard className="size-3.5 text-muted-foreground/60 shrink-0 hidden sm:inline" />
                <span className="tracking-wide">{c.numeroLicencia}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "fechaVencimiento",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vencimiento" hideSortMenu />
        ),
        cell: ({ row }) => {
          const dateStr = row.original.fechaVencimiento
          if (!dateStr) return <span className="text-xs text-muted-foreground">-</span>

          const vencimiento = new Date(dateStr)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / 86_400_000)

          const isExpired = diasRestantes < 0
          const isExpiringSoon = diasRestantes >= 0 && diasRestantes <= 30

          return (
            <div className="flex flex-col gap-0.5 whitespace-nowrap">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                <span>{formatDate(dateStr)}</span>
              </div>
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                  <AlertTriangle className="size-2.5 shrink-0" />
                  Vencida ({Math.abs(diasRestantes)}d)
                </span>
              ) : isExpiringSoon ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="size-2.5 shrink-0" />
                  Vence ({diasRestantes}d)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600/90 dark:text-emerald-400/90">
                  <span className="size-1 rounded-full bg-emerald-500" />
                  Vigente ({diasRestantes}d)
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "activo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" hideSortMenu />
        ),
        cell: ({ row }) => {
          const activo = row.original.activo
          return (
            <div className="whitespace-nowrap">
              {activo ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium rounded-full px-2 py-0.2 shadow-2xs"
                >
                  <CheckCircle2 className="size-3 shrink-0" />
                  Habilitado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 text-[10px] font-medium rounded-full px-2 py-0.2 shadow-2xs"
                >
                  <XCircle className="size-3 shrink-0" />
                  Inactivo
                </Badge>
              )}
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
          const c = row.original
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(c)}
                className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title="Editar conductor"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(c)}
                className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
