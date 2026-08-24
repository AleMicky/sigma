import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertOctagon,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Paperclip,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { formatDate } from "@/shared/utils/date.utils"

import { solicitudQueries } from "../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../lib/solicitud.utils"

type SolicitudAprobacionListItemProps = {
  solicitud: SolicitudMantenimiento
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onActionSelect: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}

function getInitials(name?: string | null): string {
  if (!name) return "US"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getActionStyle(action: WorkflowAction) {
  const name = (action.name ?? "").toLowerCase()
  const val = (action.value ?? "").toUpperCase()

  if (val.includes("APROB") || name.includes("aprobar")) {
    return {
      icon: CheckCircle2,
      btnClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500/30",
    }
  }
  if (val.includes("OBSERV") || name.includes("observar")) {
    return {
      icon: AlertCircle,
      btnClass:
        "bg-amber-600 hover:bg-amber-700 text-white shadow-xs ring-1 ring-amber-500/30",
    }
  }
  if (val.includes("RECHAZ") || val.includes("CANCEL") || name.includes("rechazar")) {
    return {
      icon: AlertOctagon,
      btnClass:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs ring-1 ring-rose-500/30",
    }
  }
  if (val.includes("INIC") || name.includes("iniciar")) {
    return {
      icon: Play,
      btnClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-xs",
    }
  }
  if (val.includes("REVIS") || name.includes("revisión")) {
    return {
      icon: Send,
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
    }
  }
  if (val.includes("VALID") || name.includes("validar")) {
    return {
      icon: ShieldCheck,
      btnClass: "bg-teal-600 hover:bg-teal-700 text-white shadow-xs",
    }
  }
  if (val.includes("CORREG") || name.includes("corregir")) {
    return {
      icon: RotateCcw,
      btnClass: "bg-orange-600 hover:bg-orange-700 text-white shadow-xs",
    }
  }
  return {
    icon: CheckCircle2,
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  }
}

export function SolicitudAprobacionListItem({
  solicitud,
  onQuickView,
  onActionSelect,
}: SolicitudAprobacionListItemProps) {
  const [copied, setCopied] = useState(false)

  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isSolicitado = !solicitud.estado || estadoNorm === "solicitado"
  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4

  const prioridadStyle = getPrioridadBadgeStyles(
    solicitud.prioridad?.nivel ?? 1,
  )
  const adjuntosCount = solicitud.adjuntos?.length ?? 0

  // Fetch workflow actions for this item
  const actionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitud.processInstanceId),
    enabled: Boolean(solicitud.processInstanceId),
  })

  const actions = actionsQuery.data?.actions ?? []
  const taskName = actionsQuery.data?.taskName

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
        "group flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 transition-all duration-200 cursor-pointer border-l-4 hover:bg-muted/40 select-none",
        isCritica
          ? "border-l-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]"
          : "border-l-amber-500 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]",
      )}
    >
      {/* Left / Main info */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {/* Top Badges Line */}
        <div className="flex flex-wrap items-center gap-2">
          {solicitud.numero ? (
            <div
              onClick={copyNumero}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border/80 hover:border-primary/50 transition-colors cursor-pointer shadow-2xs"
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
              <span>Por Aprobar</span>
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
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
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border shrink-0",
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
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border shrink-0",
                getTipoMantenimientoBadgeClass(
                  solicitud.tipoMantenimiento.nombre,
                  false,
                ),
              )}
            >
              <Wrench className="size-3" />
              <span>{solicitud.tipoMantenimiento.nombre}</span>
            </span>
          ) : null}

          {/* Workflow Task Name Badge */}
          {taskName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted/80 text-muted-foreground border border-border/70 truncate">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="truncate">{taskName}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {solicitud.titulo}
        </h3>

        {/* Details Line */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {solicitud.activo && (
            <div className="flex items-center gap-1.5 truncate">
              <Box className="size-3.5 text-primary shrink-0 opacity-80" />
              <span className="font-mono font-bold text-primary text-xs">
                {solicitud.activo.codigo}
              </span>
              <span className="truncate text-foreground font-medium">
                {solicitud.activo.nombre}
              </span>
            </div>
          )}

          {solicitud.solicitante && (
            <div className="flex items-center gap-1.5 truncate">
              <div className="flex size-4.5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[9px] shrink-0 border border-primary/20">
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
              <span>{formatDate(solicitud.fechaSolicitud)}</span>
            </div>
          )}

          {solicitud.fechaEstimadaOt && (
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0">
              <Clock className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong></span>
            </div>
          )}

          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15">
              <Paperclip className="size-3" />
              <span>{adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right / Actions Section */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 shrink-0 self-end md:self-center"
      >
        {/* Dynamic Workflow Actions */}
        {actionsQuery.isLoading ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px]">Cargando acciones...</span>
          </div>
        ) : (
          actions.map((act) => {
            const style = getActionStyle(act)
            const IconComp = style.icon
            return (
              <Button
                key={`${act.variable}-${act.value}`}
                type="button"
                size="sm"
                onClick={() =>
                  onActionSelect(solicitud, act, taskName, actionsQuery.data?.fields)
                }
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-bold transition-all rounded-lg cursor-pointer shadow-2xs hover:scale-[1.02]",
                  style.btnClass,
                )}
              >
                <IconComp className="size-3.5 shrink-0" />
                <span>{act.name}</span>
              </Button>
            )
          })
        )}

        {/* Revisar Expediente (Opens Modal) */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onQuickView(solicitud)}
          className="h-8 gap-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/40 rounded-lg shadow-2xs"
        >
          <Eye className="size-3.5 text-muted-foreground" />
          <span>Ver Expediente</span>
        </Button>
      </div>
    </li>
  )
}
