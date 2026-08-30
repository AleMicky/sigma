import { useState, type MouseEvent, type ReactNode } from "react"
import { Check, Copy, GitBranch, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

import type { WorkflowAction, WorkflowField } from "../types/workflow.types"
import { fixWorkflowEncoding, getWorkflowActionVisuals } from "../utils/workflow.utils"
import { WorkflowStatusBadge } from "./WorkflowStatusBadge"

export type WorkflowListItemProps = {
  /**
   * Identificador o folio (ej. "SM-2026-0016")
   */
  code?: string | null
  /**
   * Estado de la entidad para el badge automático de workflow
   */
  status?: string | null
  /**
   * Etiqueta opcional para el estado
   */
  statusLabel?: string
  /**
   * Process instance ID de Camunda si aplica
   */
  processInstanceId?: string | null
  /**
   * Título principal del elemento
   */
  title: ReactNode
  /**
   * Descripción o detalle corto
   */
  description?: ReactNode
  /**
   * Prioridad o nivel de criticidad
   */
  priority?: {
    level?: number
    label?: string
    isCritical?: boolean
  }
  /**
   * Borde izquierdo de color para destacar items críticos
   */
  isCritical?: boolean
  /**
   * Slot para badges adicionales en la cabecera
   */
  badges?: ReactNode
  /**
   * Slot para campos e información adicional en la parte inferior
   * (ej. persona, activo, fecha estimada, tags, adjuntos)
   */
  extraContent?: ReactNode
  /**
   * Slot para botones de acción adicionales a la derecha (ej. ver expediente, actas, OT)
   */
  extraActions?: ReactNode
  /**
   * Acciones disponibles de workflow (se renderizan como botones directos de acción)
   */
  actions?: WorkflowAction[]
  /**
   * Nombre del paso o tarea actual del workflow
   */
  taskName?: string | null
  /**
   * Campos dinámicos de formulario de la tarea
   */
  fields?: WorkflowField[]
  /**
   * Si las decisiones de workflow están cargando
   */
  isWorkflowLoading?: boolean
  /**
   * Callback cuando el usuario hace clic en un botón de acción de workflow
   */
  onActionSelect?: (
    action: WorkflowAction,
    taskName?: string,
    fields?: WorkflowField[],
  ) => void
  /**
   * Si debe mostrar los botones directos de Workflow
   */
  showWorkflowTrigger?: boolean
  /**
   * Callback de fallback cuando no hay lista explícita de acciones
   */
  onWorkflowTrigger?: () => void
  /**
   * Callback al hacer clic sobre la tarjeta/fila
   */
  onQuickView?: () => void
  /**
   * Clases CSS adicionales para el contenedor <li>
   */
  className?: string
}

export function WorkflowListItem({
  code,
  status,
  statusLabel,
  title,
  description,
  priority,
  isCritical = false,
  badges,
  extraContent,
  extraActions,
  actions = [],
  taskName,
  fields = [],
  isWorkflowLoading = false,
  onActionSelect,
  showWorkflowTrigger = true,
  onWorkflowTrigger,
  onQuickView,
  className,
}: WorkflowListItemProps) {
  const [copied, setCopied] = useState(false)

  const isCrit = isCritical || Boolean(priority?.isCritical) || (priority?.level ?? 1) >= 4
  const cleanTaskName = fixWorkflowEncoding(taskName || "")
  const hasActions = actions.length > 0

  function copyCode(e: MouseEvent) {
    e.stopPropagation()
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`Folio "${code}" copiado`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li
      onClick={() => onQuickView?.()}
      className={cn(
        "group flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-2.5 sm:py-3 sm:px-4 transition-all duration-200 cursor-pointer border-l-4 hover:bg-muted/40 select-none",
        isCrit
          ? "border-l-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]"
          : "border-l-primary/60 bg-primary/[0.01] hover:bg-primary/[0.03]",
        className,
      )}
    >
      {/* Main Column */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Badges Header Line */}
        <div className="flex flex-wrap items-center gap-1.5">
          {code ? (
            <div
              onClick={copyCode}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-foreground border border-border/80 hover:border-primary/50 transition-colors cursor-pointer shadow-2xs"
              title="Copiar folio"
            >
              <span>{code}</span>
              {copied ? (
                <Check className="size-2.5 text-emerald-500" />
              ) : (
                <Copy className="size-2.5 opacity-60" />
              )}
            </div>
          ) : null}

          {status && (
            <WorkflowStatusBadge
              status={status}
              label={statusLabel}
              size="sm"
            />
          )}

          {priority?.label && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border shrink-0",
                isCrit
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-muted text-muted-foreground border-border/70",
              )}
            >
              {isCrit && (
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              )}
              <span>{priority.label}</span>
            </span>
          )}

          {/* Slot para badges personalizados del módulo */}
          {badges}
        </div>

        {/* Title and Description */}
        <div className="space-y-0.5 min-w-0">
          <div className="font-heading font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {title}
          </div>
          {description && (
            <div className="text-[11.5px] text-muted-foreground line-clamp-1">
              {description}
            </div>
          )}
        </div>

        {/* Slot para campos e información adicional */}
        {extraContent && (
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11.5px] text-muted-foreground">
            {extraContent}
          </div>
        )}
      </div>

      {/* Right / Actions Column */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 shrink-0 self-end md:self-center pt-1 md:pt-0"
      >
        {/* Botones extras inyectados por el módulo (ej. Ver expediente, OT, acta) */}
        {extraActions}

        {/* Botones de acción directos de Workflow */}
        {showWorkflowTrigger && (
          isWorkflowLoading ? (
            <div className="size-8 flex items-center justify-center">
              <Loader2 className="size-3.5 animate-spin text-primary opacity-80" />
            </div>
          ) : hasActions ? (
            <div className="flex items-center gap-1">
              {actions.map((action) => {
                const visuals = getWorkflowActionVisuals(action)
                const ActionIcon = visuals.icon
                const actionName = fixWorkflowEncoding(
                  action.name || action.value,
                )

                return (
                  <Button
                    key={`${action.variable}-${action.value}`}
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onActionSelect?.(action, cleanTaskName, fields)
                    }}
                    className={cn(
                      "size-8 rounded-xl shadow-2xs font-bold transition-all hover:scale-105 cursor-pointer",
                      visuals.btnClass,
                    )}
                    title={`Ejecutar decisión: ${actionName}`}
                  >
                    <ActionIcon className="size-4" />
                  </Button>
                )
              })}
            </div>
          ) : onWorkflowTrigger ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onWorkflowTrigger()
              }}
              className="size-8 rounded-xl shadow-2xs bg-primary/5 hover:bg-primary/15 text-primary border-primary/25 cursor-pointer transition-all hover:scale-105"
              title="Opciones de workflow"
            >
              <GitBranch className="size-4 text-primary" />
            </Button>
          ) : null
        )}
      </div>
    </li>
  )
}
