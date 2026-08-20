import {
  Box,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { formatDate } from "@/shared/utils/date.utils"

import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
} from "./SolicitudCard"

type SolicitudTableViewProps = {
  solicitudes: SolicitudMantenimiento[]
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onDelete: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudTableView({
  solicitudes,
  onEdit,
  onQuickView,
  onDelete,
}: SolicitudTableViewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <tr>
            <th className="py-2.5 px-3">Número</th>
            <th className="py-2.5 px-3">Título / Motivo</th>
            <th className="py-2.5 px-3">Activo</th>
            <th className="py-2.5 px-3">Tipo</th>
            <th className="py-2.5 px-3">Prioridad</th>
            <th className="py-2.5 px-3">Fecha</th>
            <th className="py-2.5 px-3">Estado</th>
            <th className="py-2.5 px-3 text-center">Adj.</th>
            <th className="py-2.5 px-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {solicitudes.map((solicitud) => {
            const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
            const prioridadStyle = getPrioridadBadgeStyles(
              solicitud.prioridad?.nivel ?? 1,
            )
            const adjuntosCount = solicitud.adjuntos?.length ?? 0

            return (
              <tr
                key={solicitud.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {solicitud.numero ? (
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                      {solicitud.numero}
                    </code>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 max-w-[240px]">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">
                      {solicitud.titulo}
                    </span>
                    {solicitud.motivoMantenimiento ? (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {solicitud.motivoMantenimiento}
                      </span>
                    ) : null}
                  </div>
                </td>

                <td className="py-2.5 px-3 max-w-[180px]">
                  {solicitud.activo ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Box className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium">
                        {solicitud.activo.nombre}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap">
                  {solicitud.tipoMantenimiento ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Wrench className="size-3 shrink-0" />
                      <span>{solicitud.tipoMantenimiento.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap">
                  {solicitud.prioridad ? (
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold ${prioridadStyle}`}
                    >
                      {solicitud.prioridad.nombre}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                  {solicitud.fechaSolicitud
                    ? formatDate(solicitud.fechaSolicitud)
                    : "-"}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${estadoStyle}`}
                  >
                    {solicitud.estado}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  {adjuntosCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-primary text-[11px] font-medium">
                      <Paperclip className="size-3" />
                      {adjuntosCount}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">-</span>
                  )}
                </td>

                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <MoreVertical className="size-3.5" />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => onQuickView(solicitud)}
                        className="text-xs"
                      >
                        <Eye className="size-3.5 mr-1.5" />
                        Ver Ficha
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(solicitud)}
                        className="text-xs"
                      >
                        <Pencil className="size-3.5 mr-1.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-xs text-destructive focus:text-destructive"
                        onClick={() => onDelete(solicitud)}
                      >
                        <Trash2 className="size-3.5 mr-1.5" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
