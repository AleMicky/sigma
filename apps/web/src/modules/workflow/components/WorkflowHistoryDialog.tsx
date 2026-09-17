import { useState, type MouseEvent } from "react"
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  FileEdit,
  History,
  Hourglass,
  Loader2,
  PackageCheck,
  RefreshCw,
  Share2,
  ShieldCheck,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"

import { useWorkflowHistory } from "../hooks/useWorkflowHistory"
import { fixWorkflowEncoding } from "../utils/workflow.utils"

export type WorkflowHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  processInstanceId?: string | null
  entityCode?: string | null
  title?: string
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const clean = name.replace(/\[.*?\]/g, "").trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatWorkflowDate(dateString?: string | null): string {
  if (!dateString) return "—"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  } catch {
    return dateString
  }
}

function formatDuration(startTime?: string | null, endTime?: string | null): string | null {
  if (!startTime || !endTime) return null
  try {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    if (isNaN(start) || isNaN(end) || end < start) return null
    const diffMs = end - start
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return "< 1 min"
    if (diffMins < 60) return `${diffMins} min`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours < 24) {
      return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`
    }
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return remHours > 0 ? `${days} d ${remHours} h` : `${days} d`
  } catch {
    return null
  }
}

function getStageVisuals(
  taskName?: string | null,
  taskKey?: string | null,
): { icon: LucideIcon; accentColor: string; bgBadge: string } {
  const norm = ((taskName ?? "") + " " + (taskKey ?? "")).toUpperCase()

  if (norm.includes("BORRADOR") || norm.includes("SOLICITANTE") || norm.includes("CREAR")) {
    return {
      icon: FileEdit,
      accentColor: "text-sky-600 dark:text-sky-400",
      bgBadge: "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300",
    }
  }
  if (norm.includes("REVISAR") || norm.includes("APROBAD") || norm.includes("SOLICITADO")) {
    return {
      icon: ShieldCheck,
      accentColor: "text-indigo-600 dark:text-indigo-400",
      bgBadge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    }
  }
  if (norm.includes("ASIGNAD") || norm.includes("INICIAR") || norm.includes("EJECUTAR") || norm.includes("MANTENIMIENTO")) {
    return {
      icon: Wrench,
      accentColor: "text-amber-600 dark:text-amber-400",
      bgBadge: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    }
  }
  if (norm.includes("REVISION") || norm.includes("SUPERVIS")) {
    return {
      icon: FileCheck2,
      accentColor: "text-purple-600 dark:text-purple-400",
      bgBadge: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    }
  }
  if (norm.includes("VALIDADO") || norm.includes("TRABAJO") || norm.includes("RECIB") || norm.includes("CERR")) {
    return {
      icon: PackageCheck,
      accentColor: "text-emerald-600 dark:text-emerald-400",
      bgBadge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    }
  }

  return {
    icon: Clock,
    accentColor: "text-primary",
    bgBadge: "bg-primary/10 border-primary/30 text-primary",
  }
}

export function WorkflowHistoryDialog({
  open,
  onOpenChange,
  processInstanceId,
  entityCode,
  title = "Trazabilidad de Solicitud",
}: WorkflowHistoryDialogProps) {
  const [copiedFolio, setCopiedFolio] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)

  const { items, isLoading, isFetching, isError, refetch } = useWorkflowHistory(
    processInstanceId,
    { enabled: open && Boolean(processInstanceId) },
  )

  const completedCount = items.filter((i) => Boolean(i.endTime)).length
  const totalCount = items.length
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Cálculo de tiempo acumulado global
  const firstStartTime = items.length > 0 ? items[0].startTime : null
  const lastCompletedEndTime =
    completedCount === totalCount && totalCount > 0
      ? items[items.length - 1].endTime
      : new Date().toISOString()
  const totalCumulativeDuration = formatDuration(firstStartTime, lastCompletedEndTime)

  const handleCopyFolio = (e: MouseEvent) => {
    e.stopPropagation()
    if (!entityCode) return
    navigator.clipboard.writeText(entityCode)
    setCopiedFolio(true)
    toast.success("Folio copiado al portapapeles", { duration: 1500 })
    setTimeout(() => setCopiedFolio(false), 2000)
  }

  const handleCopySummary = () => {
    if (items.length === 0) return

    const header = `📋 TRAZABILIDAD DE WORKFLOW\nFolio: ${entityCode || "N/A"}\nInstancia: ${processInstanceId || "N/A"}\nAvance: ${completedCount}/${totalCount} pasos (${percentCompleted}%)\n${totalCumulativeDuration ? `Tiempo Total: ${totalCumulativeDuration}\n` : ""}----------------------------------------\n`

    const stepsText = items
      .map((item, idx) => {
        const isDone = Boolean(item.endTime)
        const name = fixWorkflowEncoding(item.taskName || item.taskDefinitionKey || "Tarea")
        const dur = formatDuration(item.startTime, item.endTime)
        const lines = [
          `[Paso ${idx + 1}] ${name} (${isDone ? "COMPLETADA" : "EN PROGRESO"})`,
          `  Responsable: ${item.assigneeName || item.assignee || "Sin asignar"}`,
          `  Inicio: ${formatWorkflowDate(item.startTime)}`,
          isDone ? `  Fin: ${formatWorkflowDate(item.endTime)}` : null,
          dur ? `  Duración: ${dur}` : null,
        ].filter(Boolean)
        return lines.join("\n")
      })
      .join("\n\n")

    navigator.clipboard.writeText(header + stepsText)
    setCopiedSummary(true)
    toast.success("Resumen de trazabilidad copiado", { duration: 2000 })
    setTimeout(() => setCopiedSummary(false), 2500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Estructurado */}
        <DialogHeader className="px-5 sm:px-6 pt-4 pb-3.5 border-b border-border/60 bg-muted/20 shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <History className="size-4.5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground leading-snug truncate">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Historial cronológico y trazabilidad de ejecución
                </DialogDescription>
              </div>
            </div>

            {/* Acciones de Cabecera (Refrescar & ID de Proceso) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Actualizar trazabilidad"
                className="size-7 rounded-lg border-border/70 hover:bg-muted cursor-pointer"
              >
                <RefreshCw className={cn("size-3.5 text-muted-foreground", isFetching && "animate-spin text-primary")} />
              </Button>

              {processInstanceId && (
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] text-muted-foreground bg-background px-2 py-0.5"
                  title={`ID de Instancia Flowable: ${processInstanceId}`}
                >
                  {processInstanceId.substring(0, 8)}...
                </Badge>
              )}
            </div>
          </div>

          {/* Badges y Barra de Progreso */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {entityCode && (
                <button
                  type="button"
                  onClick={handleCopyFolio}
                  className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border shadow-2xs hover:border-primary/50 hover:bg-muted/40 cursor-pointer active:scale-95 transition-all"
                  title="Haga clic para copiar folio"
                >
                  <span>{entityCode}</span>
                  {copiedFolio ? (
                    <Check className="size-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="size-3 opacity-40 hover:opacity-100 shrink-0" />
                  )}
                </button>
              )}

              {totalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>
                    {completedCount} de {totalCount} pasos ({percentCompleted}%)
                  </span>
                </span>
              )}

              {totalCumulativeDuration && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
                  <Hourglass className="size-3 text-amber-500" />
                  <span>{totalCumulativeDuration}</span>
                </span>
              )}
            </div>
          </div>

          {/* Micro Progress Line */}
          {totalCount > 0 && (
            <div className="w-full bg-border/60 h-1 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${percentCompleted}%` }}
              />
            </div>
          )}
        </DialogHeader>

        {/* Body / Timeline */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 bg-background">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-14 gap-2.5 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-xs font-medium">Cargando trazabilidad del proceso...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <p className="text-xs text-destructive font-medium">
                No se pudo cargar la trazabilidad del proceso.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs cursor-pointer gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                <span>Reintentar</span>
              </Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
              <Clock className="size-9 opacity-35 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Sin historial registrado</p>
              <p className="text-xs max-w-xs">
                Aún no se han completado transiciones previas en el flujo de trabajo de esta solicitud.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="relative pl-7 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
              {items.map((item, index) => {
                const isCompleted = Boolean(item.endTime)
                const cleanName = fixWorkflowEncoding(item.taskName || item.taskDefinitionKey || "Tarea")
                const duration = formatDuration(item.startTime, item.endTime)
                const visuals = getStageVisuals(item.taskName, item.taskDefinitionKey)
                const StageIcon = visuals.icon

                return (
                  <div key={item.taskId || index} className="relative group">
                    {/* Bullet Indicator en la Línea de Tiempo */}
                    <div
                      className={cn(
                        "absolute -left-7 top-1 size-6 rounded-full border-2 bg-background flex items-center justify-center transition-all shadow-xs z-10",
                        isCompleted
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-primary text-primary animate-pulse bg-primary/5",
                      )}
                    >
                      {isCompleted ? (
                        <Check className="size-3.5 stroke-[2.5]" />
                      ) : (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Tarjeta de Etapa */}
                    <div
                      className={cn(
                        "rounded-xl border p-3.5 shadow-2xs transition-all space-y-2.5",
                        isCompleted
                          ? "border-border/70 bg-card hover:border-border hover:shadow-xs"
                          : "border-primary/40 bg-primary/5 shadow-xs",
                      )}
                    >
                      {/* Cabecera del Paso */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/50">
                            Paso {index + 1}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <StageIcon className={cn("size-3.5 shrink-0", visuals.accentColor)} />
                            <span className="text-xs font-bold text-foreground break-words leading-tight">
                              {cleanName}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={isCompleted ? "secondary" : "default"}
                          className={cn(
                            "text-[10px] px-2 py-0.5 font-semibold shrink-0 gap-1",
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-primary/10 text-primary border-primary/30 animate-pulse",
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
                              <span>En Progreso</span>
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Asignado / Responsable con Avatar */}
                      {(item.assigneeName || item.assignee) && (
                        <div className="flex items-center gap-2 text-xs pt-0.5">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                            {getInitials(item.assigneeName || item.assignee)}
                          </div>
                          <div className="min-w-0 flex-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground truncate">
                              {item.assigneeName || item.assignee}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Fechas e Indicador de Duración */}
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5">
                          {item.startTime && (
                            <span className="flex items-center gap-1">
                              <span className="text-foreground/70 font-medium">Inicio:</span>
                              <span className="text-foreground/90 font-mono text-[10.5px]">
                                {formatWorkflowDate(item.startTime)}
                              </span>
                            </span>
                          )}
                          {item.endTime && (
                            <span className="flex items-center gap-1">
                              <span className="text-foreground/70 font-medium">Fin:</span>
                              <span className="text-foreground/90 font-mono text-[10.5px]">
                                {formatWorkflowDate(item.endTime)}
                              </span>
                            </span>
                          )}
                        </div>

                        {duration && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50"
                            title="Tiempo transcurrido en esta tarea"
                          >
                            <Clock className="size-2.5 text-primary" />
                            <span>{duration}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="p-3 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={items.length === 0}
            onClick={handleCopySummary}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            title="Copiar el resumen completo de la trazabilidad"
          >
            {copiedSummary ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Share2 className="size-3.5" />
            )}
            <span>{copiedSummary ? "Copiado" : "Copiar Historial"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs px-4 cursor-pointer font-medium"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
