import {
  Calendar,
  ClipboardCheck,
  Clock,
  Eye,
  Flame,
  History,
  KeyRound,
  MapPin,
  Paperclip,
  Pencil,
  Tag,
  Trash2,
  User,
  Users,
} from "lucide-react"

import {
  WorkflowListItem,
  useWorkflowActions,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

export type SolicitudVehicularListItemProps = {
  solicitud: SolicitudVehicular
  onViewDetail?: (solicitud: SolicitudVehicular) => void
  onSelect?: (solicitud: SolicitudVehicular) => void
  onEdit?: (solicitud: SolicitudVehicular) => void
  onDelete?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular) => void
  onTraceability?: (solicitud: SolicitudVehicular) => void
  onActionSelect?: (
    solicitud: SolicitudVehicular,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[]
  ) => void
  onlyWorkflowActionsOnBorrador?: boolean
  showWorkflowActions?: boolean
  className?: string
}

export function SolicitudVehicularListItem({
  solicitud,
  onViewDetail,
  onSelect,
  onEdit,
  onDelete,
  onAssign,
  onControlActivo,
  onTraceability,
  onActionSelect,
  onlyWorkflowActionsOnBorrador = false,
  showWorkflowActions = true,
  className,
}: SolicitudVehicularListItemProps) {
  const estadoNorm = (solicitud.estado ?? "").trim().toLowerCase()
  const isBorrador = estadoNorm === "borrador" || estadoNorm === "pendiente"
  const isObservado = estadoNorm === "observado"
  const isEditable = isBorrador || isObservado
  const isDeletable = isBorrador

  const tipo = solicitud.tipoSolicitudVehicular
  const isEmergencia =
    tipo?.codigo?.toUpperCase() === "EMERGENCIA" ||
    (typeof tipo?.diasAnticipacion === "number" && tipo.diasAnticipacion === 0) ||
    Boolean(tipo?.nombre?.toUpperCase().includes("EMERGENCIA"))

  const shouldShowWorkflowActions = onlyWorkflowActionsOnBorrador
    ? isEditable
    : showWorkflowActions

  const { actions, taskName, fields, isLoading: isWorkflowLoading } =
    useWorkflowActions(solicitud.processInstanceId, {
      enabled: Boolean(solicitud.processInstanceId && shouldShowWorkflowActions),
    })

  const solicitanteNombre = solicitud.solicitante?.nombreCompleto || ""
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const handleViewDetail = onViewDetail || onSelect

  return (
    <WorkflowListItem
      code={solicitud.numero}
      status={solicitud.estado}
      statusLabel={
        solicitud.estado ? solicitud.estado.replace(/_/g, " ") : undefined
      }
      processInstanceId={solicitud.processInstanceId}
      title={solicitud.motivo}
      description={solicitud.justificacion || solicitud.observacion}
      isCritical={isEmergencia}
      className={cn(
        isEmergencia && "border-l-rose-500 bg-rose-500/[0.04] hover:bg-rose-500/[0.07] dark:bg-rose-950/[0.2] dark:hover:bg-rose-950/[0.3]",
        className
      )}
      badges={
        <>
          {isEmergencia ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 text-[10.5px] font-bold shrink-0 shadow-2xs">
              <Flame className="size-3 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
              <span>{tipo?.nombre || "Emergencia"}</span>
            </span>
          ) : tipo?.nombre ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 text-[10.5px] font-medium text-foreground/80 border border-border/70 shrink-0 shadow-2xs">
              <Tag className="size-2.5 opacity-60 shrink-0 text-primary" />
              <span>{tipo.nombre}</span>
            </span>
          ) : null}

          {solicitud.cantidadPasajeros !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground border border-border/60 shrink-0">
              <Users className="size-2.5 opacity-70 shrink-0" />
              <span>
                {solicitud.cantidadPasajeros}{" "}
                {solicitud.cantidadPasajeros === 1 ? "pasajero" : "pasajeros"}
              </span>
            </span>
          )}

          {adjuntosCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground border border-border/60 shrink-0"
              title={`${adjuntosCount} archivo(s) adjunto(s)`}
            >
              <Paperclip className="size-2.5 opacity-70 shrink-0" />
              <span>{adjuntosCount}</span>
            </span>
          )}
        </>
      }
      actions={shouldShowWorkflowActions ? actions : []}
      taskName={shouldShowWorkflowActions ? taskName : null}
      fields={shouldShowWorkflowActions ? fields : []}
      isWorkflowLoading={shouldShowWorkflowActions ? isWorkflowLoading : false}
      onActionSelect={
        onActionSelect && shouldShowWorkflowActions
          ? (action, tName, flds) =>
              onActionSelect(solicitud, action, tName, flds)
          : undefined
      }
      extraContent={
        <>
          {solicitud.destino && (
            <span
              className="inline-flex items-center gap-1 font-medium text-foreground/90 max-w-xs truncate"
              title={`Destino: ${solicitud.destino}`}
            >
              <MapPin className="size-3 text-primary shrink-0" />
              <span className="truncate">{solicitud.destino}</span>
            </span>
          )}

          {solicitanteNombre && (
            <span
              className="inline-flex items-center gap-1 text-muted-foreground"
              title={`Solicitado por: ${solicitanteNombre}${solicitud.solicitante?.cargo ? ` (${solicitud.solicitante.cargo})` : ""}`}
            >
              <User className="size-3 text-muted-foreground shrink-0" />
              <span className="truncate">{solicitanteNombre}</span>
            </span>
          )}

          {solicitud.fechaSalida && (
            <span
              className="inline-flex items-center gap-1 text-muted-foreground"
              title={`Fecha y hora de salida: ${formatDate(solicitud.fechaSalida)}`}
            >
              <Calendar className="size-3 text-muted-foreground shrink-0" />
              <span>Salida: {formatDate(solicitud.fechaSalida)}</span>
            </span>
          )}

          {solicitud.fechaRetornoEstimada && (
            <span
              className="inline-flex items-center gap-1 text-muted-foreground"
              title={`Retorno estimado: ${formatDate(solicitud.fechaRetornoEstimada)}`}
            >
              <Clock className="size-3 text-muted-foreground shrink-0" />
              <span>Retorno: {formatDate(solicitud.fechaRetornoEstimada)}</span>
            </span>
          )}
        </>
      }
      extraActions={
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botón Asignar (solo en páginas de asignación) */}
          {onAssign && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAssign(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              title="Gestionar asignación de vehículo y conductor"
            >
              <KeyRound className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Asignar</span>
            </Button>
          )}

          {/* Botón Control Activo (solo en páginas de viajes/control) */}
          {onControlActivo && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onControlActivo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              title="Inspección y control de accesorios del vehículo"
            >
              <ClipboardCheck className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Control Activo</span>
            </Button>
          )}

          {/* Botón Trazabilidad */}
          {onTraceability && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onTraceability(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              title="Ver trazabilidad e historial de tareas de workflow"
            >
              <History className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Trazabilidad</span>
            </Button>
          )}

          {/* Botón Ver Detalle */}
          {handleViewDetail && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetail(solicitud)
              }}
              className="h-6.5 gap-1 px-2.5 text-[11.5px] font-medium bg-background/90 hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              title="Ver detalles completos de la solicitud vehicular"
            >
              <Eye className="size-3 text-primary shrink-0" />
              <span>Ver Detalle</span>
            </Button>
          )}

          {/* Botón Editar */}
          {isEditable && onEdit && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background/90 hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title={
                isObservado
                  ? "Editar solicitud vehicular observada"
                  : "Editar solicitud vehicular"
              }
            >
              <Pencil className="size-3 text-muted-foreground shrink-0" />
              <span>Editar</span>
            </Button>
          )}

          {/* Botón Eliminar */}
          {isDeletable && onDelete && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 border-destructive/30 shadow-2xs cursor-pointer transition-all"
              title="Eliminar solicitud vehicular"
            >
              <Trash2 className="size-3 text-destructive shrink-0" />
              <span>Eliminar</span>
            </Button>
          )}
        </div>
      }
      showWorkflowTrigger={
        shouldShowWorkflowActions && Boolean(solicitud.processInstanceId)
      }
    />
  )
}

export function SolicitudVehicularListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/70 p-3 sm:p-4 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 rounded-md bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted/80" />
          <div className="h-5 w-16 rounded-md bg-muted/60 hidden sm:inline-block" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6.5 w-20 rounded-md bg-muted/70" />
          <div className="h-6.5 w-16 rounded-md bg-muted/50 hidden xs:inline-block" />
        </div>
      </div>
      <div className="space-y-1.5 my-0.5">
        <div className="h-5 w-3/5 max-w-sm rounded-md bg-muted/90" />
        <div className="h-3.5 w-4/5 max-w-lg rounded-md bg-muted/60" />
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1.5 border-t border-border/40">
        <div className="h-4 w-36 rounded-md bg-muted/50" />
        <div className="h-4 w-28 rounded-md bg-muted/50" />
        <div className="h-4 w-20 rounded-md bg-muted/40 ml-auto" />
      </div>
    </div>
  )
}
