import { useState } from "react"
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock,
  Download,
  FileCheck,
  FileIcon,
  FileText,
  History,
  Info,
  KeyRound,
  MapPin,
  Paperclip,
  Pencil,
  ShieldAlert,
  Tag,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import type { SolicitudVehicular } from "../api/solicitud-vehicular.service"

export interface SolicitudVehicularDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud?: SolicitudVehicular | null
  onEdit?: (solicitud: SolicitudVehicular) => void
  onAssign?: (solicitud: SolicitudVehicular) => void
  onControlActivo?: (solicitud: SolicitudVehicular) => void
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

interface StepItem {
  id: string
  label: string
  shortLabel: string
}

const WORKFLOW_STEPS: StepItem[] = [
  { id: "BORRADOR", label: "Solicitud Registrada", shortLabel: "Solicitado" },
  { id: "APROBACION", label: "En Aprobación", shortLabel: "Aprobación" },
  { id: "ASIGNACION", label: "Asignación Vehicular", shortLabel: "Asignado" },
  { id: "EN_RUTA", label: "Servicio en Curso", shortLabel: "En Ruta" },
  { id: "FINALIZADA", label: "Servicio Finalizado", shortLabel: "Completado" },
]

function getActiveStepIndex(estado?: string): number {
  const norm = (estado || "").toUpperCase()
  if (norm === "CANCELADO" || norm === "RECHAZADO" || norm === "ANULADO") return -1
  if (norm === "BORRADOR" || norm === "CREADO") return 0
  if (norm === "PENDIENTE" || norm === "EN_PROCESO" || norm === "OBSERVADO" || norm === "EN_APROBACION") return 1
  if (norm === "APROBADO" || norm === "PENDIENTE_ASIGNACION") return 2
  if (norm === "ASIGNADO" || norm === "EN_RUTA" || norm === "EN_CURSO") return 3
  if (norm === "FINALIZADA" || norm === "COMPLETADA" || norm === "FINALIZADO") return 4
  return 1
}

