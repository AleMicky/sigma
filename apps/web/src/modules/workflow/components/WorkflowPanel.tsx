import * as React from "react"
import {
  Clock,
  Loader2,
  MessageSquareWarning,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { WorkflowAction, WorkflowField } from "../types/workflow.types"
import { fixWorkflowEncoding, getWorkflowActionVisuals } from "../utils/workflow.utils"
import { WorkflowStatusBadge } from "./WorkflowStatusBadge"

export type WorkflowResponsableInfo = {
  nombre?: string | null
  cargo?: string | null
  codigo?: string | null
}

export type WorkflowPanelProps = {
  /**
   * Process instance ID from Camunda engine. If not provided or null, displays "Draft" state.
   */
  processInstanceId?: string | null
  /**
   * Current status of the entity (e.g. PENDIENTE, EN_REVISION, OBSERVADO, etc.)
   */
  status?: string | null
  /**
   * Label for the status badge (optional, defaults to status)
   */
  statusLabel?: string
  /**
   * Current active task name in the workflow
   */
  taskName?: string | null
  /**
   * Available workflow transition actions
   */
  actions?: WorkflowAction[]
  /**
   * Dynamic form fields associated with the current task
   */
  fields?: WorkflowField[]
  /**
   * Whether the workflow decisions query is currently loading
   */
  isLoading?: boolean
  /**
   * Optional active observation / correction comment to display in a dedicated callout
   */
  observacion?: string | React.ReactNode | null
  /**
   * Responsable / technician / approver info or custom React node
   */
  responsable?: WorkflowResponsableInfo | React.ReactNode | null
  /**
   * Whether the action buttons should be disabled (e.g. missing prerequisite check)
   */
  disabled?: boolean
  /**
   * Tooltip / message explaining why actions are disabled
   */
  disabledReason?: string
  /**
   * Empty state message when there are no manual actions pending
   */
  emptyMessage?: string
  /**
   * Callback when a user clicks on an action button
   */
  onActionSelect?: (
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  /**
   * Slot for extra buttons/elements in the header (e.g., Trazabilidad / Historial button)
   */
  headerActions?: React.ReactNode
  /**
   * Slot for custom banners, prerequisite callouts, or content before the action buttons
   */
  children?: React.ReactNode
  /**
   * Additional container CSS classes
   */
  className?: string
}

export function WorkflowPanel({
  processInstanceId,
  status,
  statusLabel,
  taskName,
  actions = [],
  fields = [],
  isLoading = false,
  observacion,
  responsable,
  disabled = false,
  disabledReason,
  emptyMessage = "No hay acciones manuales pendientes en esta etapa.",
  onActionSelect,
  headerActions,
  children,
  className,
}: WorkflowPanelProps) {
  // If no processInstanceId is present (e.g. Borrador), show draft notice
  if (!processInstanceId) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/80 bg-muted/20 p-3.5 flex items-center justify-between gap-3",
          className,
        )}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Clock className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Flujo no iniciado (Borrador)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Este registro está en borrador y debe ser enviado para activar el flujo de trabajo.
            </p>
          </div>
        </div>
        {headerActions}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/25 bg-card p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all",
        className,
      )}
    >
      {/* Header: Current Task & Status Badge */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs mt-0.5">
              <ShieldCheck className="size-4.5" />
              <span className="absolute -top-0.5 -right-0.5 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-primary" />
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tarea Actual del Flujo
                </span>
                {status && (
                  <WorkflowStatusBadge
                    status={status}
                    label={statusLabel}
                    size="sm"
                  />
                )}
              </div>
              <h3 className="font-heading text-xs sm:text-sm md:text-base font-bold text-foreground leading-snug">
                {taskName ? fixWorkflowEncoding(taskName) : "En Proceso de Evaluación"}
              </h3>
            </div>
          </div>

          {/* Optional Header Actions (e.g. Ver Historial / Trazabilidad) */}
          {headerActions && (
            <div className="shrink-0 flex items-center gap-1.5">
              {headerActions}
            </div>
          )}
        </div>

        {/* Observation / Motivo Banner (if provided) */}
        {observacion && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 sm:p-3 text-amber-950 dark:text-amber-200">
            <MessageSquareWarning className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Observación / Motivo
              </span>
              {typeof observacion === "string" ? (
                <p className="text-xs text-foreground/90 italic leading-relaxed whitespace-pre-wrap">
                  "{observacion}"
                </p>
              ) : (
                observacion
              )}
            </div>
          </div>
        )}

        {/* Responsable status pill (if provided) */}
        {responsable && (
          <div>
            {React.isValidElement(responsable) ? (
              responsable
            ) : typeof responsable === "object" && (responsable as WorkflowResponsableInfo).nombre ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 px-3 py-1.5 text-xs w-fit">
                <UserCheck className="size-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="text-[11.5px]">
                  Responsable:{" "}
                  <strong className="text-foreground">
                    {(responsable as WorkflowResponsableInfo).nombre}
                  </strong>
                  {(responsable as WorkflowResponsableInfo).cargo ? (
                    <span className="text-muted-foreground ml-1 font-normal">
                      ({(responsable as WorkflowResponsableInfo).cargo})
                    </span>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Custom Body Slots (e.g. Callouts, Extra Actions) */}
        {children}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-2 border-t border-border/50">
        {isLoading ? (
          <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>Consultando decisiones disponibles...</span>
          </div>
        ) : actions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-0.5">
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((act) => {
              const visual = getWorkflowActionVisuals(act)
              const IconComponent = visual.icon
              const isActionDisabled = disabled

              return (
                <Button
                  key={`${act.variable}-${act.value}`}
                  type="button"
                  size="sm"
                  disabled={isActionDisabled}
                  onClick={() => {
                    if (isActionDisabled) return
                    onActionSelect?.(act, taskName ?? undefined, fields)
                  }}
                  className={cn(
                    "h-8.5 gap-1.5 px-3.5 text-xs font-bold transition-all rounded-xl cursor-pointer",
                    isActionDisabled
                      ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground ring-0"
                      : visual.btnClass,
                  )}
                  title={
                    isActionDisabled && disabledReason
                      ? disabledReason
                      : fixWorkflowEncoding(act.name)
                  }
                >
                  <IconComponent className="size-3.5 shrink-0" />
                  <span>{fixWorkflowEncoding(act.name)}</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
