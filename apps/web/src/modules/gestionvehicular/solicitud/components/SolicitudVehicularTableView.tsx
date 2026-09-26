import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Clock,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  Users,
} from "lucide-react"

import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { DataTable, DataTableColumnHeader } from "@/shared/components/data-table"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { formatDate } from "@/shared/lib/format-date"

import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

type SolicitudVehicularTableViewProps = {
  data: SolicitudVehicular[]
  isLoading?: boolean
  hasFilters?: boolean
  onResetFilters?: () => void
  onCreate?: () => void
  onView: (solicitud: SolicitudVehicular) => void
  onEdit: (solicitud: SolicitudVehicular) => void
  onDelete: (solicitud: SolicitudVehicular) => void
}

function getInitials(name?: string): string {
  if (!name) return "SV"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

export function SolicitudVehicularTableView({
  data,
  isLoading = false,
  hasFilters = false,
  onResetFilters,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: SolicitudVehicularTableViewProps) {
  const columns = useMemo<ColumnDef<SolicitudVehicular>[]>(
    () => [
      {
        accessorKey: "numero",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="N° Solicitud" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2 py-0.5">
              <Badge
                variant="outline"
                className="font-mono text-xs font-semibold px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
              >
                {item.numero}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "solicitante",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Solicitante" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          const solicitante = item.solicitante
          return (
            <div className="flex items-center gap-2.5 py-0.5 max-w-xs">
              <Avatar className="size-7 shrink-0 border border-border/70">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                  {getInitials(solicitante?.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">
                  {solicitante?.nombreCompleto || "No registrado"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {solicitante?.cargo || solicitante?.area || "Sin detalle"}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "motivo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Motivo & Destino" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex flex-col min-w-0 py-0.5 max-w-sm">
              <span className="text-xs font-medium text-foreground truncate" title={item.motivo}>
                {item.motivo}
              </span>
              <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                {item.destino}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "tipoSolicitud",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tipo" hideSortMenu />
        ),
        cell: ({ row }) => {
          const tipo = row.original.tipoSolicitudVehicular
          return (
            <div className="flex items-center py-0.5">
              <Badge
                variant="outline"
                className="font-normal text-xs px-2 py-0.5 bg-muted/40 text-foreground border-border/60"
              >
                {tipo?.nombre || "General"}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "fechas",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Itinerario" hideSortMenu />
        ),
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex flex-col min-w-0 py-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
              <div className="flex items-center gap-1">
                <Clock className="size-3 text-primary/80" />
                <span>{formatDate(item.fechaSalida)}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                <span>Ret: {formatDate(item.fechaRetornoEstimada)}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "cantidadPasajeros",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Pasajeros" hideSortMenu />
        ),
        cell: ({ row }) => {
          const count = row.original.cantidadPasajeros ?? 1
          return (
            <div className="flex items-center gap-1 py-0.5 text-xs">
              <Users className="size-3 text-muted-foreground" />
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "estado",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" hideSortMenu />
        ),
        cell: ({ row }) => {
          const estado = row.original.estado || "PENDIENTE"
          return (
            <div className="flex items-center gap-1.5 py-0.5">
              <WorkflowStatusBadge status={estado} size="sm" />
              {row.original.adjuntos && row.original.adjuntos.length > 0 && (
                <Badge
                  variant="outline"
                  className="h-4.5 px-1 gap-0.5 text-[10px] text-muted-foreground border-border/60"
                  title={`${row.original.adjuntos.length} adjuntos`}
                >
                  <Paperclip className="size-2.5" />
                  {row.original.adjuntos.length}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: () => null,
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
                onClick={() => onView(item)}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                title="Ver detalle"
              >
                <Eye className="size-3.5" />
                <span className="sr-only">Ver</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                      title="Opciones"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Abrir opciones</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => onView(item)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Eye className="size-3.5" />
                    <span>Ver detalle</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(item)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(item)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [onView, onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={onView}
      emptyTitle={
        hasFilters
          ? "Sin resultados para tu búsqueda"
          : "No hay solicitudes de vehículos registradas."
      }
      emptyDescription={
        hasFilters
          ? "No se encontraron coincidencias para los filtros aplicados. Intenta con otros términos o limpia el filtro."
          : "Crea tu primera solicitud vehicular para programar un viaje o comisión de servicio."
      }
      emptyIcon={
        hasFilters ? (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-1 ring-border/60 shadow-2xs">
            <SearchX className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs">
            <FileText className="size-6" />
          </div>
        )
      }
      emptyAction={
        hasFilters ? (
          <Button
            onClick={onResetFilters}
            variant="outline"
            size="sm"
            className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-medium border-border/70 hover:bg-muted/70 cursor-pointer shadow-2xs"
          >
            Limpiar búsqueda
          </Button>
        ) : (
          <Button
            onClick={onCreate}
            size="sm"
            className="mt-3.5 h-8 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            Nueva Solicitud
          </Button>
        )
      }
      density="compact"
      stickyHeader
      containerClassName="gap-0"
      className="border-0 rounded-none shadow-none"
    />
  )
}
