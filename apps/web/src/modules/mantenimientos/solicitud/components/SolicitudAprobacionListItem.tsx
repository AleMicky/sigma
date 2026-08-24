import { useState } from "react"
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
  FileCheck2,
  Flame,
  Loader2,
  MoreVertical,
  Paperclip,
  Pencil,
  ShieldCheck,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"
import { formatDate, formatDateTime } from "@/shared/utils/date.utils"

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
  onEdit?: (solicitud: SolicitudMantenimiento) => void
}

export function SolicitudAprobacionListItem({
  solicitud,
  onQuickView,
  onActionSelect,
  onEdit,
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

  // Fetch workflow actions if processInstanceId exists
  const actionsQuery = useQuery(
    solicitudQueries.workflowActions(solicitud.processInstanceId),
  )

  const actions = actionsQuery.data?.actions ?? []
  const taskName = actionsQuery.data?.taskName
  const fields = actionsQuery.data?.fields ?? []

  const audit =
    "auditoria" in solicitud && solicitud.auditoria
      ? solicitud.auditoria
      : (solicitud as unknown as {
          createdAt?: string
          updatedAt?: string
          createdBy?: string
          updatedBy?: string
        })
  const createdAt = audit.createdAt ?? solicitud.fechaSolicitud ?? ""
  const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
  const createdBy = audit.createdBy ?? null
  const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

  function copyNumero(e: React.MouseEvent) {
    e.stopPropagation()
    if (!solicitud.numero) return
    navigator.clipboard.writeText(solicitud.numero)
    setCopied(true)
    toast.success(`Folio "${solicitud.numero}" copiado al portapapeles`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group flex flex-col justify-between gap-3.5 p-4 sm:p-4.5 transition-all cursor-pointer hover:bg-muted/30",
        isCritica
          ? "bg-rose-500/[0.02] hover:bg-rose-500/[0.05]"
          : isAsignado
            ? "bg-sky-500/[0.02] hover:bg-sky-500/[0.05]"
            : "bg-amber-500/[0.02] hover:bg-amber-500/[0.05]",
      )}
    >
      {/* Main Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Icon & Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Icon Badge */}
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105",
              isCritica
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : isAsignado
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
            )}
          >
            {isCritica ? (
              <Flame className="size-5" />
            ) : isAsignado ? (
              <Wrench className="size-5" />
            ) : (
              <ShieldCheck className="size-5" />
            )}
          </div>

          {/* Info Container */}
          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            {/* Line 1: Folio, Title & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Folio Chip with Copy */}
              {solicitud.numero ? (
                <div
                  onClick={copyNumero}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-2 py-0.5 border border-border/70 hover:border-primary/50 transition-colors"
                  title="Copiar folio"
                >
                  <code className="font-mono text-[11px] font-bold text-foreground/90">
                    {solicitud.numero}
                  </code>
                  <span className="inline-flex size-3.5 items-center justify-center rounded text-muted-foreground hover:text-foreground">
                    {copied ? (
                      <Check className="size-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-2.5" />
                    )}
                  </span>
                </div>
              ) : null}

              {/* Title */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickView(solicitud)
                }}
                className="font-heading font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors text-left truncate max-w-lg cursor-pointer"
              >
                {solicitud.titulo}
              </button>

              {/* Estado Badge */}
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

              {/* Prioridad Badge */}
              {solicitud.prioridad ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                    prioridadStyle,
                  )}
                >
                  {solicitud.prioridad.nombre}
                </span>
              ) : null}

              {/* Tipo Mantenimiento Badge */}
              {solicitud.tipoMantenimiento ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0",
                    getTipoMantenimientoBadgeClass(
                      solicitud.tipoMantenimiento.nombre,
                      false,
                    ),
                  )}
                >
                  <Wrench className="size-2.5 shrink-0" />
                  <span>{solicitud.tipoMantenimiento.nombre}</span>
                </span>
              ) : null}

              {/* Task name indicator if available */}
              {taskName && (
                <div className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/60 truncate">
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      isAsignado ? "bg-sky-500" : "bg-amber-500",
                    )}
                  />
                  <span className="truncate">{taskName}</span>
                </div>
              )}
            </div>

            {/* Line 2: Activo, Responsable, Motivo y Descripción */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {solicitud.activo ? (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-foreground border border-border/50 max-w-sm truncate">
                  <Box className="size-3 shrink-0 text-primary opacity-90" />
                  <span className="font-mono font-bold text-[11px] text-primary">
                    {solicitud.activo.codigo}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {solicitud.activo.nombre}
                  </span>
                </div>
              ) : null}

              {solicitud.responsable ? (
                <div className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 px-2 py-0.5 text-[11px]">
                  <UserCheck className="size-3 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">
                    Responsable: <strong>{solicitud.responsable.nombre}</strong>
                  </span>
                </div>
              ) : null}

              {solicitud.motivoMantenimiento ? (
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Motivo:</span>{" "}
                  {solicitud.motivoMantenimiento}
                </span>
              ) : null}

              {solicitud.descripcion ? (
                <p className="line-clamp-1 text-xs text-muted-foreground/80 leading-relaxed">
                  {solicitud.descripcion}
                </p>
              ) : null}
            </div>

            {/* Line 3: Solicitante, Fecha, Adjuntos */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
              {solicitud.solicitante ? (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <User className="size-3 text-muted-foreground/70" />
                  <span>{solicitud.solicitante.nombre}</span>
                </span>
              ) : null}

              {solicitud.fechaSolicitud ? (
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3 text-muted-foreground/70" />
                  <span>{formatDate(solicitud.fechaSolicitud)}</span>
                </span>
              ) : null}

              {adjuntosCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                  <Paperclip className="size-3" />
                  <span>
                    {adjuntosCount} adjunto{adjuntosCount > 1 ? "s" : ""}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Workflow Actions & Buttons */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap items-center gap-1.5 shrink-0 self-end lg:self-center pt-1 lg:pt-0"
        >
          {/* Dynamic Workflow Actions Buttons */}
          {actionsQuery.isLoading ? (
            <div className="flex items-center gap-1.5 h-7.5 px-2.5 rounded-lg bg-muted/40 border text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span className="text-[11px]">Cargando...</span>
            </div>
          ) : actions.length > 0 ? (
            actions.map((act) => {
              const actName = (act.name ?? "").toLowerCase()
              const actVal = (act.value ?? "").toUpperCase()
              const isAprobar =
                actVal.includes("APROB") || actName.includes("aprobar")
              const isObservar =
                actVal.includes("OBSERV") || actName.includes("observar")
              const isRechazar =
                actVal.includes("RECHAZ") ||
                actVal.includes("CANCEL") ||
                actName.includes("rechazar")

              return (
                <Button
                  key={`${act.variable}-${act.value}`}
                  type="button"
                  size="xs"
                  onClick={() => onActionSelect(solicitud, act, taskName, fields)}
                  className={cn(
                    "h-7.5 gap-1.5 px-3 text-xs font-semibold shadow-2xs transition-all cursor-pointer",
                    isAprobar
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : isObservar
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : isRechazar
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground",
                  )}
                >
                  {isAprobar ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : isObservar ? (
                    <AlertCircle className="size-3.5 shrink-0" />
                  ) : isRechazar ? (
                    <AlertOctagon className="size-3.5 shrink-0" />
                  ) : (
                    <FileCheck2 className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{act.name}</span>
                </Button>
              )
            })
          ) : null}

          {/* Botón Ver Expediente / Detalles */}
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => onQuickView(solicitud)}
            className="h-7.5 gap-1.5 px-2.5 text-xs font-medium hover:bg-muted/80 shadow-2xs cursor-pointer"
            title="Revisar expediente completo"
          >
            <Eye className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Expediente</span>
          </Button>

          {/* Botón Editar si se provee */}
          {onEdit && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onEdit(solicitud)}
              className="h-7.5 gap-1.5 px-2.5 text-xs font-medium hover:bg-muted/80 shadow-2xs cursor-pointer hidden md:inline-flex"
              title="Editar solicitud"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Editar</span>
            </Button>
          )}

          {/* Dropdown Menu para opciones adicionales en móvil */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  />
                }
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Más opciones</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                <DropdownMenuItem
                  onClick={() => onQuickView(solicitud)}
                  className="text-xs cursor-pointer py-2"
                >
                  <Eye className="size-3.5 mr-2 text-primary" />
                  Revisar Expediente
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(solicitud)}
                    className="text-xs cursor-pointer py-2"
                  >
                    <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                    Editar Solicitud
                  </DropdownMenuItem>
                )}
                {actions.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {actions.map((act) => (
                      <DropdownMenuItem
                        key={`dropdown-${act.variable}-${act.value}`}
                        onClick={() =>
                          onActionSelect(solicitud, act, taskName, fields)
                        }
                        className="text-xs cursor-pointer py-2 font-medium"
                      >
                        <FileCheck2 className="size-3.5 mr-2 text-primary" />
                        {act.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Bottom Audit Row */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 border-t border-border/30 text-[11px] text-muted-foreground/75 font-normal">
        {createdAt ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 text-muted-foreground/50 shrink-0" />
            <span>
              <strong className="font-medium text-muted-foreground">Creado:</strong>{" "}
              {formatDateTime(createdAt)}
              {createdBy ? ` por ${createdBy}` : ""}
            </span>
          </div>
        ) : null}

        {updatedAt && updatedAt !== createdAt ? (
          <div className="flex items-center gap-1.5">
            <Clock className="size-3 text-muted-foreground/50 shrink-0" />
            <span>
              <strong className="font-medium text-muted-foreground">
                Actualizado:
              </strong>{" "}
              {formatDateTime(updatedAt)}
              {updatedBy ? ` por ${updatedBy}` : ""}
            </span>
          </div>
        ) : null}
      </div>
    </li>
  )
}
