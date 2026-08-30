import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Layers,
  Loader2,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { cn } from "@/shared/lib/utils"

import type { WorkflowAction, WorkflowField } from "../types/workflow.types"
import { fixWorkflowEncoding, getWorkflowActionVisuals } from "../utils/workflow.utils"
import { WorkflowStatusBadge } from "./WorkflowStatusBadge"

export type WorkflowActionsModalProps = {
  /**
   * Whether the modal is visible
   */
  open: boolean
  /**
   * Callback when modal open state changes
   */
  onOpenChange: (open: boolean) => void
  /**
   * Current workflow task name (e.g. "Aprobar Solicitud", "Validar Mantenimiento")
   */
  taskName?: string | null
  /**
   * Entity status string (e.g. "SOLICITADO", "EN_REVISION", "ASIGNADO")
   */
  status?: string | null
  /**
   * Optional process instance ID or entity ID
   */
  processInstanceId?: string | null
  /**
   * List of available workflow transition actions from Camunda / Backend
   */
  actions?: WorkflowAction[]
  /**
   * Dynamic form fields associated with the current task
   */
  fields?: WorkflowField[]
  /**
   * Whether the actions are currently being fetched
   */
  isLoading?: boolean
  /**
   * Whether the actions should be disabled (e.g. missing prerequisite check)
   */
  disabled?: boolean
  /**
   * Message explaining why actions are disabled
   */
  disabledReason?: string
  /**
   * Callback when the user selects/clicks on a specific action
   */
  onActionSelect: (
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
}

/**
 * Modal genérico que lista de forma clara y visual las acciones disponibles
 * de una tarea de workflow para cualquier módulo del sistema.
 */
export function WorkflowActionsModal({
  open,
  onOpenChange,
  taskName,
  status,
  processInstanceId,
  actions = [],
  fields = [],
  isLoading = false,
  disabled = false,
  disabledReason,
  onActionSelect,
}: WorkflowActionsModalProps) {
  const cleanTaskName = fixWorkflowEncoding(taskName || "")
  const hasActions = actions.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 border-border/80 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b bg-muted/30 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <GitBranch className="size-4.5" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-base font-heading font-bold text-foreground truncate">
                  {cleanTaskName || "Acciones de Workflow"}
                </DialogTitle>
                <div className="flex items-center gap-2 pt-0.5">
                  {status && <WorkflowStatusBadge status={status} size="sm" />}
                  {processInstanceId && (
                    <span className="text-[10.5px] font-mono text-muted-foreground truncate">
                      ID: {processInstanceId.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
            {cleanTaskName
              ? `Selecciona la decisión o acción a ejecutar para el paso "${cleanTaskName}".`
              : "Selecciona una de las acciones disponibles para avanzar con el flujo de trabajo."}
          </DialogDescription>
        </DialogHeader>

        {/* Content / Action List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
              <Loader2 className="size-6 animate-spin text-primary opacity-80" />
              <p className="text-xs text-muted-foreground font-medium">
                Consultando decisiones disponibles del workflow...
              </p>
            </div>
          ) : disabled && disabledReason ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Acciones bloqueadas</strong>
                <span>{disabledReason}</span>
              </div>
            </div>
          ) : !hasActions ? (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-6 text-center space-y-1.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
                <CheckCircle2 className="size-4.5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No hay acciones pendientes
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                Esta tarea no requiere decisiones manuales en este momento o ya fue completada.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="size-3 text-primary" />
                  <span>Decisiones Disponibles ({actions.length})</span>
                </span>
              </div>

              <div className="grid gap-2">
                {actions.map((action) => {
                  const visuals = getWorkflowActionVisuals(action)
                  const ActionIcon = visuals.icon
                  const actionName = fixWorkflowEncoding(action.name || action.value)

                  return (
                    <button
                      key={`${action.variable}-${action.value}`}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onActionSelect(action, cleanTaskName, fields)
                        onOpenChange(false)
                      }}
                      className={cn(
                        "group w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-2xs",
                        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                        "bg-card hover:bg-accent/40 border-border/80 hover:border-primary/40",
                        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg font-bold shrink-0 transition-transform group-hover:scale-105",
                            visuals.btnClass,
                          )}
                        >
                          <ActionIcon className="size-4.5" />
                        </span>

                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {actionName}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10.5px] text-muted-foreground">
                              {action.variable}:
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono px-1 py-0 h-4 font-semibold"
                            >
                              {action.value}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors shrink-0 pl-2">
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-3 border-t bg-muted/20 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold px-3 cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