export function SolicitudVehicularDetailSheet({
  open,
  onOpenChange,
  solicitud,
  onEdit,
  onAssign,
  onControlActivo,
  onViewHistory,
  onActionSelect,
}: SolicitudVehicularDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<string>("general")

  const { actions, fields, taskName } = useWorkflowActions(
    solicitud?.processInstanceId,
    { enabled: Boolean(open && solicitud?.processInstanceId) }
  )

  if (!solicitud) return null

  const solicitante = solicitud.solicitante
  const tipo = solicitud.tipoSolicitudVehicular
  const adjuntos = solicitud.adjuntos ?? []
  const conductor = solicitud.conductorAsignado
  const responsable = solicitud.responsableAsignacion

  const estadoNorm = (solicitud.estado ?? "").toUpperCase()
  const isCancelled =
    estadoNorm === "CANCELADO" ||
    estadoNorm === "RECHAZADO" ||
    estadoNorm === "ANULADO"
  const isBorrador = estadoNorm === "BORRADOR" || estadoNorm === "PENDIENTE"
  const isObservado = estadoNorm === "OBSERVADO"
  const activeStepIdx = getActiveStepIndex(solicitud.estado)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 flex flex-col bg-background"
      >
        {/* ENCABEZADO DEL PANEL LATERAL */}
        <SheetHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/25 shadow-2xs"
              >
                {solicitud.numero}
              </Badge>
              <WorkflowStatusBadge
                status={solicitud.estado || "PENDIENTE"}
                size="md"
              />
            </div>

            {solicitud.auditoria?.createdAt && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 font-mono">
                <Calendar className="size-3 text-muted-foreground/70" />
                {formatDate(solicitud.auditoria.createdAt)}
              </span>
            )}
          </div>

          <div>
            <SheetTitle className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {solicitud.motivo}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {solicitud.destino ? `Destino: ${solicitud.destino}` : "Información y control de la solicitud de vehículo"}
            </SheetDescription>
          </div>

          {/* TIMELINE VISUAL DE WORKFLOW / PROGRESO */}
          <div className="pt-1">
            {isCancelled ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs">
                <ShieldAlert className="size-4 shrink-0" />
                <span className="font-semibold">
                  Solicitud {estadoNorm.toLowerCase()}: El flujo de atención fue suspendido o rechazado.
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card/80 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between relative">
                  {/* Línea de fondo del timeline */}
                  <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-muted z-0" />

                  {WORKFLOW_STEPS.map((step, idx) => {
                    const isPassed = idx < activeStepIdx
                    const isCurrent = idx === activeStepIdx
                    const isPending = idx > activeStepIdx

                    return (
                      <div
                        key={step.id}
                        className="relative z-10 flex flex-col items-center gap-1"
                      >
                        <div
                          className={cn(
                            "flex size-5.5 sm:size-6.5 items-center justify-center rounded-full text-[10.5px] font-bold transition-all shadow-2xs",
                            isPassed &&
                              "bg-emerald-500 text-white shadow-emerald-500/30",
                            isCurrent &&
                              "bg-primary text-primary-foreground ring-3 ring-primary/25 shadow-primary/30 animate-pulse",
                            isPending &&
                              "bg-muted text-muted-foreground/60 border border-border/70"
                          )}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : isCurrent ? (
                            <CircleDot className="size-3.5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[9px] sm:text-[10px] font-medium tracking-tight whitespace-nowrap text-center max-w-14 sm:max-w-18 truncate",
                            isCurrent && "font-bold text-primary",
                            isPassed && "text-foreground font-semibold",
                            isPending && "text-muted-foreground/60"
                          )}
                        >
                          {step.shortLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* PESTAÑAS Y CONTENIDO INTERACTIVO */}
        <div className="flex-1 overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col h-full"
          >
            <div className="px-4 sm:px-5 pt-3 border-b border-border/40 bg-card/50 sticky top-0 z-10">
              <TabsList className="w-full grid grid-cols-5 h-8 bg-muted/60 p-0.5 rounded-lg text-xs">
                <TabsTrigger value="general" className="text-[11px] gap-1 px-1">
                  <Info className="size-3" />
                  <span className="hidden xs:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="itinerario" className="text-[11px] gap-1 px-1">
                  <MapPin className="size-3" />
                  <span className="hidden xs:inline">Itinerario</span>
                </TabsTrigger>
                <TabsTrigger value="asignacion" className="text-[11px] gap-1 px-1">
                  <KeyRound className="size-3" />
                  <span className="hidden xs:inline">Asignación</span>
                </TabsTrigger>
                <TabsTrigger value="adjuntos" className="text-[11px] gap-1 px-1">
                  <Paperclip className="size-3" />
                  <span className="hidden xs:inline">Adjuntos</span>
                  {adjuntos.length > 0 && (
                    <span className="size-3.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                      {adjuntos.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="trazabilidad" className="text-[11px] gap-1 px-1">
                  <History className="size-3" />
                  <span className="hidden xs:inline">Flujo</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-5 flex-1">
              {/* TAB 1: INFORMACIÓN GENERAL Y SOLICITANTE */}
              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tarjeta Solicitante */}
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 p-3.5 shadow-2xs">
                    <Avatar className="size-10 shrink-0 border border-border/70 shadow-2xs">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(solicitante?.nombreCompleto)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Solicitante
                      </span>
                      <span className="font-semibold text-foreground text-xs truncate mt-0.5">
                        {solicitante?.nombreCompleto || "No especificado"}
                      </span>
                      <div className="flex flex-col text-[11px] text-muted-foreground mt-1 space-y-0.5">
                        {solicitante?.cargo && (
                          <span className="truncate flex items-center gap-1">
                            <User className="size-3 text-muted-foreground/80" />
                            {solicitante.cargo}
                          </span>
                        )}
                        {solicitante?.area && (
                          <span className="truncate flex items-center gap-1">
                            <Building2 className="size-3 text-muted-foreground/80" />
                            {solicitante.area}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Tipo de Solicitud */}
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/70 p-3.5 shadow-2xs">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-2xs">
                      <Tag className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Tipo de Solicitud
                      </span>
                      <span className="font-semibold text-foreground text-xs truncate mt-0.5">
                        {tipo?.nombre || "Tipo no asignado"}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {tipo?.diasAnticipacion !== undefined && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {tipo.diasAnticipacion === 0
                              ? "Inmediato"
                              : `${tipo.diasAnticipacion}d anticipación`}
                          </Badge>
                        )}
                        {tipo?.requiereRespaldo && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          >
                            Respaldo
                          </Badge>
                        )}
                        {tipo?.requiereJustificacion && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                          >
                            Justificación
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justificación y Observaciones */}
                <div className="space-y-3">
                  {solicitud.justificacion && (
                    <div className="rounded-xl border border-border/60 p-3.5 bg-card/70 flex flex-col gap-1.5 shadow-2xs">
                      <span className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <FileCheck className="size-3.5 text-purple-500" />
                        Justificación del Servicio
                      </span>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-2.5 rounded-lg border border-border/40">
                        {solicitud.justificacion}
                      </p>
                    </div>
                  )}

                  {solicitud.observacion && (
                    <div className="rounded-xl border border-border/60 p-3.5 bg-card/70 flex flex-col gap-1.5 shadow-2xs">
                      <span className="text-[10.5px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-muted-foreground" />
                        Observaciones Adicionales
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-2.5 rounded-lg border border-border/40">
                        {solicitud.observacion}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 2: ITINERARIO Y RUTA */}
              <TabsContent value="itinerario" className="mt-0 space-y-4">
                <div className="rounded-xl border border-border/60 bg-card/70 p-4 flex flex-col gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                    <MapPin className="size-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground">
                      Detalle del Itinerario y Fechas
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                        Destino Programado
                      </span>
                      <span className="text-sm font-semibold text-foreground bg-primary/5 p-2 rounded-lg border border-primary/20">
                        {solicitud.destino}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] uppercase font-semibold text-muted-foreground">
                        Pasajeros Requeridos
                      </span>
                      <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border/50">
                        <Users className="size-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {solicitud.cantidadPasajeros}{" "}
                          {solicitud.cantidadPasajeros === 1
                            ? "persona"
                            : "personas"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        Fecha y Hora de Salida
                      </span>
                      <span className="text-xs font-medium text-foreground bg-muted/40 p-2 rounded-lg border border-border/50">
                        {formatDate(solicitud.fechaSalida)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10.5px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        Fecha y Hora de Retorno Estimada
                      </span>
                      <span className="text-xs font-medium text-foreground bg-muted/40 p-2 rounded-lg border border-border/50">
                        {formatDate(solicitud.fechaRetornoEstimada)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: ASIGNACIÓN Y CONDUCTOR */}
              <TabsContent value="asignacion" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* Conductor Asignado */}
                  <div className="rounded-xl border border-border/60 bg-card/70 p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-4 text-primary" />
                        <h4 className="text-xs font-bold text-foreground">
                          Conductor Asignado
                        </h4>
                      </div>
                      {conductor ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[10px]"
                        >
                          Asignado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                        >
                          Pendiente de Asignación
                        </Badge>
                      )}
                    </div>

                    {conductor ? (
                      <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/40">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                            {getInitials(conductor.nombreCompleto || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-xs min-w-0">
                          <span className="font-semibold text-foreground">
                            {conductor.nombreCompleto || "Conductor Registrado"}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            Licencia: {conductor.numeroLicencia || "No registrada"}
                            {conductor.categoriaLicencia && ` (Cat. ${conductor.categoriaLicencia})`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-border/70 bg-muted/10 gap-2">
                        <p className="text-xs text-muted-foreground">
                          Aún no se ha asignado vehículo ni conductor a esta solicitud.
                        </p>
                        {onAssign && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onOpenChange(false)
                              onAssign(solicitud)
                            }}
                            className="text-xs gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 cursor-pointer"
                          >
                            <KeyRound className="size-3.5" />
                            <span>Asignar Vehículo Ahora</span>
                          </Button>
                        )}
                      </div>
                    )}

                    {responsable && (
                      <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>Responsable de asignación:</span>
                        <strong className="text-foreground">
                          {responsable.nombreCompleto}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: ADJUNTOS Y RESPALDOS */}
              <TabsContent value="adjuntos" className="mt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Paperclip className="size-3.5 text-primary" />
                    Archivos y Documentos ({adjuntos.length})
                  </h4>
                </div>

                {adjuntos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border/70 bg-muted/10 text-muted-foreground text-xs gap-1 text-center">
                    <FileIcon className="size-8 opacity-40 mb-1" />
                    <p className="font-medium text-foreground/80">
                      Sin archivos adjuntos
                    </p>
                    <p className="text-[11px]">
                      Esta solicitud no incluye archivos de respaldo adjuntos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {adjuntos.map((adj) => (
                      <div
                        key={adj.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border/60 bg-card/70 hover:bg-card transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileIcon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-xs font-semibold text-foreground truncate"
                              title={adj.nombreOriginal || adj.nombreArchivo}
                            >
                              {adj.nombreOriginal || adj.nombreArchivo}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatFileSize(adj.size)}
                            </span>
                          </div>
                        </div>

                        {adj.url && (
                          <a
                            href={adj.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0 cursor-pointer border border-border/60"
                            title="Descargar archivo"
                          >
                            <Download className="size-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB 5: TRAZABILIDAD Y WORKFLOW */}
              <TabsContent value="trazabilidad" className="mt-0 space-y-4">
                <div className="rounded-xl border border-border/60 bg-card/70 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
                    <History className="size-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-foreground">
                      Trazabilidad del Proceso
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                      <span className="text-muted-foreground">Instancia de Proceso:</span>
                      <span className="font-mono text-[11px] font-semibold text-foreground">
                        {solicitud.processInstanceId || "No asociada"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                      <span className="text-muted-foreground">Paso / Tarea Actual:</span>
                      <span className="font-semibold text-primary">
                        {taskName || "En seguimiento de flujo"}
                      </span>
                    </div>

                    {onViewHistory && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onViewHistory(solicitud)
                        }}
                        className="w-full mt-2 gap-2 text-xs font-medium cursor-pointer shadow-2xs"
                      >
                        <History className="size-3.5 text-blue-500" />
                        <span>Abrir Historial Completo de Tareas</span>
                        <ChevronRight className="size-3.5 ml-auto opacity-70" />
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* PIE DEL PANEL LATERAL: ACCIONES PRINCIPALES */}
        <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-lg"
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
                className="text-xs rounded-lg gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-2xs cursor-pointer"
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
                  onControlActivo(solicitud)
                }}
                className="text-xs rounded-lg gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-2xs cursor-pointer"
              >
                <ClipboardCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Control Activo</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Acciones interactivas de Workflow */}
            {actions.length > 0 && onActionSelect && (
              <div className="flex items-center gap-1.5 flex-wrap">
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
                        "text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-102 active:scale-98",
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

            {(isBorrador || isObservado) && onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(solicitud)
                }}
                className="text-xs rounded-lg gap-1.5 shadow-2xs cursor-pointer"
              >
                <Pencil className="size-3 text-muted-foreground" />
                <span>Editar</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
