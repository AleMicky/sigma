import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Calendar,
  FileCode2,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
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
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  // Derive selectedItem directly from props during render (no effect needed)
  const selectedItem = React.useMemo(
    () => (selectedId ? tiposSolicitud.find((t) => t.id === selectedId) ?? null : null),
    [tiposSolicitud, selectedId]
  )

  // Clear selection on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const rowSelection = React.useMemo(() => {
    if (!selectedId) return {}
    const index = tiposSolicitud.findIndex((t) => t.id === selectedId)
    return index >= 0 ? { [String(index)]: true } : {}
  }, [selectedId, tiposSolicitud])

  const handleRowClick = React.useCallback((item: TipoSolicitudVehicular) => {
    setSelectedId((prev) => (prev === item.id ? null : item.id))
  }, [])

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
                className="text-xs sm:text-sm font-semibold text-foreground truncate"
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
              className="text-xs text-muted-foreground truncate max-w-xs inline-block"
              title={desc}
            >
              {desc}
            </span>
          )
        },
      },
      {
        accessorKey: "diasAnticipacion",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Anticipación" hideSortMenu />
        ),
        cell: ({ row }) => {
          const dias = row.original.diasAnticipacion ?? 0
          return (
            <div className="flex items-center gap-1.5 py-0.5 whitespace-nowrap">
              <span className="text-xs font-medium text-foreground">
                {dias === 0 ? (
                  <span className="text-muted-foreground">Inmediato (0 d)</span>
                ) : (
                  <span>{dias} {dias === 1 ? "día" : "días"}</span>
                )}
              </span>
            </div>
          )
        },
      },
      {
        id: "requerimientos",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Requisitos" hideSortMenu />
        ),
        cell: ({ row }) => {
          const { requiereRespaldo, requiereJustificacion } = row.original
          if (!requiereRespaldo && !requiereJustificacion) {
            return <span className="text-[11px] text-muted-foreground/60 italic">Ninguno</span>
          }
          return (
            <div className="flex items-center gap-1.5 flex-wrap py-0.5">
              {requiereRespaldo && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  Respaldo
                </Badge>
              )}
              {requiereJustificacion && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-1.5 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                >
                  Justificación
                </Badge>
              )}
            </div>
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
    ],
    []
  )

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={tiposSolicitud}
        isLoading={isLoading}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyIcon={emptyIcon}
        emptyAction={emptyAction}
        density="compact"
        stickyHeader
        containerClassName="gap-0"
        className="border-0 rounded-none shadow-none"
        onRowClick={handleRowClick}
        rowSelection={rowSelection}
      />

      {/* Floating Action Bar upon Row Selection */}
      {selectedItem && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex max-w-[92vw] items-center gap-2 sm:gap-3 rounded-2xl border border-border/80 bg-background/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary border-primary/25 shrink-0"
            >
              {selectedItem.codigo}
            </Badge>
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[130px] sm:max-w-[220px]">
              {selectedItem.nombre}
            </span>
          </div>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={() => onEdit(selectedItem)}
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Pencil className="size-3.5" />
              <span>Editar</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(selectedItem)}
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-2xs cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Eliminar</span>
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setSelectedId(null)}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 ml-0.5 cursor-pointer"
              title="Deseleccionar (Esc)"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
