import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  History,
  Layers,
  Loader2,
  RotateCw,
  User,
  Workflow,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"
import { formatDateTime } from "@/shared/utils/date.utils"

import { solicitudQueries } from "../../api/solicitud.queries"
import type {
  SolicitudMantenimiento,
  WorkflowHistoryItem,
} from "../../api/solicitud.service"

type SolicitudTrazabilidadModalProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function calculateDuration(
  startTime?: string | null,
  endTime?: string | null,
): string | null {
  if (!startTime) return null
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  if (isNaN(start) || isNaN(end) || end < start) return null

  const diffMs = end - start
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    const remHours = diffHours % 24
    return `${diffDays}d ${remHours}h`
  }
  if (diffHours > 0) {
    const remMin = diffMin % 60
    return `${diffHours}h ${remMin}m`
  }
  if (diffMin > 0) {
    const remSec = diffSec % 60
    return `${diffMin}m ${remSec}s`
  }
  return `${diffSec}s`
}

export function SolicitudTrazabilidadModal({
  solicitud,
  open,
  onOpenChange,
}: SolicitudTrazabilidadModalProps) {
  const [copiedPid, setCopiedPid] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("flowable")

  const processInstanceId = solicitud?.processInstanceId

  const historyQuery = useQuery({
    ...solicitudQueries.workflowHistory(processInstanceId),
    enabled: open && Boolean(processInstanceId),
  })

  const historyItems: WorkflowHistoryItem[] =
    historyQuery.data?.items ?? []

  function copyProcessInstanceId() {
    if (!processInstanceId) return
    navigator.clipboard.writeText(processInstanceId)
    setCopiedPid(true)
    toast.success("ID de proceso Flowable copiado")
    setTimeout(() => setCopiedPid(false), 2000)
  }

  if (!solicitud) return null

  const totalTasks = historyItems.length
  const completedTasks = historyItems.filter(
    (i) => (i.status ?? "").toUpperCase() === "COMPLETADA",
  ).length
  const activeTask = historyItems.find(
    (i) => (i.status ?? "").toUpperCase() === "ACTIVA",
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b space-y-1.5 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8.5 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <History className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-heading font-bold text-foreground leading-tight">
                  Trazabilidad e Historial del Flujo
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-0.5">
                  <span>
                    Expediente: <strong className="text-foreground font-mono">{solicitud.numero || "Sin Folio"}</strong>
                  </span>
                  {processInstanceId && (
                    <button
                      type="button"
                      onClick={copyProcessInstanceId}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 hover:bg-muted font-mono text-[10.5px] text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                      title="Copiar ID de instancia BPMN"
                    >
                      <span>BPMN: {processInstanceId.slice(0, 8)}...</span>
                      {copiedPid ? (
                        <Check className="size-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-2.5 opacity-60" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {processInstanceId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => historyQuery.refetch()}
                disabled={historyQuery.isFetching}
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground shrink-0"
                title="Actualizar historial de Flowable"
              >
                <RotateCw
                  className={cn(
                    "size-3",
                    historyQuery.isFetching && "animate-spin text-primary",
                  )}
                />
                <span className="hidden sm:inline">Refrescar</span>
              </Button>
            )}
          </div>

          <DialogDescription className="text-xs text-muted-foreground">
            Auditoría de tareas ejecutadas en el motor BPMN Flowable e hitos de negocio.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs for Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-3"
        >
          <TabsList className="grid w-full grid-cols-2 h-8.5 bg-muted/60 p-0.5 rounded-xl">
            <TabsTrigger
              value="flowable"
              className="text-xs font-semibold gap-1.5 data-active:bg-background data-active:text-primary data-active:shadow-2xs rounded-lg transition-all"
            >
              <Workflow className="size-3.5" />
              <span>Tareas Flowable ({totalTasks})</span>
            </TabsTrigger>
            <TabsTrigger
              value="hitos"
              className="text-xs font-semibold gap-1.5 data-active:bg-background data-active:text-primary data-active:shadow-2xs rounded-lg transition-all"
            >
              <Layers className="size-3.5" />
              <span>Hitos del Expediente</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Real Flowable Engine Tasks Timeline */}
          <TabsContent value="flowable" className="space-y-3 focus:outline-none">
            {!processInstanceId ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center space-y-1.5">
                <div className="mx-auto flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <AlertCircle className="size-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Flujo de Trabajo no Iniciado
                </h4>
                <p className="text-[11.5px] text-muted-foreground max-w-sm mx-auto">
                  Esta solicitud aún se encuentra en estado borrador. Al ser enviada por primera vez, se generará la instancia en Flowable y se registrará aquí su trazabilidad.
                </p>
              </div>
            ) : historyQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground text-xs">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Consultando historial del motor Flowable...</span>
              </div>
            ) : historyQuery.isError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-center space-y-1">
                <p className="text-xs font-semibold text-destructive">
                  No se pudo cargar el historial de tareas de Flowable.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => historyQuery.refetch()}
                  className="h-7 text-xs mt-1"
                >
                  Reintentar consulta
                </Button>
              </div>
            ) : historyItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Sin tareas históricas registradas
                </p>
                <p className="text-[11px] text-muted-foreground">
                  La instancia {processInstanceId} no reporta actividades registradas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Stats bar */}
                <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[11px]">
                      Completadas: <strong className="text-emerald-600 font-semibold">{completedTasks}</strong>
                    </span>
                    {activeTask && (
                      <span className="text-muted-foreground text-[11px]">
                        Activa: <strong className="text-sky-600 font-semibold">{activeTask.taskName}</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Total: {totalTasks} tareas
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
                  {historyItems.map((task, idx) => {
                    const isCompleted =
                      (task.status ?? "").toUpperCase() === "COMPLETADA"
                    const isActive =
                      (task.status ?? "").toUpperCase() === "ACTIVA"
                    const duration = calculateDuration(
                      task.startTime,
                      task.endTime,
                    )

                    return (
                      <div key={task.taskId || idx} className="relative group">
                        {/* Node icon / indicator */}
                        <div
                          className={cn(
                            "absolute -left-6 top-0 flex size-5.5 items-center justify-center rounded-full border shadow-2xs transition-transform group-hover:scale-110",
                            isCompleted
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : isActive
                                ? "bg-sky-600 text-white border-sky-500 ring-2 ring-sky-500/30"
                                : "bg-muted text-muted-foreground border-border",
                          )}
                        >
                          {isCompleted ? (
                            <Check className="size-3 stroke-[2.5]" />
                          ) : isActive ? (
                            <Activity className="size-3 animate-pulse" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Task Card Content */}
                        <div
                          className={cn(
                            "rounded-xl border p-3 space-y-1.5 transition-all",
                            isActive
                              ? "border-sky-500/50 bg-sky-500/5 shadow-xs ring-1 ring-sky-500/20"
                              : "border-border/70 bg-card hover:border-border",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-foreground">
                                  {task.taskName || task.taskDefinitionKey}
                                </h4>
                                {task.taskDefinitionKey && (
                                  <code className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                                    {task.taskDefinitionKey}
                                  </code>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 border",
                                isCompleted
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                                  : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30 animate-pulse",
                              )}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="size-2.5" />
                                  <span>Completada</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="size-2.5" />
                                  <span>En curso</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Assignee & Dates Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                            {task.assignee ? (
                              <div className="flex items-center gap-1 min-w-0">
                                <User className="size-3 text-primary shrink-0" />
                                <span className="truncate">
                                  Asignado a:{" "}
                                  <strong className="text-foreground">
                                    {task.assigneeName || task.assignee}
                                  </strong>
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground/70">
                                <User className="size-3 opacity-40 shrink-0" />
                                <span className="italic">Sin asignación nominal</span>
                              </div>
                            )}

                            {duration && (
                              <div className="flex items-center gap-1 sm:justify-end text-[10.5px]">
                                <Clock className="size-3 text-primary/70 shrink-0" />
                                <span>
                                  Duración: <strong className="text-foreground">{duration}</strong>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Timestamp Details */}
                          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground/80 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-2.5" />
                              Inicio: {task.startTime ? formatDateTime(task.startTime) : "—"}
                            </span>
                            {task.endTime ? (
                              <span>Fin: {formatDateTime(task.endTime)}</span>
                            ) : (
                              <span className="text-sky-600 font-semibold">
                                Pendiente de finalización
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Business Lifecycle Milestones */}
          <TabsContent value="hitos" className="space-y-3 focus:outline-none">
            <div className="space-y-2.5 divide-y divide-border/40 text-xs">
              {/* 1. Solicitud Registrada */}
              <div className="flex items-start gap-3 pt-2 first:pt-0">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5 font-bold text-xs border border-primary/20">
                  1
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">Solicitud Registrada</p>
                    {solicitud.fechaSolicitud && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaSolicitud)}
                      </span>
                    )}
                  </div>
                  {solicitud.solicitante && (
                    <p className="text-[11px] text-muted-foreground">
                      Solicitante: <strong className="text-foreground">{solicitud.solicitante.nombre}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Evaluación y Aprobación */}
              <div className="flex items-start gap-3 pt-2.5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs border",
                    solicitud.aprobadoPor || solicitud.fechaAprobacion
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  2
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Evaluación y Aprobación
                    </p>
                    {solicitud.fechaAprobacion && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaAprobacion)}
                      </span>
                    )}
                  </div>
                  {solicitud.aprobadoPor ? (
                    <p className="text-[11px] text-muted-foreground">
                      Aprobado por: <strong className="text-foreground">{solicitud.aprobadoPor.nombre}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Pendiente de aprobación
                    </p>
                  )}
                  {solicitud.observacionAprobacion && (
                    <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-2 rounded-lg mt-1 border border-border/50">
                      "{solicitud.observacionAprobacion}"
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Asignación y Mantenimiento */}
              <div className="flex items-start gap-3 pt-2.5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs border",
                    solicitud.responsable || solicitud.fechaInicioMantenimiento
                      ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  3
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Asignación y Ejecución de Mantenimiento
                    </p>
                    {solicitud.fechaInicioMantenimiento && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaInicioMantenimiento)}
                      </span>
                    )}
                  </div>
                  {solicitud.responsable ? (
                    <p className="text-[11px] text-muted-foreground">
                      Técnico Responsable: <strong className="text-foreground">{solicitud.responsable.nombre}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Sin técnico asignado
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Validación y Cierre */}
              <div className="flex items-start gap-3 pt-2.5">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 font-bold text-xs border",
                    solicitud.fechaFinalizacion || solicitud.recibidoPor
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  4
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      Validación y Cierre de Expediente
                    </p>
                    {solicitud.fechaFinalizacion && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaFinalizacion)}
                      </span>
                    )}
                  </div>
                  {solicitud.recibidoPor ? (
                    <p className="text-[11px] text-muted-foreground">
                      Conformidad recibida por: <strong className="text-foreground">{solicitud.recibidoPor.nombre}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      Pendiente de validación / conformidad final
                    </p>
                  )}
                  {solicitud.observacionCierre && (
                    <p className="text-[11px] text-muted-foreground/90 italic bg-muted/40 p-2 rounded-lg mt-1 border border-border/50">
                      "{solicitud.observacionCierre}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold px-4"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
