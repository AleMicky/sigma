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

  // Evita redundancia si el texto de justificación u observación es idéntico al motivo
  const detalleTexto =
    solicitud.justificacion && solicitud.justificacion !== solicitud.motivo
      ? solicitud.justificacion
      : solicitud.observacion && solicitud.observacion !== solicitud.motivo
        ? solicitud.observacion
        : null

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border/80 bg-card hover:bg-card/90 p-3 sm:p-3.5 shadow-2xs transition-all duration-200 hover:shadow-xs space-y-2.5",
        isEmergencia &&
          "border-l-3.5 border-l-rose-500 bg-rose-500/[0.02] dark:bg-rose-950/[0.12]",
        className
      )}
    >
      {/* 1. CABECERA: Folio, Estado, Badges y Acciones Rápidas */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap shadow-2xs">
            {solicitud.numero}
          </span>
          <WorkflowStatusBadge status={solicitud.estado} size="sm" />
          {isEmergencia ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 text-[10.5px] font-bold shadow-2xs">
              <Flame className="size-2.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>{tipo?.nombre || "Emergencia"}</span>
            </span>
          ) : tipo?.nombre ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 text-foreground/80 px-1.5 py-0.5 text-[10.5px] font-medium border border-border/70 shadow-2xs">
              <Tag className="size-2.5 text-primary" />
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
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
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
              <span>{vehiculo ? "Editar Asignación" : "Asignar Unidad"}</span>
            </Button>
          )}

          {onControlActivo && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onControlActivo(solicitud)
              }}
              className="h-6.5 gap-1 px-2 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs cursor-pointer transition-all"
              title="Inspección y control de accesorios del vehículo"
            >
              <ClipboardCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Control Activo</span>
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
              title="Ver historial de tareas"
            >
              <History className="size-3 text-blue-600 dark:text-blue-400" />
              <span className="hidden xs:inline-block">Trazabilidad</span>
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
              title="Ver detalles completos del viaje"
            >
              <Eye className="size-3 text-primary" />
              <span>Detalle</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. CUERPO: ITINERARIO (IZQUIERDA) + UNIDAD ASIGNADA (DERECHA) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        {/* Columna Izquierda: Motivo, Solicitante e Itinerario */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-2">
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {solicitud.destino && (
              <div className="flex items-center gap-1 font-semibold text-foreground/90 max-w-full truncate">
                <MapPin className="size-3 text-primary shrink-0" />
                <span className="truncate">Destino: {solicitud.destino}</span>
              </div>
            )}
            {solicitanteNombre && (
              <div className="flex items-center gap-1 truncate">
                <User className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">
                  Solicitado por: <strong className="text-foreground/90">{solicitanteNombre}</strong>
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

          {/* Horarios compactos */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 bg-muted/30 p-2 rounded-lg border border-border/40 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="size-3 text-primary shrink-0" />
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
              <Clock className="size-3 text-muted-foreground shrink-0" />
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
        <div className="md:col-span-5 flex flex-col justify-center">
          {vehiculo ? (
            <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-2.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between pb-1 border-b border-amber-500/20 text-[10px]">
                <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Car className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  Unidad Asignada
                </span>
                {asignacion?.fechaAsignacion && (
                  <span className="text-muted-foreground">
                    {formatDate(asignacion.fechaAsignacion)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-xs sm:text-sm text-foreground truncate">
                  {vehiculo.nombre}
                </div>
                {vehiculo.placa && (
                  <span className="font-mono text-[11px] font-black bg-amber-500/20 text-amber-950 dark:text-amber-100 border border-amber-500/40 px-1.5 py-0.5 rounded shadow-2xs tracking-wide shrink-0">
                    {vehiculo.placa}
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
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/[0.04] p-2.5 flex flex-col justify-between gap-2 h-full">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>Unidad y Chofer Pendientes</span>
                </div>
                <p className="text-[10.5px] text-muted-foreground leading-tight">
                  Pendiente de asignación técnica de vehículo.
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
                  className="h-6.5 w-full text-[11px] font-semibold gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border-amber-500/40 shadow-2xs cursor-pointer transition-all"
                >
                  <KeyRound className="size-3" />
                  <span>Asignar Vehículo Ahora</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. FOOTER: WORKFLOW ACTION BUTTONS (MÓVIL RESPONSIVE) */}
      {actions.length > 0 && onActionSelect && (
        <div className="pt-2 border-t border-border/40 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 bg-muted/20 -mx-3 sm:-mx-3.5 -mb-3 sm:-mb-3.5 p-2 sm:px-3.5 rounded-b-xl">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Paso actual:</span>
            <strong className="text-primary font-semibold truncate">{taskName || "En Proceso"}</strong>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {actions.map((action) => {
              const visual = getWorkflowActionVisuals(action)
              const ActionIcon = visual.icon
              return (
                <Button
                  key={`${action.variable}-${action.value}`}
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onActionSelect(solicitud, action, taskName, fields)
                  }}
                  className={cn(
                    "h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs w-full xs:w-auto justify-center",
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
