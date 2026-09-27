import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  Car,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileIcon,
  FileText,
  Flame,
  History,
  KeyRound,
  MapPin,
  Paperclip,
  Pencil,
  ShieldAlert,
  Tag,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react"

import {
  WorkflowStatusBadge,
  getWorkflowActionVisuals,
  useWorkflowActions,
  type WorkflowAction,
  type WorkflowField,
} from "@/modules/workflow"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import { asignacionVehicularQueries } from "../../asignacion-vehicular/api/asignacion-vehicular.queries"
import { controlActivoVehicularQueries } from "../../control-activo/api/control-activo.queries"
import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

export interface SolicitudVehicularDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudVehicular | null
  onEdit?: (solicitud: SolicitudVehicular) => void
  onDelete?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular, hasControles?: boolean) => void
  onViewHistory?: (solicitud: SolicitudVehicular) => void
  onActionSelect?: (
    solicitud: SolicitudVehicular,
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[]
  ) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getInitials(name?: string): string {
  if (!name) return "SV"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

export function SolicitudVehicularDetailSheet({
  open,
  onOpenChange,
  solicitud,
  onEdit,
  onDelete,
  onAssign,
  onControlActivo,
  onViewHistory,
  onActionSelect,
}: SolicitudVehicularDetailSheetProps) {
  const { actions, fields, taskName } = useWorkflowActions(
    solicitud?.processInstanceId,
    { enabled: Boolean(open && solicitud?.processInstanceId) }
  )

  const asignacionQuery = useQuery({
    ...asignacionVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(open && solicitud?.id),
    staleTime: 1000 * 60 * 2,
  })

  const controlesQuery = useQuery({
    ...controlActivoVehicularQueries.bySolicitud(solicitud?.id ?? ""),
    enabled: Boolean(open && solicitud?.id),
    staleTime: 1000 * 60 * 2,
  })
  const controlesCount = (controlesQuery.data ?? []).length

  if (!solicitud) return null

  const asignacion = asignacionQuery.data?.[0]
  const vehiculo = asignacion?.activo
  const conductor = asignacion?.conductor || solicitud.conductorAsignado
  const responsable = asignacion?.asignadoPor || solicitud.responsableAsignacion
  const solicitante = solicitud.solicitante
  const tipo = solicitud.tipoSolicitudVehicular
  const adjuntos = solicitud.adjuntos ?? []

  const isEmergencia =
    tipo?.codigo?.toUpperCase() === "EMERGENCIA" ||
    (typeof tipo?.diasAnticipacion === "number" && tipo.diasAnticipacion === 0) ||
    Boolean(tipo?.nombre?.toUpperCase().includes("EMERGENCIA"))

  const estadoNorm = (solicitud.estado ?? "").toUpperCase()
  const isCancelled =
    estadoNorm === "CANCELADO" ||
    estadoNorm === "RECHAZADO" ||
    estadoNorm === "ANULADO"
  const isBorrador = estadoNorm === "BORRADOR" || estadoNorm === "PENDIENTE"
  const isObservado = estadoNorm === "OBSERVADO"
  const isEditable = isBorrador || isObservado
  const isDeletable = isBorrador

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-2xl p-0 gap-0 flex flex-col bg-background border-l border-border/80 shadow-2xl"
      >
        {/* CABECERA ESPACIOSA Y LIMPIA */}
        <SheetHeader className="p-5 sm:p-6 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-3 pr-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/25 whitespace-nowrap shadow-2xs">
                {solicitud.numero}
              </span>
              <WorkflowStatusBadge
                status={solicitud.estado || "PENDIENTE"}
                size="md"
              />
              {isEmergencia && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 text-[10.5px] font-bold shadow-2xs">
                  <Flame className="size-3 text-rose-600 dark:text-rose-400 animate-pulse" />
                  <span>EMERGENCIA</span>
                </span>
              )}
            </div>

            {solicitud.auditoria?.createdAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-muted-foreground/70" />
                {formatDate(solicitud.auditoria.createdAt)}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <SheetTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug tracking-tight">
              {solicitud.motivo}
            </SheetTitle>
            {solicitud.destino && (
              <SheetDescription className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-foreground/90">{solicitud.destino}</span>
              </SheetDescription>
            )}
          </div>

          {/* Banner de Emergencia destacada */}
          {isEmergencia && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-xs font-semibold shadow-xs animate-in fade-in-50">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <Flame className="size-4 animate-pulse text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-rose-700 dark:text-rose-300">Solicitud de Emergencia (Salida Inmediata)</p>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 font-normal">
                  Requiere atención prioritaria. No requiere días de anticipación y los respaldos pueden adjuntarse posteriormente.
                </p>
              </div>
            </div>
          )}

          {/* Banner de tarea actual de Workflow */}
          {taskName && !isCancelled && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <span className="text-muted-foreground font-medium">Paso actual del flujo:</span>
              <span className="font-semibold text-primary">{taskName}</span>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs">
              <ShieldAlert className="size-4 shrink-0" />
              <span className="font-semibold">Solicitud {estadoNorm.toLowerCase()}: El proceso fue cancelado o rechazado.</span>
            </div>
          )}
        </SheetHeader>

        {/* CUERPO PRINCIPAL FLUIDO Y ESTRUCTURADO */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 divide-y divide-border/40 text-xs sm:text-sm">
          {/* SECCIÓN 1: SOLICITANTE Y TIPO */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground/70" />
              Solicitante y Clasificación
            </h4>

            <div className="flex items-center gap-3 bg-card/60 p-3 rounded-xl border border-border/60 shadow-2xs">
              <Avatar className="size-10 shrink-0 border border-border/70">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(solicitante?.nombreCompleto)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">
                  {solicitante?.nombreCompleto || "No especificado"}
                </div>
                <div className="text-xs text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                  {solicitante?.cargo && <span>{solicitante.cargo}</span>}
                  {solicitante?.cargo && solicitante?.area && <span>•</span>}
                  {solicitante?.area && <span className="font-medium text-foreground/80">{solicitante.area}</span>}
                </div>
              </div>
            </div>

            {tipo && (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {isEmergencia ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-md border border-rose-500/40 shadow-2xs">
                    <Flame className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                    <span>{tipo.nombre}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 bg-muted/80 px-2.5 py-1 rounded-md border border-border/70">
                    <Tag className="size-3 text-primary shrink-0" />
                    <span>{tipo.nombre}</span>
                  </span>
                )}
                {tipo.diasAnticipacion !== undefined && (
                  <span className={cn("text-xs font-medium", isEmergencia ? "text-rose-700 dark:text-rose-400 font-semibold" : "text-muted-foreground")}>
                    ({tipo.diasAnticipacion === 0 ? "Inmediato - Sin anticipación" : `${tipo.diasAnticipacion} días de anticipación`})
                  </span>
                )}
                {tipo.requiereRespaldo && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10.5px] px-1.5 py-0.5",
                      isEmergencia
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    )}
                  >
                    {isEmergencia ? "Respaldo opcional (posterior)" : "Req. Respaldo"}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: ITINERARIO Y PROGRAMACIÓN */}
          <div className="pt-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground/70" />
              Itinerario y Datos de Viaje
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground block">Fecha de Salida</span>
                <span className="font-semibold text-foreground text-xs sm:text-sm">
                  {formatDate(solicitud.fechaSalida)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground block">Retorno Estimado</span>
                <span className="font-semibold text-foreground text-xs sm:text-sm">
                  {formatDate(solicitud.fechaRetornoEstimada)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground block">Destino</span>
                <span className="font-semibold text-foreground text-xs sm:text-sm">
                  {solicitud.destino}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground block">Pasajeros Requeridos</span>
                <span className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  {solicitud.cantidadPasajeros} {solicitud.cantidadPasajeros === 1 ? "persona" : "personas"}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ASIGNACIÓN Y CONDUCTOR */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-muted-foreground/70" />
                Asignación Técnica Vehicular
              </h4>
              {vehiculo || conductor ? (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-xs font-semibold">
                  Asignado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
                  Pendiente de Asignación
                </Badge>
              )}
            </div>

            {vehiculo || conductor ? (
              <div className="space-y-2.5">
                {/* Tarjeta de Vehículo Asignado */}
                {vehiculo ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/60 shadow-2xs">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Car className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Vehículo / Unidad Móvil
                      </span>
                      <div className="font-semibold text-foreground text-sm truncate">
                        {vehiculo.nombre}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="text-[10.5px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {vehiculo.codigo}
                        </code>
                        {vehiculo.placa && (
                          <span className="text-[10.5px] font-mono font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            Placa: {vehiculo.placa}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-dashed border-border/70 text-muted-foreground text-xs italic">
                    Vehículo pendiente de asignación
                  </div>
                )}

                {/* Tarjeta de Conductor Designado */}
                {conductor ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/60 shadow-2xs">
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                        {getInitials(conductor.nombreCompleto || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Conductor Designado
                      </span>
                      <div className="font-semibold text-foreground text-sm">
                        {conductor.nombreCompleto}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Licencia: <strong className="text-foreground/90">{conductor.numeroLicencia || "No registrada"}</strong>
                        {conductor.categoriaLicencia && ` (Cat. ${conductor.categoriaLicencia})`}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-dashed border-border/70 text-muted-foreground text-xs italic">
                    Conductor pendiente de asignación
                  </div>
                )}

                {asignacion?.observacion && (
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
                    <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                      Observaciones de asignación:
                    </span>
                    <p className="text-foreground/90">{asignacion.observacion}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/20 border border-dashed border-border/70 text-muted-foreground text-xs">
                <span>Aún no se ha asignado chofer ni vehículo</span>
                {onAssign && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      onAssign(solicitud)
                    }}
                    className="h-7 text-xs font-semibold gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 cursor-pointer shadow-2xs"
                  >
                    <KeyRound className="size-3" />
                    <span>Asignar Ahora</span>
                  </Button>
                )}
              </div>
            )}

            {responsable && (
              <div className="text-xs text-muted-foreground flex items-center justify-between px-1 pt-1">
                <span>Responsable de asignación:</span>
                <strong className="text-foreground">{responsable.nombreCompleto}</strong>
              </div>
            )}
          </div>

          {/* SECCIÓN 4: JUSTIFICACIÓN / OBSERVACIONES */}
          {(solicitud.justificacion || solicitud.observacion) && (
            <div className="pt-4 space-y-3">
              {solicitud.justificacion && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCheck className="size-3.5 text-purple-500" />
                    Justificación del Viaje
                  </span>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed pl-3 border-l-2 border-purple-500/50 py-1 bg-muted/15 rounded-r-lg">
                    {solicitud.justificacion}
                  </p>
                </div>
              )}

              {solicitud.observacion && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground" />
                    Observaciones Adicionales
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-3 border-l-2 border-border py-1 bg-muted/15 rounded-r-lg">
                    {solicitud.observacion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 5: ARCHIVOS ADJUNTOS */}
          <div className="pt-4 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Paperclip className="size-3.5 text-muted-foreground/70" />
              Documentos Adjuntos ({adjuntos.length})
            </h4>

            {adjuntos.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-1">
                No hay documentos adjuntos en esta solicitud.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {adjuntos.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-card/70 border border-border/60 hover:bg-card transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon className="size-4 text-primary shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-xs font-semibold text-foreground truncate"
                          title={adj.nombreOriginal || adj.nombreArchivo}
                        >
                          {adj.nombreOriginal || adj.nombreArchivo}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground font-mono">
                          {formatFileSize(adj.size)}
                        </span>
                      </div>
                    </div>

                    {adj.url && (
                      <a
                        href={adj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer border border-border/60"
                        title="Descargar archivo"
                      >
                        <Download className="size-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 6: TRAZABILIDAD RÁPIDA */}
          {onViewHistory && (
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewHistory(solicitud)}
                className="w-full h-8.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 justify-between px-3 rounded-lg cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <History className="size-3.5 text-blue-500" />
                  <span>Ver Historial Completo de Tareas y Firmas</span>
                </span>
                <ChevronRight className="size-3.5 opacity-60" />
              </Button>
            </div>
          )}
        </div>

        {/* PIE DE ACCIONES PRINCIPALES (EN UNA SOLA FILA) */}
        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-lg px-3"
            >
              Cerrar
            </Button>

            {onAssign && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onAssign(solicitud)
                }}
                className="h-8 text-xs font-semibold rounded-lg gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 cursor-pointer px-3 shadow-2xs"
              >
                <KeyRound className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Asignar</span>
              </Button>
            )}

            {onControlActivo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onControlActivo(solicitud, controlesCount > 0)
                }}
                className={cn(
                  "h-8 text-xs font-semibold rounded-lg gap-1.5 cursor-pointer px-3 shadow-2xs",
                  controlesCount > 0
                    ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                )}
              >
                {controlesCount > 0 ? (
                  <Eye className="size-3.5 text-sky-600 dark:text-sky-400" />
                ) : (
                  <ClipboardCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>{controlesCount > 0 ? "Ver Control Activo" : "Control Activo"}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón Eliminar si es Borrador/Pendiente */}
            {isDeletable && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(solicitud)
                }}
                className="h-8 text-xs font-semibold rounded-lg gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 border-destructive/30 cursor-pointer px-3 shadow-2xs"
              >
                <Trash2 className="size-3.5 text-destructive" />
                <span>Eliminar</span>
              </Button>
            )}

            {/* Botones de acción directa del Workflow */}
            {isEditable && actions.length > 0 && onActionSelect && (
              <div className="flex items-center gap-2">
                {actions.map((action) => {
                  const visual = getWorkflowActionVisuals(action)
                  const ActionIcon = visual.icon
                  return (
                    <Button
                      key={`${action.variable}-${action.value}`}
                      size="sm"
                      onClick={() => {
                        onOpenChange(false)
                        onActionSelect(solicitud, action, taskName, fields)
                      }}
                      className={cn(
                        "h-8 text-xs font-semibold gap-1.5 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs px-3",
                        visual.btnClass
                      )}
                    >
                      <ActionIcon className="size-3.5" />
                      <span>{action.name}</span>
                    </Button>
                  )
                })}
              </div>
            )}

            {isEditable && onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(solicitud)
                }}
                className="h-8 text-xs font-semibold rounded-lg gap-1.5 shadow-2xs cursor-pointer px-3"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
                <span>Editar</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
