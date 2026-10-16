import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  Car,
  ClipboardCheck,
  Clock,
  Compass,
  Eye,
  Flag,
  Flame,
  Fuel,
  Gauge,
  GitBranch,
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

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { conductorQueries } from "../../conductor/api/conductor.queries"
import { asignacionVehicularQueries } from "../../asignacion-vehicular/api/asignacion-vehicular.queries"
import type { AsignacionVehicular } from "../../asignacion-vehicular/api/asignacion-vehicular.service"
import { cargaCombustibleQueries } from "../../carga-combustible/api/carga-combustible.queries"
import {
  getCargasByActivo,
  getCargasByViaje,
} from "../../carga-combustible/api/carga-combustible.service"
import { controlActivoVehicularQueries } from "../../control-activo/api/control-activo.queries"
import { viajeVehicularKeys } from "../../viaje-vehicular/api/viaje-vehicular.queries"
import {
  getViajeByAsignacion,
  getViajeBySolicitud,
  type ViajeVehicular,
} from "../../viaje-vehicular/api/viaje-vehicular.service"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

function extractPlaca(descripcion?: string | null): string | null {
  if (!descripcion) return null
  try {
    const match = descripcion.match(/PLACA[:\s#-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)*)/i)
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (clean.length >= 2 && clean.length <= 20) {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

function extractModelo(descripcion?: string | null): string | null {
  if (!descripcion) return null
  try {
    const matchMarca = descripcion.match(/Marca\s+([A-Za-z0-9\s-]+?)(?:,|\s*PLACA|\s*Chasis)/i)
    if (matchMarca && matchMarca[1]) {
      const clean = matchMarca[1].trim()
      if (clean.length >= 2 && clean.length <= 40) return clean
    }

    const matchBeforePlaca = descripcion.match(
      /(?:CAMIONETA|VEHICULO|VAGONETA|AUTO|AUTOMOVIL)\s+([A-Za-z0-9\s-]+?)\s+(?:PLACA|NRO|CHASIS)/i
    )
    if (matchBeforePlaca && matchBeforePlaca[1]) {
      const clean = matchBeforePlaca[1].trim()
      if (clean.length >= 2 && clean.length <= 40) return clean
    }

    const matchModelo = descripcion.match(/MODELO(?:\s*(?:N[°o.]*|NRO\.?))?[:\s-]+([0-9A-Za-z]+)/i)
    if (matchModelo && matchModelo[1]) {
      const clean = matchModelo[1].trim()
      if (clean.length >= 2 && clean.length <= 30) return clean
    }

    return null
  } catch {
    return null
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "CD"
  const clean = name.trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export type ConductorViajeListItemProps = {
  solicitud: SolicitudVehicular
  onViewDetail?: (solicitud: SolicitudVehicular) => void
  onSelect?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular, hasControles?: boolean) => void
  onCargaCombustible?: (
    solicitud: SolicitudVehicular,
    viaje?: ViajeVehicular,
    asignacion?: AsignacionVehicular
  ) => void
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
  onCargaCombustible,
  onTraceability,
  onActionSelect,
  className,
}: Readonly<ConductorViajeListItemProps>) {
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

  // Detalle del conductor para foto
  const conductorId = conductor?.id
  const conductorDetailQuery = useQuery({
    ...conductorQueries.detail(conductorId ?? ""),
    enabled: Boolean(conductorId && !conductor?.urlImagen),
    staleTime: 1000 * 60 * 5,
  })
  const conductorFoto = conductor?.urlImagen || conductorDetailQuery.data?.urlImagen
  const conductorNombre = conductor?.nombreCompleto || ""

  // Detalle del activo vehículo para placa, tipo y modelo
  const vehiculoId = vehiculo?.id || asignacion?.activoId
  const activoDetailQuery = useQuery({
    ...activoQueries.detail(vehiculoId ?? ""),
    enabled: Boolean(vehiculoId),
    staleTime: 1000 * 60 * 5,
  })
  const activoDetail = activoDetailQuery.data

  const placaVehiculo =
    vehiculo?.placa ||
    extractPlaca(activoDetail?.descripcion) ||
    extractPlaca(vehiculo?.nombre)
  const modeloVehiculo = extractModelo(activoDetail?.descripcion)
  const tipoVehiculo =
    activoDetail?.tipoActivo?.nombre ||
    vehiculo?.nombre ||
    "Vehículo"
  const vehiculoCodigo = vehiculo?.codigo || activoDetail?.codigo

  // Consulta el viaje vehicular asociado a esta solicitud o asignación
  const viajeQuery = useQuery({
    queryKey: [...viajeVehicularKeys.all, "by-sol-or-asig", solicitud.id, asignacion?.id ?? ""],
    queryFn: async () => {
      if (asignacion?.id) {
        return getViajeByAsignacion(asignacion.id)
      }
      if (solicitud.id) {
        return getViajeBySolicitud(solicitud.id)
      }
      return null
    },
    enabled: Boolean(solicitud.id || asignacion?.id),
    staleTime: 1000 * 60 * 2,
  })
  const viaje = viajeQuery.data
  const estadoNorm = (solicitud.estado ?? "").toUpperCase()
  const isEnRuta =
    estadoNorm === "RETORNO" ||
    estadoNorm === "EN_CURSO" ||
    estadoNorm === "EN_VIAJE"
  const isPrevioSalida =
    estadoNorm === "APROBADO" ||
    estadoNorm === "APROBADA" ||
    estadoNorm === "ASIGNADO" ||
    estadoNorm === "BORRADOR" ||
    estadoNorm === "PENDIENTE"

  // Consulta los controles de activos de esta solicitud
  const controlesQuery = useQuery({
    ...controlActivoVehicularQueries.bySolicitud(solicitud.id),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(solicitud.id),
  })
  const controlesCount = (controlesQuery.data ?? []).length

  // Consulta las cargas de combustible asociadas al viaje o al vehículo (solo una vez iniciado el viaje)
  const viajeId = viaje?.id
  const cargasQuery = useQuery({
    queryKey: viajeId
      ? cargaCombustibleQueries.byViaje(viajeId).queryKey
      : cargaCombustibleQueries.byActivo(vehiculoId ?? "").queryKey,
    queryFn: () => {
      if (viajeId) return getCargasByViaje(viajeId)
      if (vehiculoId) return getCargasByActivo(vehiculoId)
      return []
    },
    enabled: Boolean((viajeId || vehiculoId) && !isPrevioSalida),
    staleTime: 1000 * 60 * 2,
  })
  const cargasCount = (cargasQuery.data ?? []).length

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
        "group relative rounded-xl border border-border/80 bg-card hover:bg-card/90 p-2 sm:p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs space-y-2",
        isEmergencia &&
          "border-l-3.5 border-l-rose-500 bg-rose-500/[0.02] dark:bg-rose-950/[0.12]",
        className
      )}
    >
      {/* 1. CABECERA: Folio, Estado, Badges y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-border/40 pb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap shadow-2xs">
            {solicitud.numero}
          </span>
          <WorkflowStatusBadge status={solicitud.estado} size="sm" />
          {isEmergencia ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-bold shadow-2xs">
              <Flame className="size-2.5 text-rose-600 dark:text-rose-400 animate-pulse" />
              <span>{tipo?.nombre || "Emergencia"}</span>
            </span>
          ) : tipo?.nombre ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/80 text-foreground/80 px-1.5 py-0.5 text-[10px] font-medium border border-border/70 shadow-2xs">
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
          {onTraceability && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onTraceability(solicitud)
              }}
              className="h-6 gap-1 px-1.5 text-[10.5px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 shadow-2xs cursor-pointer transition-all"
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
              className="h-6 gap-1 px-1.5 text-[10.5px] font-medium bg-background hover:bg-muted text-foreground border-border/80 shadow-2xs cursor-pointer transition-all"
              title="Ver detalles completos del viaje"
            >
              <Eye className="size-3 text-primary" />
              <span>Detalle</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. CUERPO: ITINERARIO + UNIDAD ASIGNADA */}
      <div
        className={cn(
          "grid grid-cols-1 gap-2 sm:gap-2.5 items-stretch",
          hasVehiclePanel ? "md:grid-cols-12" : "md:grid-cols-1"
        )}
      >
        {/* Columna Izquierda: Motivo, Solicitante e Itinerario */}
        <div
          className={cn(
            "flex flex-col justify-between space-y-1.5",
            hasVehiclePanel ? "md:col-span-7" : "w-full"
          )}
        >
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground leading-snug tracking-tight">
              {solicitud.motivo}
            </h3>
            {detalleTexto && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 leading-tight">
                {detalleTexto}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-muted-foreground">
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

          {/* Horarios compactos en tarjeta tipo ticket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-muted/25 px-2 py-1.5 rounded-lg border border-border/40 text-[10.5px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="size-3 text-primary shrink-0" />
              <div className="min-w-0 truncate">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">
                  Salida Programada
                </span>
                <span className="font-semibold text-foreground truncate block leading-tight mt-0.5">
                  {formatDate(solicitud.fechaSalida)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="size-3 text-muted-foreground shrink-0" />
              <div className="min-w-0 truncate">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block leading-none">
                  Retorno Estimado
                </span>
                <span className="font-semibold text-foreground truncate block leading-tight mt-0.5">
                  {formatDate(solicitud.fechaRetornoEstimada)}
                </span>
              </div>
            </div>
          </div>

          {/* Registro Real de Salida y Retorno (Viaje en Ruta / Retorno) */}
          {(viaje?.fechaSalidaReal || typeof viaje?.kilometrajeSalida === "number" || isEnRuta) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-amber-500/[0.08] dark:bg-amber-950/25 px-2 py-1.5 rounded-lg border border-amber-500/35 text-[10.5px] shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Gauge className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="min-w-0 truncate">
                  <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-300 block leading-none">
                    Salida Real (Registrada)
                  </span>
                  <span className="font-semibold text-foreground truncate flex items-center gap-1 leading-tight mt-0.5">
                    <span>{viaje?.fechaSalidaReal ? formatDate(viaje.fechaSalidaReal) : "Registrada"}</span>
                    {typeof viaje?.kilometrajeSalida === "number" && (
                      <span className="font-mono text-[9.5px] font-bold text-amber-900 dark:text-amber-200 bg-amber-500/25 px-1 py-0.2 rounded border border-amber-500/30">
                        {viaje.kilometrajeSalida.toLocaleString()} km
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {viaje?.fechaRetornoReal || typeof viaje?.kilometrajeRetorno === "number" ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Flag className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block leading-none">
                      Retorno Real (Finalizado)
                    </span>
                    <span className="font-semibold text-foreground truncate flex items-center gap-1 leading-tight mt-0.5">
                      <span>{viaje?.fechaRetornoReal ? formatDate(viaje.fechaRetornoReal) : "Registrado"}</span>
                      {typeof viaje?.kilometrajeRetorno === "number" && (
                        <span className="font-mono text-[9.5px] font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-500/25 px-1 py-0.2 rounded border border-emerald-500/30">
                          {viaje.kilometrajeRetorno.toLocaleString()} km
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Compass className="size-3 text-amber-600 dark:text-amber-400 animate-spin shrink-0" style={{ animationDuration: "6s" }} />
                  <div className="min-w-0 truncate">
                    <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-300 block leading-none">
                      Estado de Viaje
                    </span>
                    <span className="font-medium text-amber-700 dark:text-amber-300 truncate block leading-tight mt-0.5">
                      {estadoNorm === "RETORNO" || estadoNorm === "EN_RETORNO"
                        ? "En Retorno • Llegada"
                        : "En Ruta • Pendiente"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Tarjeta de Unidad y Conductor Asignado */}
        {hasVehiclePanel && (
          <div className="md:col-span-5 flex flex-col justify-center">
            {vehiculo ? (
              <div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-2 space-y-1 shadow-2xs">
                {/* Header compacto */}
                <div className="flex items-center justify-between text-[9.5px] pb-1 border-b border-amber-500/20">
                  <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <Car className="size-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    Unidad Asignada
                  </span>
                  {asignacion?.fechaAsignacion && (
                    <span className="text-muted-foreground text-[9px]">
                      {formatDate(asignacion.fechaAsignacion)}
                    </span>
                  )}
                </div>

                {/* Datos del vehículo: Placa, Tipo y Modelo */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                    <span
                      className="font-bold text-xs sm:text-[13px] text-foreground truncate leading-tight"
                      title={modeloVehiculo || vehiculo.nombre}
                    >
                      {modeloVehiculo || vehiculo.nombre}
                    </span>
                    {vehiculoCodigo && (
                      <code className="font-mono font-bold text-[9px] text-primary bg-primary/10 px-1 py-0.2 rounded border border-primary/20 shrink-0">
                        {vehiculoCodigo}
                      </code>
                    )}
                    {tipoVehiculo && (
                      <span className="text-[9.5px] text-muted-foreground truncate hidden xs:inline">
                        • {tipoVehiculo}
                      </span>
                    )}
                  </div>

                  {placaVehiculo && (
                    <span className="font-mono text-[10px] font-black bg-amber-500/25 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 border border-amber-500/40 px-1.5 py-0.5 rounded shadow-2xs tracking-wide shrink-0">
                      PLACA: {placaVehiculo}
                    </span>
                  )}
                </div>

                {/* Conductor: Foto, Nombre y Licencia */}
                {conductor && (
                  <div className="pt-1 border-t border-amber-500/20 flex items-center gap-1.5 text-[10.5px]">
                    <div className="relative size-7 shrink-0 rounded-md overflow-hidden border border-border/70 shadow-2xs bg-amber-500/10 flex items-center justify-center">
                      {conductorFoto ? (
                        <AuthenticatedImage
                          src={conductorFoto}
                          alt={conductorNombre || "Conductor"}
                          className="size-full object-cover"
                          fallbackClassName="size-full flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]"
                          fallback={<span>{getInitials(conductorNombre)}</span>}
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                          {conductorNombre ? (
                            <span>{getInitials(conductorNombre)}</span>
                          ) : (
                            <User className="size-3" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-foreground truncate block leading-tight text-[11px]">
                        {conductorNombre}
                      </span>
                      {conductor.numeroLicencia && (
                        <span className="text-[9.5px] text-muted-foreground font-mono truncate block leading-tight">
                          Lic. {conductor.numeroLicencia} ({conductor.categoriaLicencia || "Cat. Regular"})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones Rápidas (Control Activo y Combustible) en una sola fila compacta */}
                {(onControlActivo || (onCargaCombustible && !isPrevioSalida)) && (
                  <div className="pt-1 border-t border-amber-500/20 flex items-center gap-1.5">
                    {onControlActivo && (
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onControlActivo(solicitud, controlesCount > 0)
                        }}
                        className={cn(
                          "h-5.5 gap-1 px-1.5 text-[10px] font-medium shadow-2xs cursor-pointer transition-all flex-1 justify-center",
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
                          <Eye className="size-2.5 text-sky-600 dark:text-sky-400" />
                        ) : (
                          <ClipboardCheck className="size-2.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>{controlesCount > 0 ? `${controlesCount} Control(es)` : "Control Activo"}</span>
                      </Button>
                    )}

                    {onCargaCombustible && !isPrevioSalida && (
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCargaCombustible(
                            solicitud,
                            viaje ?? undefined,
                            asignacion ?? undefined
                          )
                        }}
                        className={cn(
                          "h-5.5 gap-1 px-1.5 text-[10px] font-medium shadow-2xs cursor-pointer transition-all flex-1 justify-center",
                          cargasCount > 0
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-muted hover:bg-amber-500/15 text-foreground/80 hover:text-amber-700 dark:hover:text-amber-300 border-border/70"
                        )}
                        title={
                          cargasCount > 0
                            ? "Ver y gestionar cargas de combustible"
                            : "Registrar carga de combustible"
                        }
                      >
                        <Fuel className="size-2.5 text-amber-600 dark:text-amber-400" />
                        <span>{cargasCount > 0 ? `${cargasCount} Cargas` : "Combustible"}</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/[0.04] p-2 flex flex-col justify-between gap-1.5 h-full">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-[10.5px]">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>Unidad y Chofer Pendientes</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
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
                    className="h-6 w-full text-[11px] font-semibold gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border-amber-500/40 shadow-2xs cursor-pointer transition-all"
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
      {actions.length > 0 && onActionSelect && (
        <div className="pt-1.5 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-muted/20 -mx-2 sm:-mx-2.5 -mb-2 sm:-mb-2.5 px-2 sm:px-2.5 py-1.5 rounded-b-xl">
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <GitBranch className="size-3 text-primary shrink-0 opacity-75" />
            <span>Paso actual del proceso:</span>
            <strong className="text-primary font-semibold truncate">{taskName || "En Proceso"}</strong>
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-end">
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
                    "h-6.5 px-3 text-[11px] font-semibold gap-1 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs w-full sm:w-auto justify-center",
                    visual.btnClass
                  )}
                >
                  <ActionIcon className="size-3" />
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
