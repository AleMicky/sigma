import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Cake,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import type { PageResponse } from "@/shared/types/api.types"

import type { Persona } from "../api/persona.service"

function getInitials(name: string): string {
  const clean = name.trim()
  if (!clean) return "PE"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

type PersonaTableViewProps = {
  personas: Persona[]
  page?: Pick<
    PageResponse<unknown>,
    "page" | "size" | "totalElements" | "totalPages" | "first" | "last"
  >
  onPageChange?: (page: number) => void
  onEdit: (persona: Persona) => void
  onDelete: (persona: Persona) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  emptyAction?: React.ReactNode
}

export function PersonaTableView({
  personas,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: PersonaTableViewProps) {
  const columns = React.useMemo<ColumnDef<Persona>[]>(
    () => [
      {
        id: "persona",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Persona" />
        ),
        cell: ({ row }) => {
          const persona = row.original
          const nombreCompleto = [
            persona.nombres,
            persona.primerApellido,
            persona.segundoApellido,
          ]
            .filter(Boolean)
            .join(" ")

          const docCompleto = `${persona.tipoDocumento}: ${persona.numeroDocumento}${
            persona.complemento ? `-${persona.complemento}` : ""
          }`

          const initials = getInitials(nombreCompleto)

          return (
            <div className="flex items-center gap-3.5 min-w-[220px]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 font-bold text-sm text-primary-foreground shadow-sm ring-2 ring-background">
                <span>{initials}</span>
              </div>

              <div className="flex min-w-0 flex-col">
                <button
                  type="button"
                  onClick={() => onEdit(persona)}
                  className="truncate text-left text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {nombreCompleto}
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono text-muted-foreground/80 font-semibold">{docCompleto}</span>
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "contacto",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contacto" />
        ),
        cell: ({ row }) => {
          const persona = row.original
          const hasAny = persona.correo || persona.telefono || persona.fechaNacimiento

          if (!hasAny) {
            return (
              <span className="text-xs text-muted-foreground/40 italic">
                Sin datos de contacto
              </span>
            )
          }

          return (
            <div className="flex flex-col gap-1 min-w-[180px]">
              {persona.correo && (
                <div className="flex items-center gap-1.5 text-xs text-foreground/80 truncate">
                  <Mail className="size-3.5 text-primary shrink-0 opacity-80" />
                  <span className="truncate">{persona.correo}</span>
                </div>
              )}
              {persona.telefono && (
                <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                  <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 opacity-80" />
                  <span>{persona.telefono}</span>
                </div>
              )}
              {persona.fechaNacimiento && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Cake className="size-3 shrink-0 opacity-60" />
                  <span>{formatDate(persona.fechaNacimiento)}</span>
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
          const persona = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(persona)
                }}
                title="Editar persona"
                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(persona)
                }}
                title="Eliminar persona"
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
      data={personas}
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
