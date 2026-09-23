import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import type { Empleado } from "../api/empleado.service"

function getInitials(name: string): string {
  const clean = name.trim()
  if (!clean) return "EM"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

type EmpleadoTableViewProps = {
  empleados: Empleado[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  onEdit: (empleado: Empleado) => void
  onDelete: (empleado: Empleado) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function EmpleadoTableView({
  empleados,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: EmpleadoTableViewProps) {
  const columns = React.useMemo<ColumnDef<Empleado>[]>(
    () => [
      {
        id: "empleado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Colaborador" />
        ),
        cell: ({ row }) => {
          const emp = row.original
          const nombrePersona =
            emp.personaInfo?.nombreCompleto ||
            emp.personaNombreCompleto ||
            "Empleado sin asignar"

          const docPersona =
            emp.personaDocumento ||
            (emp.personaInfo?.tipoDocumento && emp.personaInfo?.numeroDocumento
              ? `${emp.personaInfo.tipoDocumento}: ${emp.personaInfo.numeroDocumento}`
              : null)

          const isExpired = emp.fechaFin
            ? new Date(emp.fechaFin).getTime() < new Date().setHours(0, 0, 0, 0)
            : false

          const initials = getInitials(nombrePersona)

          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-medium text-xs text-primary ring-1 ring-primary/20">
                <span>{initials}</span>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-card",
                    isExpired ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  title={isExpired ? "Periodo finalizado" : "Activo / Vigente"}
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => onEdit(emp)}
                  className="truncate text-left text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {nombrePersona}
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono text-muted-foreground/80">{emp.codigo}</span>
                  {docPersona && (
                    <>
                      <span className="opacity-40">•</span>
                      <span className="truncate">{docPersona}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "area",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Área" />
        ),
        cell: ({ row }) => {
          const emp = row.original
          const nombreArea =
            emp.areaInfo?.nombre || emp.areaNombre || "Sin área asignada"
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground/90 font-medium">
              <Building className="size-3.5 text-blue-500/80 shrink-0" />
              <span className="leading-tight">{nombreArea}</span>
            </div>
          )
        },
      },
      {
        id: "cargo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cargo" />
        ),
        cell: ({ row }) => {
          const emp = row.original
          const nombreCargo =
            emp.cargoInfo?.nombre || emp.cargoNombre || "Sin cargo asignado"
          return (
            <div className="flex items-center gap-1.5 text-xs text-foreground/90">
              <Briefcase className="size-3.5 text-purple-500/80 shrink-0" />
              <span className="leading-tight">{nombreCargo}</span>
            </div>
          )
        },
      },
      {
        id: "vigencia",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado / Periodo" />
        ),
        cell: ({ row }) => {
          const emp = row.original
          const isExpired = emp.fechaFin
            ? new Date(emp.fechaFin).getTime() < new Date().setHours(0, 0, 0, 0)
            : false

          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ring-1 ring-inset",
                    isExpired
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
                  )}
                >
                  {isExpired ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                  <span>{isExpired ? "Finalizado" : "Vigente"}</span>
                </span>
              </div>
              {(emp.fechaInicio || emp.fechaFin) && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                  <Calendar className="size-2.5 shrink-0 opacity-60" />
                  <span>
                    {emp.fechaInicio ? formatDate(emp.fechaInicio) : "Inicio"}
                    {emp.fechaFin ? ` – ${formatDate(emp.fechaFin)}` : " – Activo"}
                  </span>
                </div>
              )}
            </div>
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
          const emp = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(emp)
                }}
                title="Editar empleado"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(emp)
                }}
                title="Eliminar empleado"
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
      data={empleados}
      isLoading={isLoading}
      page={page}
      onPageChange={onPageChange}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyAction={emptyAction}
      showViewOptions
    />
  )
}
