import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
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
  User,
  UserCheck,
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

function getActionStyle(action: WorkflowAction) {
  const name = (action.name ?? "").toLowerCase()
  const val = (action.value ?? "").toUpperCase()

  if (val.includes("APROB") || name.includes("aprobar")) {
    return {
      icon: CheckCircle2,
      btnClass:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
    }
  }
  if (val.includes("OBSERV") || name.includes("observar")) {
    return {
      icon: AlertCircle,
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
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
  const isAsignado = estadoNorm === "asignado"
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
        "group flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 p-4 transition-all cursor-pointer border-l-4 hover:bg-muted/35 select-none",
        isCritica
          ? "border-l-rose-500 bg-rose-500/[0.02]"
          : isAsignado
            ? "border-l-sky-500 bg-sky-500/[0.02]"
            : "border-l-amber-500 bg-amber-500/[0.02]",
      )}
    >
      {/* Left / Main info */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {/* Top Badges Line */}
        <div className="flex flex-wrap items-center gap-2">
          {solicitud.numero ? (
            <div
              onClick={copyNumero}
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border/80 hover:border-primary/50 transition-colors cursor-pointer"
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

          {/* Estado */}
          {isSolicitado ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Clock className="size-3" />
              Por Aprobar
            </span>
          ) : isAsignado ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300">
              <UserCheck className="size-3" />
              Asignado
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
                "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold border shrink-0",
                prioridadStyle,
              )}
            >
              {solicitud.prioridad.nombre}
            </span>
          ) : null}

          {/* Tipo Mantenimiento */}
          {solicitud.tipoMantenimiento ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border shrink-0",
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border truncate">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="truncate">{taskName}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {solicitud.titulo}
        </h3>

        {/* Asset, Requester & Responsable Line */}
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
              <User className="size-3 text-muted-foreground/70 shrink-0" />
              <span className="truncate">
                Solicitante: <strong className="text-foreground font-medium">{solicitud.solicitante.nombre}</strong>
              </span>
            </div>
          )}

          {solicitud.responsable && (
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-medium truncate">
              <UserCheck className="size-3 shrink-0" />
              <span className="truncate">
                Técnico: <strong>{solicitud.responsable.nombre}</strong>
              </span>
            </div>
          )}

          {solicitud.fechaSolicitud && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3 opacity-70" />
              <span>{formatDate(solicitud.fechaSolicitud)}</span>
            </div>
          )}

          {adjuntosCount > 0 && (
            <div className="inline-flex items-center gap-1 font-bold text-primary">
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
        {actions.map((act) => {
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
                "h-8 gap-1.5 px-3 text-xs font-bold transition-all rounded-lg cursor-pointer",
                style.btnClass,
              )}
            >
              <IconComp className="size-3.5 shrink-0" />
              <span>{act.name}</span>
            </Button>
          )
        })}

        {/* Revisar Expediente (Opens Sheet) */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onQuickView(solicitud)}
          className="h-8 gap-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/40 rounded-lg"
        >
          <Eye className="size-3.5 text-muted-foreground" />
          <span>Ver Expediente</span>
        </Button>
      </div>
    </li>
  )
}
