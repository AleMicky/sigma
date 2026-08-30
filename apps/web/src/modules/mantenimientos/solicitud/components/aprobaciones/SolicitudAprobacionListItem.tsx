import { useState } from "react"
import {
  AlertTriangle,
  Box,
  Calendar,
  Check,
  Clock,
  Copy,
  Paperclip,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../../lib/solicitud.utils"

type SolicitudAprobacionListItemProps = {
  solicitud: SolicitudMantenimiento
  onQuickView: (solicitud: SolicitudMantenimiento) => void
}

function getInitials(name?: string | null): string {
  if (!name) return "US"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function SolicitudAprobacionListItem({
  solicitud,
  onQuickView,
}: SolicitudAprobacionListItemProps) {
  const [copied, setCopied] = useState(false)

  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isSolicitado = !solicitud.estado || estadoNorm === "solicitado"
  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4

  const prioridadStyle = getPrioridadBadgeStyles(
    solicitud.prioridad?.nivel ?? 1,
  )
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  function copyNumero(e: React.MouseEvent) {
    e.stopPropagation()
    if (!solicitud.numero) return
    navigator.clipboard.writeText(solicitud.numero)
    setCopied(true)
    toast.success(`Folio "${solicitud.numero}" copiado`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group flex flex-col gap-1.5 p-2.5 sm:py-3 sm:px-4 transition-all duration-200 cursor-pointer border-l-4 hover:bg-muted/40 select-none",
        isCritica
          ? "border-l-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]"
          : "border-l-amber-500 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]",
      )}
    >
      {/* Top Badges Line */}
      <div className="flex flex-wrap items-center gap-1.5">
        {solicitud.numero ? (
          <div
            onClick={copyNumero}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-foreground border border-border/80 hover:border-primary/50 transition-colors cursor-pointer shadow-2xs"
            title="Copiar folio"
          >
            <span>{solicitud.numero}</span>
            {copied ? (
              <Check className="size-2.5 text-emerald-500" />
            ) : (
              <Copy className="size-2.5 opacity-60" />
            )}
          </div>
        ) : null}

        {/* Estado Badge */}
        {isSolicitado ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-amber-500" />
            </span>
            <span>Por Aprobar</span>
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
              getEstadoBadgeStyles(solicitud.estado),
            )}
          >
            {solicitud.estado}
          </span>
        )}

        {/* Prioridad */}
        {solicitud.prioridad ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border shrink-0",
              prioridadStyle,
            )}
          >
            {isCritica && (
              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            )}
            <span>{solicitud.prioridad.nombre}</span>
          </span>
        ) : null}

        {/* Tipo Mantenimiento */}
        {solicitud.tipoMantenimiento ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border shrink-0",
              getTipoMantenimientoBadgeClass(
                solicitud.tipoMantenimiento.nombre,
                false,
              ),
            )}
          >
            <Wrench className="size-2.5" />
            <span>{solicitud.tipoMantenimiento.nombre}</span>
          </span>
        ) : null}

        {/* Tipo de Falla / Síntomas (si existe) */}
        {solicitud.tipoFallas ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 truncate max-w-[220px]">
            <AlertTriangle className="size-2.5 shrink-0" />
            <span className="truncate">{solicitud.tipoFallas}</span>
          </span>
        ) : null}
      </div>

      {/* Title and Short Description */}
      <div className="space-y-0.5 min-w-0">
        <h3 className="font-heading font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
          {solicitud.titulo}
        </h3>
        {solicitud.descripcion && (
          <p className="text-[11.5px] text-muted-foreground line-clamp-1">
            {solicitud.descripcion}
          </p>
        )}
      </div>

      {/* Details Line */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground">
        {solicitud.activo && (
          <div className="flex items-center gap-1.5 truncate max-w-[280px]">
            <Box className="size-3 text-primary shrink-0 opacity-80" />
            <span className="font-mono font-bold text-primary text-[11px]">
              {solicitud.activo.codigo}
            </span>
            <span className="truncate text-foreground font-medium">
              {solicitud.activo.nombre}
            </span>
          </div>
        )}

        {solicitud.solicitante && (
          <div className="flex items-center gap-1.5 truncate">
            <div className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[8.5px] shrink-0 border border-primary/20">
              {getInitials(solicitud.solicitante.nombre)}
            </div>
            <span className="truncate">
              Solicitante: <strong className="text-foreground font-medium">{solicitud.solicitante.nombre}</strong>
            </span>
          </div>
        )}

        {solicitud.fechaSolicitud && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3 opacity-70" />
            <span>{formatDateTime(solicitud.fechaSolicitud)}</span>
          </div>
        )}

        {solicitud.fechaEstimadaOt && (
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium shrink-0">
            <Clock className="size-2.5 text-emerald-600 dark:text-emerald-400" />
            <span>Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong></span>
          </div>
        )}

        {adjuntosCount > 0 && (
          <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/15 text-[10.5px]">
            <Paperclip className="size-2.5" />
            <span>{adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}</span>
          </div>
        )}
      </div>
    </li>
  )
}
