import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Loader2,
  Paperclip,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"

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

type SolicitudAprobacionCardProps = {
  solicitud: SolicitudMantenimiento
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onActionSelect: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}

export function SolicitudAprobacionCard({
  solicitud,
  onQuickView,
  onActionSelect,
}: SolicitudAprobacionCardProps) {
  const prioridadStyle = getPrioridadBadgeStyles(
    solicitud.prioridad?.nivel ?? 1,
  )
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const isCritica = (solicitud.prioridad?.nivel ?? 1) >= 4
  const isAsignado = solicitud.estado?.toLowerCase() === "asignado"
  const isSolicitado =
    !solicitud.estado || solicitud.estado.toLowerCase() === "solicitado"

  // Fetch workflow actions if processInstanceId exists
  const actionsQuery = useQuery(
    solicitudQueries.workflowActions(solicitud.processInstanceId),
  )

  const actions = actionsQuery.data?.actions ?? []
  const taskName = actionsQuery.data?.taskName
  const fields = actionsQuery.data?.fields ?? []

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border bg-card p-4 text-card-foreground shadow-2xs transition-all cursor-pointer overflow-hidden hover:shadow-md",
        isCritica
          ? "border-rose-500/40 hover:border-rose-500/80 bg-rose-500/[0.02]"
          : isAsignado
            ? "border-sky-500/40 hover:border-sky-500/80 bg-sky-500/[0.02]"
            : "border-amber-500/40 hover:border-amber-500/80 bg-amber-500/[0.02]",
      )}
    >
      {/* Top Section */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {solicitud.numero ? (
              <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary border border-primary/20">
                {solicitud.numero}
              </code>
            ) : null}

            {isSolicitado ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <Clock className="size-2.5" />
                Por Aprobar
              </span>
            ) : isAsignado ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                <UserCheck className="size-2.5" />
                Asignado
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                  getEstadoBadgeStyles(solicitud.estado),
                )}
              >
                {solicitud.estado}
              </span>
            )}

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

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onQuickView(solicitud)
            }}
            className="size-7 text-primary hover:bg-primary/10 rounded-lg shrink-0"
            title="Revisar Expediente Completo"
          >
            <Eye className="size-4" />
          </Button>
        </div>

        {/* Task name indicator if available */}
        {taskName && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/50 truncate">
            <span
              className={cn(
                "size-1.5 rounded-full shrink-0",
                isAsignado ? "bg-sky-500" : "bg-amber-500",
              )}
            />
            <span className="truncate">{taskName}</span>
          </div>
        )}

        {/* Title and Motivo */}
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {solicitud.titulo}
          </h3>
          {solicitud.motivoMantenimiento ? (
            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
              <span className="text-foreground/80 font-semibold">
                Motivo:
              </span>{" "}
              {solicitud.motivoMantenimiento}
            </p>
          ) : null}
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {solicitud.descripcion}
          </p>
        </div>

        {/* Responsable Info if present */}
        {solicitud.responsable ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 px-2 py-1 text-xs">
            <UserCheck className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate text-[11px]">
              Responsable: <strong className="font-semibold">{solicitud.responsable.nombre}</strong>
            </span>
          </div>
        ) : null}

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


      {/* Footer Info Row & Dynamic Actions */}
      <div className="mt-4 pt-2.5 border-t border-border/60 space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Tipo Mantenimiento */}
          <div className="flex items-center gap-1.5 min-w-0">
            {solicitud.tipoMantenimiento ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border truncate",
                  getTipoMantenimientoBadgeClass(
                    solicitud.tipoMantenimiento.nombre,
                    false,
                  ),
                )}
              >
                <Wrench className="size-3 shrink-0" />
                <span className="truncate">
                  {solicitud.tipoMantenimiento.nombre}
                </span>
              </span>
            ) : null}

            {adjuntosCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                <Paperclip className="size-3" />
                <span>{adjuntosCount}</span>
              </span>
            )}
          </div>

          {/* Solicitante & Fecha */}
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

        {/* Dynamic Workflow Actions Buttons */}
        <div className="pt-1">
          {actionsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 h-8 rounded-lg bg-muted/40 border text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Cargando acciones...</span>
            </div>
          ) : actions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {actions.map((act) => {
                const isAprobar =
                  act.value?.toUpperCase().includes("APROB") ||
                  act.name?.toLowerCase().includes("aprobar")
                const isObservar =
                  act.value?.toUpperCase().includes("OBSERV") ||
                  act.name?.toLowerCase().includes("observar")

                return (
                  <Button
                    key={`${act.variable}-${act.value}`}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onActionSelect(solicitud, act, taskName, fields)
                    }}
                    className={cn(
                      "h-8 gap-1.5 text-xs font-semibold shadow-2xs transition-all",
                      isAprobar
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : isObservar
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground",
                    )}
                  >
                    {isAprobar ? (
                      <CheckCircle2 className="size-3.5 shrink-0" />
                    ) : isObservar ? (
                      <AlertCircle className="size-3.5 shrink-0" />
                    ) : (
                      <FileCheck2 className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate">{act.name}</span>
                  </Button>
                )
              })}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onQuickView(solicitud)
              }}
              className="w-full h-8 gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
            >
              <FileCheck2 className="size-3.5" />
              <span>Revisar Expediente</span>
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
