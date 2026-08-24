import {
  Box,
  Calendar,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  SendHorizontal,
  Trash2,
  User,
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
import { cn } from "@/shared/lib/utils"

import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"

type SolicitudCardProps = {
  solicitud: SolicitudMantenimiento
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onDelete: (solicitud: SolicitudMantenimiento) => void
  onEnviar?: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudCard({
  solicitud,
  onEdit,
  onQuickView,
  onDelete,
  onEnviar,
}: SolicitudCardProps) {
  const estadoNorm = (solicitud.estado ?? "").toLowerCase()
  const isSolicitado = estadoNorm === "solicitado"
  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border bg-card p-4 text-card-foreground shadow-2xs transition-all cursor-pointer overflow-hidden",
        isSolicitado
          ? "border-amber-500/40 hover:border-amber-500/80 hover:shadow-md bg-amber-500/[0.02]"
          : "border-border/80 hover:border-primary/50 hover:shadow-md",
      )}
    >
      {/* Top Section */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* Folio, Estado y Prioridad */}
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {solicitud.numero ? (
              <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary border border-primary/20">
                {solicitud.numero}
              </code>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                estadoStyle,
              )}
            >
              {isSolicitado ? "En Revisión" : solicitud.estado}
            </span>
            {solicitud.prioridad ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                  prioridadStyle,
                )}
              >
                {solicitud.prioridad.nombre}
              </span>
            ) : null}
          </div>

          {/* Action Menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 rounded-lg text-muted-foreground opacity-70 hover:opacity-100 hover:text-foreground shrink-0"
                  />
                }
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Acciones</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-38 rounded-xl shadow-lg">
                <DropdownMenuItem
                  onClick={() => onQuickView(solicitud)}
                  className="text-xs cursor-pointer py-2"
                >
                  <Eye className="size-3.5 mr-2 text-primary" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(solicitud)}
                  className="text-xs cursor-pointer py-2"
                >
                  <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                  Editar Solicitud
                </DropdownMenuItem>
                {solicitud.estado?.toLowerCase() === "borrador" && onEnviar ? (
                  <DropdownMenuItem
                    onClick={() => onEnviar(solicitud)}
                    className="text-xs text-primary focus:text-primary cursor-pointer py-2 font-medium"
                  >
                    <SendHorizontal className="size-3.5 mr-2" />
                    Enviar Solicitud
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs text-destructive focus:text-destructive cursor-pointer py-2"
                  onClick={() => onDelete(solicitud)}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title and Motivo */}
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {solicitud.titulo}
          </h3>
          {solicitud.tipoFallas ? (
            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
              <span className="text-foreground/80 font-semibold">Falla:</span>{" "}
              {solicitud.tipoFallas}
            </p>
          ) : null}
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {solicitud.descripcion}
          </p>
        </div>

        {/* Activo Card Strip */}
        {solicitud.activo ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2 border border-border/60 text-xs">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background border shadow-2xs text-primary">
              <Box className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 truncate">
              <p className="font-semibold text-foreground truncate text-xs">
                <span className="font-mono text-primary font-bold mr-1 text-[11px]">
                  {solicitud.activo.codigo}
                </span>
                {solicitud.activo.nombre}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer Info Row */}
      <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
        {/* Tipo Mantenimiento Chip */}
        <div className="flex items-center gap-1.5 min-w-0">
          {solicitud.tipoMantenimiento ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border truncate",
                getTipoMantenimientoBadgeClass(solicitud.tipoMantenimiento.nombre, false),
              )}
            >
              <Wrench className="size-3 shrink-0" />
              <span className="truncate">{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">General</span>
          )}

          {/* Adjuntos Pill */}
          {adjuntosCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
              <Paperclip className="size-3" />
              <span>{adjuntosCount}</span>
            </span>
          )}
        </div>

        {/* Date & Solicitante */}
        <div className="flex items-center gap-2 shrink-0 text-[10.5px] text-muted-foreground">
          {solicitud.solicitante && (
            <div className="hidden sm:flex items-center gap-1">
              <User className="size-3" />
              <span className="truncate max-w-[90px]">
                {solicitud.solicitante.nombre}
              </span>
            </div>
          )}
          {solicitud.fechaSolicitud && (
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>{formatDate(solicitud.fechaSolicitud)}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
