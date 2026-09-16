import { Clock, History, Loader2, User } from "lucide-react"

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

export function WorkflowHistoryDialog({
  open,
  onOpenChange,
  processInstanceId,
  entityCode,
  title = "Trazabilidad de Workflow",
}: WorkflowHistoryDialogProps) {
  const { items, isLoading, isError, refetch } = useWorkflowHistory(
    processInstanceId,
    { enabled: open && Boolean(processInstanceId) },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/80 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <History className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight truncate">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {entityCode ? `Folio / Código: ${entityCode}` : "Historial cronológico de tareas"}
                </DialogDescription>
              </div>
            </div>
            {processInstanceId && (
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground shrink-0">
                {processInstanceId.substring(0, 8)}...
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Body / Timeline */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Cargando trazabilidad del proceso...</span>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <p className="text-xs text-destructive font-medium">
                No se pudo cargar la trazabilidad del proceso
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs cursor-pointer"
              >
                Reintentar
              </Button>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
              <Clock className="size-8 opacity-40" />
              <p className="text-sm font-medium">Sin historial registrado</p>
              <p className="text-xs">
                Aún no se han completado tareas previas en este flujo de trabajo.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {items.map((item, index) => {
                const isCompleted = Boolean(item.endTime)
                const cleanName = fixWorkflowEncoding(item.taskName || item.taskDefinitionKey || "Tarea")

                return (
                  <div key={item.taskId || index} className="relative group">
                    {/* Timeline bullet indicator */}
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 size-4.5 rounded-full border-2 bg-background flex items-center justify-center transition-all",
                        isCompleted
                          ? "border-emerald-500 text-emerald-500 shadow-xs"
                          : "border-primary text-primary animate-pulse",
                      )}
                    >
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          isCompleted ? "bg-emerald-500" : "bg-primary",
                        )}
                      />
                    </div>

                    {/* Step Card */}
                    <div className="rounded-xl border border-border/60 bg-card p-3 shadow-2xs hover:border-border transition-colors space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {cleanName}
                        </span>
                        <Badge
                          variant={isCompleted ? "secondary" : "default"}
                          className={cn(
                            "text-[10px] px-1.5 py-0 font-medium",
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-primary/10 text-primary border-primary/20",
                          )}
                        >
                          {isCompleted ? "Completada" : "En Progreso"}
                        </Badge>
                      </div>

                      {/* Asignado / Responsable */}
                      {(item.assigneeName || item.assignee) && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <User className="size-3 text-muted-foreground/70" />
                          <span>{item.assigneeName || item.assignee}</span>
                        </div>
                      )}

                      {/* Fechas */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-1 text-[10.5px] text-muted-foreground/80 border-t border-border/30">
                        {item.startTime && (
                          <span>
                            <strong className="text-foreground/70 font-normal">Inicio:</strong>{" "}
                            {formatWorkflowDate(item.startTime)}
                          </span>
                        )}
                        {item.endTime && (
                          <span>
                            <strong className="text-foreground/70 font-normal">Fin:</strong>{" "}
                            {formatWorkflowDate(item.endTime)}
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

        {/* Footer */}
        <div className="p-3 border-t border-border/60 bg-muted/10 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
