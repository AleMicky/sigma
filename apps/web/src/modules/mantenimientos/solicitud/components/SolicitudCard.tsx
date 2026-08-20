import {
  Box,
  Calendar,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
  Wrench,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
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

type SolicitudCardProps = {
  solicitud: SolicitudMantenimiento
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onDelete: (solicitud: SolicitudMantenimiento) => void
}

export function getEstadoBadgeStyles(estado?: string) {
  const norm = (estado ?? "").toLowerCase().trim()
  switch (norm) {
    case "finalizado":
    case "completado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    case "en_proceso":
    case "en proceso":
    case "en_ejecucion":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    case "aprobado":
    case "asignado":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
    case "solicitado":
    case "pendiente":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case "rechazado":
    case "cancelado":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case "borrador":
    default:
      return "bg-muted text-muted-foreground border-border/80"
  }
}

export function getPrioridadBadgeStyles(nivel = 1) {
  switch (nivel) {
    case 5:
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    case 4:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    case 3:
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
    case 2:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  }
}

export function SolicitudCard({
  solicitud,
  onEdit,
  onQuickView,
  onDelete,
}: SolicitudCardProps) {
  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  return (
    <li className="group flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 text-card-foreground shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {solicitud.numero ? (
              <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                {solicitud.numero}
              </code>
            ) : null}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${estadoStyle}`}
            >
              {solicitud.estado}
            </span>
            {solicitud.prioridad ? (
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold ${prioridadStyle}`}
              >
                {solicitud.prioridad.nombre}
              </span>
            ) : null}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground shrink-0"
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
        </div>

        {/* Title and Motivo */}
        <div className="mt-2 space-y-1">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {solicitud.titulo}
          </h3>
          {solicitud.motivoMantenimiento ? (
            <p className="line-clamp-1 text-[11px] font-medium text-muted-foreground">
              <span className="text-foreground/70">Motivo:</span> {solicitud.motivoMantenimiento}
            </p>
          ) : null}
          <p className="line-clamp-2 text-xs text-muted-foreground/90 leading-relaxed">
            {solicitud.descripcion}
          </p>
        </div>

        {/* Tags / Info chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          {solicitud.activo ? (
            <div className="inline-flex items-center gap-1 rounded bg-muted/70 px-2 py-0.5 text-foreground/80 max-w-[200px] truncate">
              <Box className="size-3 text-muted-foreground shrink-0" />
              <span className="font-mono text-[10px] font-medium text-muted-foreground shrink-0">
                {solicitud.activo.codigo}
              </span>
              <span className="truncate">{solicitud.activo.nombre}</span>
            </div>
          ) : null}

          {solicitud.tipoMantenimiento ? (
            <div className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5 text-muted-foreground">
              <Wrench className="size-3 shrink-0" />
              <span className="truncate">{solicitud.tipoMantenimiento.nombre}</span>
            </div>
          ) : null}

          {solicitud.fechaSolicitud ? (
            <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Calendar className="size-3 shrink-0" />
              <span>{formatDate(solicitud.fechaSolicitud)}</span>
            </div>
          ) : null}

          {adjuntosCount > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary">
              <Paperclip className="size-3" />
              <span>{adjuntosCount}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer with Audit info */}
      <div className="mt-3 border-t border-border/60 pt-2 text-[10px]">
        <AuditInfo data={solicitud} compact className="text-[10px]" />
      </div>
    </li>
  )
}
