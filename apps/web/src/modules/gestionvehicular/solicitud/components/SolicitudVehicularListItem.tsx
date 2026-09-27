import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  Car,
  ClipboardCheck,
  Clock,
  Eye,
  Flame,
  GitBranch,
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
  getWorkflowActionVisuals,
  useWorkflowActions,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { WorkflowStatusBadge } from "@/modules/workflow/components/WorkflowStatusBadge"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import { asignacionVehicularQueries } from "../../asignacion-vehicular/api/asignacion-vehicular.queries"
import { controlActivoVehicularQueries } from "../../control-activo/api/control-activo.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

export type SolicitudVehicularListItemProps = {
  solicitud: SolicitudVehicular
  onViewDetail?: (solicitud: SolicitudVehicular) => void
  onSelect?: (solicitud: SolicitudVehicular) => void
  onEdit?: (solicitud: SolicitudVehicular) => void
  onDelete?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular, hasControles?: boolean) => void
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

  const { actions, taskName, fields } = useWorkflowActions(
    solicitud.processInstanceId,
    {
      enabled: Boolean(solicitud.processInstanceId && shouldShowWorkflowActions),
    }
  )

  // Consulta la asignación vehicular técnica (vehículo/placa y conductor)
  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitud.id),
    staleTime: 1000 * 60 * 2,
  })

  const asignacion = asignacionQuery.data?.[0]
  const vehiculo = asignacion?.activo
  const conductor = asignacion?.conductor || solicitud.conductorAsignado

  // Consulta los controles de activos de esta solicitud
  const controlesQuery = useQuery({
    ...controlActivoVehicularQueries.bySolicitud(solicitud.id),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(solicitud.id),
  })
  const controlesCount = (controlesQuery.data ?? []).length

  const solicitanteNombre = solicitud.solicitante?.nombreCompleto || ""
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const handleViewDetail = onViewDetail || onSelect

  // Evita redundancia si el texto de justificación u observación es idéntico al motivo
  const detalleTexto =
    solicitud.justificacion &&
    solicitud.justificacion.trim() !== solicitud.motivo.trim()
      ? solicitud.justificacion
      : solicitud.observacion &&
          solicitud.observacion.trim() !== solicitud.motivo.trim()
        ? solicitud.observacion
        : null

  const hasVehiclePanel = Boolean(vehiculo || onAssign)

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/80 bg-card hover:bg-card/90 p-2.5 sm:p-3.5 shadow-2xs transition-all duration-200 hover:shadow-xs space-y-2.5",
        isEmergencia &&
          "border-l-3.5 border-l-rose-500 bg-rose-500/[0.02] dark:bg-rose-950/[0.12]",
        className
      )}
    >
      {/* 1. CABECERA: Folio, Estado, Badges y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap shadow-2xs">
            {solicitud.numero}
          </span>
          <WorkflowStatusBadge status={solicitud.estado} size="sm" />
          {isEmergencia ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 text-[10.5px] font-bold shadow-2xs">
              <Flame className="size-2.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>{tipo?.nombre || "Emergencia"}</span>
            </span>
          ) : tipo?.nombre ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 text-foreground/80 px-2 py-0.5 text-[10.5px] font-medium border border-border/70 shadow-2xs">
              <Tag className="size-2 text-primary" />
              <span>{tipo.nombre}</span>
            </span>
          ) : null}

          {adjuntosCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60"
              title={`${adjuntosCount} archivo(s) adjunto(s)`}
            >
              <Paperclip className="size-2.5 opacity-70" />
              <span>{adjuntosCount}</span>
            </span>
          )}
        </div>

        {/* Acciones Rápidas Superior */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {onAssign && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAssign(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-2xs cursor-pointer transition-all"
              title="Gestionar asignación vehicular"
            >
              <KeyRound className="size-3 text-amber-600 dark:text-amber-400" />
              <span>{vehiculo ? "Editar Asignación" : "Asignar"}</span>
            </Button>
          )}

          {onTraceability && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onTraceability(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs cursor-pointer transition-all"
              title="Ver historial de tareas de workflow"
            >
              <History className="size-3 text-blue-600 dark:text-blue-400" />
              <span className="hidden xs:inline-block">Historial</span>
            </Button>
          )}

          {handleViewDetail && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetail(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Ver detalles completos de la solicitud"
            >
              <Eye className="size-3 text-primary" />
              <span>Detalle</span>
            </Button>
          )}

          {isEditable && onEdit && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-background hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Editar solicitud"
            >
              <Pencil className="size-3 text-muted-foreground" />
              <span>Editar</span>
            </Button>
          )}

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
              title="Eliminar solicitud"
            >
              <Trash2 className="size-3 text-destructive" />
              <span>Eliminar</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. CUERPO: ITINERARIO + UNIDAD ASIGNADA */}
      <div
        className={cn(
          "grid grid-cols-1 gap-2.5 sm:gap-3 items-stretch",
          hasVehiclePanel ? "md:grid-cols-12" : "md:grid-cols-1"
        )}
      >
        {/* Columna Izquierda: Motivo, Destino, Solicitante e Itinerario */}
        <div
          className={cn(
            "flex flex-col justify-between space-y-2",
            hasVehiclePanel ? "md:col-span-7" : "w-full"
          )}
        >
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug tracking-tight">
              {solicitud.motivo}
            </h3>
            {detalleTexto && (
              <p className="text-[11.5px] text-muted-foreground line-clamp-1 leading-relaxed">
                {detalleTexto}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground">
            {solicitud.destino && (
              <div className="flex items-center gap-1.5 font-semibold text-foreground/90 max-w-full truncate">
                <MapPin className="size-3 text-primary shrink-0" />
                <span className="truncate">Destino: {solicitud.destino}</span>
              </div>
            )}
            {solicitanteNombre && (
              <div className="flex items-center gap-1 truncate">
                <User className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">
                  Solicitante: <strong className="text-foreground/90">{solicitanteNombre}</strong>
                </span>
              </div>
            )}
            {solicitud.cantidadPasajeros !== undefined && (
              <div className="flex items-center gap-1 shrink-0">
                <Users className="size-3 text-muted-foreground shrink-0" />
                <span>
                  {solicitud.cantidadPasajeros}{" "}
                  {solicitud.cantidadPasajeros === 1 ? "pasajero" : "pasajeros"}
                </span>
              </div>
            )}
          </div>

          {/* Horarios compactos en tarjeta tipo ticket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/25 p-2 rounded-lg border border-border/40 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <div className="min-w-0 truncate">
                <span className="text-[9.5px] uppercase font-bold text-muted-foreground block leading-tight">
                  Salida Programada
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {formatDate(solicitud.fechaSalida)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 truncate">
                <span className="text-[9.5px] uppercase font-bold text-muted-foreground block leading-tight">
                  Retorno Estimado
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {formatDate(solicitud.fechaRetornoEstimada)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Unidad y Conductor Asignado */}
        {hasVehiclePanel && (
          <div className="md:col-span-5 flex flex-col justify-center">
            {vehiculo ? (
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-2.5 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] pb-1 border-b border-amber-500/20">
                  <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <Car className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    Unidad Asignada
                  </span>
                  {asignacion?.fechaAsignacion && (
                    <span className="text-muted-foreground text-[9.5px]">
                      {formatDate(asignacion.fechaAsignacion)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {vehiculo.nombre}
                  </div>
                  {vehiculo.placa && (
                    <span className="font-mono text-[11px] font-black bg-amber-500/25 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 border border-amber-500/40 px-2 py-0.5 rounded shadow-2xs tracking-wide shrink-0">
                      PLACA: {vehiculo.placa}
                    </span>
                  )}
                </div>

                {conductor && (
                  <div className="pt-1.5 border-t border-amber-500/20 flex items-center gap-1.5 text-[11px]">
                    <User className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-foreground truncate block leading-tight">
                        {conductor.nombreCompleto}
                      </span>
                      {conductor.numeroLicencia && (
                        <span className="text-[10px] text-muted-foreground font-mono truncate block leading-tight">
                          Lic. {conductor.numeroLicencia} ({conductor.categoriaLicencia || "Cat. Regular"})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {onControlActivo && (
                  <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 min-w-0 truncate">
                      <ClipboardCheck
                        className={cn(
                          "size-3 shrink-0",
                          controlesCount > 0
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      />
                      <span className="truncate">
                        {controlesCount > 0
                          ? `${controlesCount} control(es) de activo`
                          : "Control de activo vehicular"}
                      </span>
                    </span>

                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onControlActivo(solicitud, controlesCount > 0)
                      }}
                      className={cn(
                        "h-6 gap-1 px-2 text-[10.5px] font-medium shadow-2xs cursor-pointer transition-all shrink-0",
                        controlesCount > 0
                          ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      )}
                      title={
                        controlesCount > 0
                          ? "Ver actas de control registradas para editar o eliminar"
                          : "Registrar acta de control de activo vehicular"
                      }
                    >
                      {controlesCount > 0 ? (
                        <Eye className="size-3 text-sky-600 dark:text-sky-400" />
                      ) : (
                        <ClipboardCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>{controlesCount > 0 ? "Ver Control Activo" : "Control Activo"}</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.04] p-2.5 flex flex-col justify-between gap-2 h-full">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>Unidad y Chofer Pendientes</span>
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-tight">
                    Pendiente de asignación técnica de vehículo y chofer.
                  </p>
                </div>

                {onAssign && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssign(solicitud)
                    }}
                    className="h-7 w-full text-xs font-semibold gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border-amber-500/40 shadow-2xs cursor-pointer transition-all"
                  >
                    <KeyRound className="size-3" />
                    <span>Asignar Vehículo Ahora</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. FOOTER PROPORCIONADO: BARRA INFERIOR DE ACCIONES DE WORKFLOW */}
      {shouldShowWorkflowActions && actions.length > 0 && onActionSelect && (
        <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-muted/20 -mx-2.5 sm:-mx-3.5 -mb-2.5 sm:-mb-3.5 p-2 sm:px-3.5 rounded-b-xl">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <GitBranch className="size-3.5 text-primary shrink-0 opacity-75" />
            <span>Paso actual del proceso:</span>
            <strong className="text-primary font-semibold truncate">{taskName || "En Proceso"}</strong>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {actions.map((action) => {
              const visual = getWorkflowActionVisuals(action)
              const ActionIcon = visual.icon
              return (
                <Button
                  key={`${action.variable}-${action.value}`}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onActionSelect(solicitud, action, taskName, fields)
                  }}
                  className={cn(
                    "h-7.5 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs w-full sm:w-auto justify-center",
                    visual.btnClass
                  )}
                >
                  <ActionIcon className="size-3.5" />
                  <span>{action.name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function SolicitudVehicularListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/70 p-2.5 sm:p-3.5 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-md bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted/80" />
          <div className="h-5 w-14 rounded-md bg-muted/60 hidden sm:inline-block" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6.5 w-16 rounded-md bg-muted/70" />
          <div className="h-6.5 w-14 rounded-md bg-muted/50 hidden xs:inline-block" />
        </div>
      </div>
      <div className="space-y-1 my-0.5">
        <div className="h-4.5 w-3/5 max-w-sm rounded-md bg-muted/90" />
        <div className="h-3 w-4/5 max-w-lg rounded-md bg-muted/60" />
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
        <div className="h-3.5 w-32 rounded-md bg-muted/50" />
        <div className="h-3.5 w-24 rounded-md bg-muted/50" />
        <div className="h-3.5 w-16 rounded-md bg-muted/40 ml-auto" />
      </div>
    </div>
  )
}
