import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  Car,
  ClipboardCheck,
  Clock,
  Eye,
  Flame,
  History,
  KeyRound,
  MapPin,
  Paperclip,
  Tag,
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
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

export type ConductorViajeListItemProps = {
  solicitud: SolicitudVehicular
  onViewDetail?: (solicitud: SolicitudVehicular) => void
  onSelect?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular) => void
  onTraceability?: (solicitud: SolicitudVehicular) => void
  onActionSelect?: (
    solicitud: SolicitudVehicular,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[]
  ) => void
  className?: string
}

export function ConductorViajeListItem({
  solicitud,
  onViewDetail,
  onSelect,
  onAssign,
  onControlActivo,
  onTraceability,
  onActionSelect,
  className,
}: ConductorViajeListItemProps) {
  const tipo = solicitud.tipoSolicitudVehicular
  const isEmergencia =
    tipo?.codigo?.toUpperCase() === "EMERGENCIA" ||
    (typeof tipo?.diasAnticipacion === "number" && tipo.diasAnticipacion === 0) ||
    Boolean(tipo?.nombre?.toUpperCase().includes("EMERGENCIA"))

  const { actions, taskName, fields } = useWorkflowActions(
    solicitud.processInstanceId,
    {
      enabled: Boolean(solicitud.processInstanceId),
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

  const solicitanteNombre = solicitud.solicitante?.nombreCompleto || ""
  const adjuntosCount = solicitud.adjuntos?.length ?? 0
  const handleViewDetail = onViewDetail || onSelect

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/80 bg-card/95 hover:bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:shadow-md space-y-4",
        isEmergencia &&
          "border-l-4 border-l-rose-500 bg-rose-500/[0.02] dark:bg-rose-950/[0.15]",
        className
      )}
    >
      {/* 1. CABECERA DEL VIAJE: Folio, Estado, Tipo y Botones de Acción */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 whitespace-nowrap shadow-2xs">
            {solicitud.numero}
          </span>
          <WorkflowStatusBadge status={solicitud.estado} size="sm" />
          {isEmergencia ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 text-xs font-bold shadow-2xs">
              <Flame className="size-3 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>{tipo?.nombre || "Emergencia"}</span>
            </span>
          ) : tipo?.nombre ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 text-foreground/80 px-2 py-0.5 text-xs font-medium border border-border/70 shadow-2xs">
              <Tag className="size-2.5 text-primary" />
              <span>{tipo.nombre}</span>
            </span>
          ) : null}

          {adjuntosCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground border border-border/60"
              title={`${adjuntosCount} archivo(s) adjunto(s)`}
            >
              <Paperclip className="size-2.5 opacity-70" />
              <span>{adjuntosCount}</span>
            </span>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onAssign && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onAssign(solicitud)}
              className="h-7 gap-1.5 px-2.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-2xs cursor-pointer transition-all"
              title="Gestionar asignación vehicular"
            >
              <KeyRound className="size-3 text-amber-600 dark:text-amber-400" />
              <span>{vehiculo ? "Editar Asignación" : "Asignar Unidad"}</span>
            </Button>
          )}

          {onControlActivo && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onControlActivo(solicitud)}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98"
              title="Inspección y control de accesorios del vehículo"
            >
              <ClipboardCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Control Activo</span>
            </Button>
          )}

          {onTraceability && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onTraceability(solicitud)}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs cursor-pointer transition-all"
              title="Ver trazabilidad e historial de tareas"
            >
              <History className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline-block">Trazabilidad</span>
            </Button>
          )}

          {handleViewDetail && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => handleViewDetail(solicitud)}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium bg-background hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Ver detalles completos del viaje"
            >
              <Eye className="size-3.5 text-primary" />
              <span>Detalle</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. CUERPO PRINCIPAL: ITINERARIO + TARJETA DE ASIGNACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Columna Izquierda: Motivo, Destino, Solicitante e Itinerario (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground leading-snug tracking-tight">
              {solicitud.motivo}
            </h3>
            {(solicitud.justificacion || solicitud.observacion) && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {solicitud.justificacion || solicitud.observacion}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {solicitud.destino && (
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>Destino: {solicitud.destino}</span>
              </div>
            )}
            {solicitanteNombre && (
              <div className="flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  Solicitado por: <strong className="text-foreground/90">{solicitanteNombre}</strong>
                </span>
              </div>
            )}
            {solicitud.cantidadPasajeros !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  {solicitud.cantidadPasajeros}{" "}
                  {solicitud.cantidadPasajeros === 1 ? "pasajero" : "pasajeros"}
                </span>
              </div>
            )}
          </div>

          {/* Bloque de Fechas / Itinerario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-xl border border-border/50 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Salida Programada
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(solicitud.fechaSalida)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Retorno Estimado
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(solicitud.fechaRetornoEstimada)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Asignación de Unidad y Conductor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {vehiculo ? (
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Car className="size-3.5 text-amber-600 dark:text-amber-400" />
                  Unidad Asignada
                </span>
                {asignacion?.fechaAsignacion && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(asignacion.fechaAsignacion)}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-bold text-sm text-foreground truncate">
                  {vehiculo.nombre}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {vehiculo.placa && (
                    <span className="font-mono text-xs font-black bg-amber-500/25 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 border border-amber-500/40 px-2 py-0.5 rounded-md shadow-2xs tracking-wide">
                      PLACA: {vehiculo.placa}
                    </span>
                  )}
                  <code className="text-[10.5px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    {vehiculo.codigo}
                  </code>
                </div>
              </div>

              {conductor && (
                <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 text-xs">
                  <User className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-semibold text-foreground truncate block">
                      {conductor.nombreCompleto}
                    </span>
                    {conductor.numeroLicencia && (
                      <span className="text-[10.5px] text-muted-foreground font-mono truncate block">
                        Lic. {conductor.numeroLicencia} ({conductor.categoriaLicencia})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.04] p-3.5 flex flex-col justify-between gap-3 h-full">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>Vehículo y Conductor Pendientes</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Esta solicitud está aprobada pero aún no se le ha asignado una unidad vehicular técnica ni chofer.
                </p>
              </div>

              {onAssign && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onAssign(solicitud)}
                  className="h-8 w-full text-xs font-semibold gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border-amber-500/40 shadow-2xs cursor-pointer transition-all"
                >
                  <KeyRound className="size-3.5" />
                  <span>Asignar Vehículo Ahora</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. FOOTER: BOTONES DE ACCIÓN DE WORKFLOW (REGISTRAR SALIDA / REGISTRAR RETORNO) */}
      {actions.length > 0 && onActionSelect && (
        <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap bg-muted/20 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Paso actual del viaje:</span>
            <strong className="text-primary font-semibold">{taskName || "En Proceso"}</strong>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action) => {
              const visual = getWorkflowActionVisuals(action)
              const ActionIcon = visual.icon
              return (
                <Button
                  key={`${action.variable}-${action.value}`}
                  size="sm"
                  onClick={() => onActionSelect(solicitud, action, taskName, fields)}
                  className={cn(
                    "h-8 text-xs font-bold gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs px-3.5",
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
