import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  SendHorizontal,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { controlActivoQueries } from "@/modules/mantenimientos/control-activo/api/control-activo.queries"
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

import type { WorkflowAction, WorkflowField } from "@/modules/workflow"
import { solicitudQueries } from "../../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../../api/solicitud.service"
import {
  extractPlaca,
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
  getTipoMantenimientoBadgeClass,
} from "../../lib/solicitud.utils"

type SolicitudListItemProps = {
  solicitud: SolicitudMantenimiento
  onEdit: (solicitud: SolicitudMantenimiento) => void
  onQuickView: (solicitud: SolicitudMantenimiento) => void
  onDelete: (solicitud: SolicitudMantenimiento) => void
  onEnviar?: (solicitud: SolicitudMantenimiento) => void
  onWorkflowAction?: (
    solicitud: SolicitudMantenimiento,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}

export function SolicitudListItem({
  solicitud,
  onEdit,
  onQuickView,
  onDelete,
  onEnviar,
  onWorkflowAction,
}: SolicitudListItemProps) {
  const [copied, setCopied] = useState(false)

  const estadoNorm = (solicitud.estado ?? "").toLowerCase().trim()
  const isBorrador = estadoNorm === "borrador"
  const isObservado = estadoNorm === "observado"
  const isEditable = isBorrador || isObservado
  const isSolicitado = estadoNorm === "solicitado"
  const isTrabajoRealizado = estadoNorm === "trabajo_realizado"
  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const placa = extractPlaca(solicitud.activo)

  const controlesQuery = useQuery({
    ...controlActivoQueries.list({ size: 100 }),
    enabled: Boolean(isTrabajoRealizado && solicitud.id),
  })

  const hasDevolucion = Boolean(
    controlesQuery.data?.content?.some(
      (c) =>
        c.solicitudMantenimientoId === solicitud.id &&
        c.tipo === "DEVOLUCION",
    ),
  )

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
  const isUpdated = Boolean(updatedAt && updatedAt !== createdAt)

  function copyNumero(e: React.MouseEvent) {
    e.stopPropagation()
    if (!solicitud.numero) return
    navigator.clipboard.writeText(solicitud.numero)
    setCopied(true)
    toast.success(`Folio "${solicitud.numero}" copiado al portapapeles`)
    setTimeout(() => setCopied(false), 2000)
  }

  const wfActionsQuery = useQuery({
    ...solicitudQueries.workflowActions(solicitud.processInstanceId),
    enabled: Boolean(isObservado && solicitud.processInstanceId && onWorkflowAction),
  })
  const reenviarAction = wfActionsQuery.data?.actions?.find(
    (a) =>
      a.value === "REPROCESAR" ||
      a.value === "CORREGIR" ||
      a.value === "ENVIAR" ||
      a.name?.toLowerCase().includes("reenviar") ||
      a.name?.toLowerCase().includes("corregir"),
  ) ?? wfActionsQuery.data?.actions?.[0]

  return (
    <li
      onClick={() => onQuickView(solicitud)}
      className={cn(
        "group relative flex flex-col justify-between gap-2.5 p-3 sm:px-4 sm:py-3 transition-all cursor-pointer hover:bg-muted/35",
        isSolicitado && "bg-amber-500/[0.02]",
        isObservado && "bg-orange-500/[0.03]",
        isBorrador && "bg-muted/[0.15]",
      )}
    >
      {/* Floating Action Island on Hover (Desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2.5 right-3 z-10 hidden sm:flex items-center gap-1 bg-background/95 backdrop-blur-md border border-border/80 rounded-lg p-1 shadow-md transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 -translate-y-1"
      >
        {/* Botón Enviar destacado si está en Borrador */}
        {isBorrador && onEnviar ? (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => onEnviar(solicitud)}
            className="h-6.5 gap-1 px-2 text-[11px] font-semibold text-primary border-primary/40 bg-primary/10 hover:bg-primary/20 shadow-2xs cursor-pointer"
            title="Enviar solicitud para aprobación"
          >
            <SendHorizontal className="size-3" />
            <span>Enviar</span>
          </Button>
        ) : null}

        {/* Botón Reenviar destacado si está en Observado */}
        {isObservado && reenviarAction && onWorkflowAction ? (
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() =>
              onWorkflowAction(
                solicitud,
                reenviarAction,
                wfActionsQuery.data?.taskName,
                wfActionsQuery.data?.fields,
              )
            }
            className="h-6.5 gap-1 px-2 text-[11px] font-semibold text-orange-600 dark:text-orange-400 border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 shadow-2xs cursor-pointer"
            title="Reenviar solicitud corregida para aprobación"
          >
            <SendHorizontal className="size-3" />
            <span>Reenviar</span>
          </Button>
        ) : null}

        {/* Botón Registrar Devolución si está en TRABAJO_REALIZADO */}
        {isTrabajoRealizado && (
          hasDevolucion ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Devolución Lista</span>
            </span>
          ) : (
            <Link
              to="/mantenimientos/controles-activos/nuevo"
              search={{
                solicitudId: solicitud.id,
                tipo: "DEVOLUCION",
              }}
              onClick={(e) => e.stopPropagation()}
            >

              <Button
                type="button"
                size="xs"
                className="h-6.5 gap-1 px-2 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-2xs cursor-pointer"
                title="Registrar Devolución de Activo para cerrar el mantenimiento"
              >
                <ClipboardCheck className="size-3" />
                <span>Devolución</span>
              </Button>
            </Link>
          )
        )}

        {/* Botón Ver Detalles */}
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => onQuickView(solicitud)}
          className="h-6.5 gap-1 px-2 text-[11px] font-medium hover:bg-muted cursor-pointer"
          title="Ver detalles completos"
        >
          <Eye className="size-3 text-primary" />
          <span>Detalles</span>
        </Button>

        {/* Botón Editar (En Borrador u Observado) */}
        {isEditable && (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onEdit(solicitud)}
            className="h-6.5 gap-1 px-2 text-[11px] font-medium hover:bg-muted cursor-pointer"
            title="Editar solicitud"
          >
            <Pencil className="size-3 text-muted-foreground" />
            <span>Editar</span>
          </Button>
        )}

        {/* Botón Eliminar (Solo en Borrador) */}
        {isBorrador && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={() => onDelete(solicitud)}
            className="size-6.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Eliminar solicitud"
          >
            <Trash2 className="size-3 text-destructive/80" />
          </Button>
        )}
      </div>

      {/* Top Row: Folio, Title, Status Badges & Mobile Menu */}
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        {/* Left container: Folio + Title + Status Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 flex-1 sm:pr-12">
          {/* Folio Chip */}
          {solicitud.numero ? (
            <div
              onClick={copyNumero}
              className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 border border-border/70 hover:border-primary/50 hover:bg-muted transition-colors shrink-0"
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
            className="font-heading font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors text-left truncate max-w-xs sm:max-w-md md:max-w-lg cursor-pointer"
          >
            {solicitud.titulo}
          </button>

          {/* Estado Badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.2 text-[10px] font-semibold capitalize shrink-0 shadow-2xs",
              estadoStyle,
            )}
          >
            {isSolicitado ? "En Revisión" : solicitud.estado}
          </span>

          {/* Prioridad Badge */}
          {solicitud.prioridad ? (
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-1.5 py-0.2 text-[10px] font-semibold shrink-0 shadow-2xs",
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
                "inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold border shrink-0 shadow-2xs",
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

          {/* Estado de Devolución Chip visible en fila si aplica */}
          {isTrabajoRealizado && (
            hasDevolucion ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-md shrink-0 sm:group-hover:hidden transition-all">
                <CheckCircle2 className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>Devolución Lista</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded-md shrink-0 sm:group-hover:hidden transition-all">
                <ClipboardCheck className="size-2.5 text-amber-600 dark:text-amber-400" />
                <span>Devolución Pendiente</span>
              </span>
            )
          )}
        </div>

        {/* Mobile Action Dropdown */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex sm:hidden items-center gap-1 shrink-0"
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 rounded-md text-muted-foreground hover:text-foreground shrink-0"
                />
              }
            >
              <MoreVertical className="size-3.5" />
              <span className="sr-only">Más opciones</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
              <DropdownMenuItem
                onClick={() => onQuickView(solicitud)}
                className="text-xs cursor-pointer py-1.5"
              >
                <Eye className="size-3.5 mr-2 text-primary" />
                Ver Detalles
              </DropdownMenuItem>
              {isEditable && (
                <DropdownMenuItem
                  onClick={() => onEdit(solicitud)}
                  className="text-xs cursor-pointer py-1.5"
                >
                  <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                  Editar Solicitud
                </DropdownMenuItem>
              )}
              {isBorrador && onEnviar ? (
                <DropdownMenuItem
                  onClick={() => onEnviar(solicitud)}
                  className="text-xs text-primary focus:text-primary cursor-pointer py-1.5 font-medium"
                >
                  <SendHorizontal className="size-3.5 mr-2" />
                  Enviar Solicitud
                </DropdownMenuItem>
              ) : null}
              {isObservado && reenviarAction && onWorkflowAction ? (
                <DropdownMenuItem
                  onClick={() =>
                    onWorkflowAction(
                      solicitud,
                      reenviarAction,
                      wfActionsQuery.data?.taskName,
                      wfActionsQuery.data?.fields,
                    )
                  }
                  className="text-xs text-orange-600 focus:text-orange-600 cursor-pointer py-1.5 font-medium"
                >
                  <SendHorizontal className="size-3.5 mr-2" />
                  Reenviar Solicitud
                </DropdownMenuItem>
              ) : null}
              {isTrabajoRealizado && !hasDevolucion && (
                <DropdownMenuItem
                  render={
                    <Link
                      to="/mantenimientos/controles-activos/nuevo"
                      search={{
                        solicitudId: solicitud.id,
                        tipo: "DEVOLUCION",
                      }}
                    />
                  }
                  className="text-xs text-amber-600 focus:text-amber-600 cursor-pointer py-1.5 font-medium"
                >
                  <ClipboardCheck className="size-3.5 mr-2" />
                  Devolución Activo
                </DropdownMenuItem>
              )}
              {isBorrador && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs text-destructive focus:text-destructive cursor-pointer py-1.5"
                    onClick={() => onDelete(solicitud)}
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Middle Row: Activo (con Placa), Falla y Descripción */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs min-w-0">
        {/* Activo con Placa */}
        {solicitud.activo ? (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-foreground border border-border/50 max-w-md truncate">
            <Box className="size-3 shrink-0 text-primary opacity-90" />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Activo:</span>
            <span className="font-mono font-bold text-[11px] text-primary">
              {solicitud.activo.codigo}
            </span>
            <span className="text-foreground/90 truncate font-medium">
              {solicitud.activo.nombre}
            </span>
            {placa ? (
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                Placa: {placa}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Tipo de Falla */}
        {solicitud.tipoFallas ? (
          <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded shrink-0">
            <AlertTriangle className="size-2.5 shrink-0" />
            <span className="text-[10px] opacity-80 font-medium uppercase">Falla:</span>
            <span className="truncate max-w-[200px] font-semibold">{solicitud.tipoFallas}</span>
          </div>
        ) : null}

        {/* Descripción corta */}
        {solicitud.descripcion ? (
          <p className="line-clamp-1 text-[11.5px] text-muted-foreground/80 leading-relaxed flex-1 min-w-[200px]" title={solicitud.descripcion}>
            <span className="text-foreground/70 font-medium">Desc: </span>
            {solicitud.descripcion}
          </p>
        ) : null}
      </div>

      {/* Bottom Row: Solicitante, Aprobador, Responsable, Fechas y Adjuntos */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
        {/* Solicitante */}
        {solicitud.solicitante ? (
          <span className="inline-flex items-center gap-1 text-[11px] truncate max-w-[220px]">
            <User className="size-3 text-muted-foreground/70 shrink-0" />
            <span className="text-muted-foreground/80">Solicita:</span>
            <strong className="truncate font-semibold text-foreground/90">{solicitud.solicitante.nombre}</strong>
          </span>
        ) : null}

        {/* Aprobado Por */}
        {solicitud.aprobadoPor ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium truncate max-w-[220px]">
            <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Aprobó:</span>
            <strong className="truncate font-semibold">{solicitud.aprobadoPor.nombre}</strong>
          </span>
        ) : null}

        {/* Responsable Técnico */}
        {solicitud.responsable ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 font-medium truncate max-w-[220px]">
            <UserCheck className="size-3 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Resp:</span>
            <strong className="truncate font-semibold">{solicitud.responsable.nombre}</strong>
          </span>
        ) : null}

        {/* Fecha Solicitud */}
        {solicitud.fechaSolicitud ? (
          <span className="inline-flex items-center gap-1 text-[11px]">
            <Clock className="size-3 text-muted-foreground/70 shrink-0" />
            <span>{formatDateTime(solicitud.fechaSolicitud)}</span>
          </span>
        ) : null}

        {/* Fecha Estimada OT */}
        {solicitud.fechaEstimadaOt ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-1.5 py-0.2 text-[10.5px] font-medium">
            <Calendar className="size-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Est. OT: <strong>{formatDate(solicitud.fechaEstimadaOt)}</strong></span>
          </span>
        ) : null}

        {/* Adjuntos */}
        {adjuntosCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-bold shrink-0">
            <Paperclip className="size-2.5 shrink-0" />
            <span>
              {adjuntosCount} {adjuntosCount === 1 ? "adjunto" : "adjuntos"}
            </span>
          </span>
        )}

        {/* Indicador modificado */}
        {isUpdated && (
          <span className="text-[10px] text-muted-foreground/60 italic ml-auto hidden md:inline">
            Editado: {formatDate(updatedAt)}
          </span>
        )}
      </div>
    </li>
  )
}
