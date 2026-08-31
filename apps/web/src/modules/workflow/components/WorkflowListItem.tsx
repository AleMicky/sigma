import { useState, type MouseEvent, type ReactNode } from "react"
import {
  AlertTriangle,
  Check,
  Copy,
  Flame,
  GitBranch,
  Hash,
  Loader2,
} from "lucide-react"
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
  const hasWorkflowElements = Boolean(
    showWorkflowTrigger && (isWorkflowLoading || hasActions || onWorkflowTrigger),
  )

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
        "group relative flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-2 sm:py-2.5 sm:px-3.5 transition-all duration-150 cursor-pointer border-l-4 hover:bg-muted/40 select-none",
        isCrit
          ? "border-l-rose-500 bg-rose-500/2 hover:bg-rose-500/5"
          : "border-l-primary/60 bg-primary/[0.015] hover:bg-primary/4",
        className,
      )}
    >
      {/* Main Column */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Badges Header Line */}
        <div className="flex flex-wrap items-center gap-1.5">
          {code ? (
            <div
              onClick={copyCode}
              className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-foreground border border-border/80 hover:border-primary/50 hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              title="Copiar folio"
            >
              <Hash className="size-2.5 text-muted-foreground opacity-70" />
              <span>{code}</span>
              {copied ? (
                <Check className="size-2.5 text-emerald-500" />
              ) : (
                <Copy className="size-2.5 opacity-50 hover:opacity-100 transition-opacity" />
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

          {cleanTaskName && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0"
              title={`Tarea actual: ${cleanTaskName}`}
            >
              <GitBranch className="size-2.5 shrink-0 opacity-80" />
              <span className="truncate max-w-40 sm:max-w-60">{cleanTaskName}</span>
            </span>
          )}

          {priority?.label && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold border shrink-0",
                isCrit
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                  : "bg-muted text-muted-foreground border-border/70",
              )}
            >
              {isCrit ? (
                <Flame className="size-2.5 text-rose-500 shrink-0 animate-pulse" />
              ) : (
                <AlertTriangle className="size-2.5 opacity-60 shrink-0" />
              )}
              <span>{priority.label}</span>
            </span>
          )}

          {/* Slot para badges personalizados del módulo */}
          {badges}
        </div>

        {/* Title and Description */}
        <div className="space-y-0.5 min-w-0">
          <div className="font-heading font-semibold text-xs sm:text-[13px] text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {title}
          </div>
          {description && (
            <div className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
              {description}
            </div>
          )}
        </div>

        {/* Slot para campos e información adicional */}
        {extraContent && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {extraContent}
          </div>
        )}
      </div>

      {/* Right / Actions Column */}
      {(extraActions || hasWorkflowElements) && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-end justify-between gap-1.5 shrink-0 self-stretch pt-0.5"
        >
          {/* Botones extras (en el borde superior derecho) */}
          {extraActions ? (
            <div className="flex items-center gap-1 shrink-0">
              {extraActions}
            </div>
          ) : (
            <div className="h-0" />
          )}

          {/* Botones de acción directos de Workflow (en la parte inferior derecha) */}
          {showWorkflowTrigger && (
            isWorkflowLoading ? (
              <div className="h-7 px-2.5 flex items-center justify-center rounded-lg bg-muted/50 border border-border/40">
                <Loader2 className="size-3 animate-spin text-primary opacity-80" />
                <span className="ml-1.5 text-[11px] text-muted-foreground font-medium">Cargando...</span>
              </div>
            ) : hasActions ? (
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onActionSelect?.(action, cleanTaskName, fields)
                      }}
                      className={cn(
                        "h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer border-0",
                        visuals.btnClass,
                      )}
                      title={`Ejecutar decisión: ${actionName}`}
                    >
                      <ActionIcon className="size-3.5 shrink-0" />
                      <span className="capitalize">{actionName}</span>
                    </Button>
                  )
                })}
              </div>
            ) : onWorkflowTrigger ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onWorkflowTrigger()
                }}
                className="h-7 px-2.5 rounded-lg shadow-2xs bg-primary/5 hover:bg-primary/15 text-primary border-primary/25 cursor-pointer transition-all hover:scale-102 active:scale-98 text-xs font-medium inline-flex items-center gap-1.5"
                title="Opciones de workflow"
              >
                <GitBranch className="size-3.5 text-primary" />
                <span>Workflow</span>
              </Button>
            ) : null
          )}
        </div>
      )}
    </li>
  )
}

