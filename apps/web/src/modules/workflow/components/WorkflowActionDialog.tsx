import { useId, useState } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  FileEdit,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

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
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { WorkflowRestSelect } from "./WorkflowRestSelect"
import type { WorkflowAction, WorkflowField } from "../types/workflow.types"
import { fixWorkflowEncoding, getWorkflowActionVisuals } from "../utils/workflow.utils"

export type WorkflowActionDialogChildrenProps = {
  formValues: Record<string, any>
  setFieldValue: (key: string, value: any) => void
  formErrors: Record<string, string>
  setFieldError: (key: string, error: string | null) => void
  isSubmitting: boolean
  action: WorkflowAction
  taskName?: string
}

export type WorkflowActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: WorkflowAction | null
  taskName?: string
  fields?: WorkflowField[]
  entityId?: string
  /**
   * Optional custom description override
   */
  description?: string
  /**
   * Slot for extra domain-specific fields passed by the parent module
   */
  children?:
  | React.ReactNode
  | ((props: WorkflowActionDialogChildrenProps) => React.ReactNode)
  /**
   * Optional custom validation before executing
   */
  onValidate?: (formValues: Record<string, any>) => Record<string, string> | null
  onExecute: (payload: {
    action: WorkflowAction
    variables: Record<string, any>
    entityId?: string
  }) => Promise<any>
  onSuccess?: () => void
}

export function WorkflowActionDialog({
  open,
  onOpenChange,
  action,
  taskName,
  fields = [],
  entityId,
  description,
  children,
  onValidate,
  onExecute,
  onSuccess,
}: WorkflowActionDialogProps) {
  if (!open || !action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WorkflowActionDialogContent
        key={`${entityId ?? "entity"}-${action.variable}-${action.value}`}
        action={action}
        taskName={taskName}
        fields={fields}
        entityId={entityId}
        description={description}
        children={children}
        onValidate={onValidate}
        onOpenChange={onOpenChange}
        onExecute={onExecute}
        onSuccess={onSuccess}
      />
    </Dialog>
  )
}

function WorkflowActionDialogContent({
  action,
  taskName,
  fields,
  entityId,
  description,
  children,
  onValidate,
  onOpenChange,
  onExecute,
  onSuccess,
}: {
  action: WorkflowAction
  taskName?: string
  fields: WorkflowField[]
  entityId?: string
  description?: string
  children?:
  | React.ReactNode
  | ((props: WorkflowActionDialogChildrenProps) => React.ReactNode)
  onValidate?: (formValues: Record<string, any>) => Record<string, string> | null
  onOpenChange: (open: boolean) => void
  onExecute: (payload: {
    action: WorkflowAction
    variables: Record<string, any>
    entityId?: string
  }) => Promise<any>
  onSuccess?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formId = useId()

  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const cleanActionName = fixWorkflowEncoding(action.name || action.value)
  const cleanTaskName = fixWorkflowEncoding(taskName || "")

  const actionVal = action.value.toUpperCase()
  const actionName = cleanActionName.toLowerCase()

  const isAprobar = actionVal.includes("APROB") || actionName.includes("aprobar")
  const isObservar = actionVal.includes("OBSERV") || actionName.includes("observar")
  const isCorregir = actionVal.includes("CORREG") || actionName.includes("corregir")
  const isIniciar = actionVal.includes("INIC") || actionName.includes("iniciar")
  const isRevision = actionVal.includes("REVIS") || actionName.includes("revisión") || actionName.includes("revision")
  const isValidar = actionVal.includes("VALID") || actionName.includes("validar")
  const isCerrar = actionVal.includes("CERR") || actionVal.includes("RECIB") || actionName.includes("cerrar") || actionName.includes("recibir")
  const isRechazar = actionVal.includes("RECHAZ") || actionName.includes("rechazar") || actionName.includes("cancelar")

  const actionVisuals = getWorkflowActionVisuals(action)

  const actionColorClass = isAprobar
    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
    : isObservar
      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
      : isCorregir
        ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
        : isIniciar
          ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20"
          : isRevision
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
            : isValidar
              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20"
              : isCerrar
                ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-600/20"
                : isRechazar
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"

  const writableFields = fields.filter((f) => f.writable !== false)

  function setFieldValue(fieldId: string, val: any) {
    setFormValues((prev) => ({ ...prev, [fieldId]: val }))
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  function setFieldError(fieldId: string, error: string | null) {
    setFormErrors((prev) => {
      const next = { ...prev }
      if (error) {
        next[fieldId] = error
      } else {
        delete next[fieldId]
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!action) return

    const errors: Record<string, string> = {}

    // Validate BPMN required fields
    for (const field of writableFields) {
      if (field.required && !formValues[field.id]?.toString().trim()) {
        errors[field.id] = `El campo ${field.name} es obligatorio.`
      }
    }

    // Require reason/observation when observing or correcting if no explicit BPMN fields present
    if (isObservar || isCorregir) {
      const obsValue =
        formValues.observacion ||
        formValues.observacionAprobacion ||
        formValues.observacionValidacion ||
        formValues.motivo
      if (!obsValue?.toString().trim() && writableFields.length === 0) {
        errors.observacion =
          "Por favor ingrese el motivo u observación para continuar."
      }
    }

    // Custom validator from parent module if provided
    if (onValidate) {
      const customErrors = onValidate(formValues)
      if (customErrors) {
        Object.assign(errors, customErrors)
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error("Por favor complete todos los campos obligatorios.")
      return
    }

    const payloadVariables: Record<string, any> = {
      [action.variable]: action.value,
    }

    for (const [key, value] of Object.entries(formValues)) {
      if (value !== undefined && value !== "") {
        payloadVariables[key] = value
      }
    }

    try {
      setIsSubmitting(true)
      await onExecute({
        action,
        variables: payloadVariables,
        entityId,
      })
      toast.success(`Acción "${cleanActionName}" completada correctamente.`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error al completar la tarea de workflow."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
      {/* Dynamic Header */}
      <DialogHeader
        className={cn(
          "px-5 py-4 border-b flex flex-col gap-1.5 text-left transition-colors",
          isAprobar && "bg-emerald-500/10 border-emerald-500/20",
          isObservar && "bg-amber-500/10 border-amber-500/20",
          isCorregir && "bg-orange-500/10 border-orange-500/20",
          isIniciar && "bg-sky-500/10 border-sky-500/20",
          isRevision && "bg-indigo-500/10 border-indigo-500/20",
          isValidar && "bg-teal-500/10 border-teal-500/20",
          isCerrar && "bg-emerald-500/15 border-emerald-500/30",
          isRechazar && "bg-rose-500/10 border-rose-500/20",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-xl shadow-xs shrink-0 font-bold",
                actionVisuals.btnClass,
              )}
            >
              {isAprobar ? (
                <ShieldCheck className="size-5" />
              ) : isObservar ? (
                <AlertTriangle className="size-5" />
              ) : isCorregir ? (
                <RotateCcw className="size-5" />
              ) : isIniciar ? (
                <Play className="size-5" />
              ) : isRevision ? (
                <Send className="size-5" />
              ) : isValidar ? (
                <CheckCircle2 className="size-5" />
              ) : isCerrar ? (
                <CheckSquare className="size-5" />
              ) : isRechazar ? (
                <XCircle className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </span>
            <div>
              <DialogTitle className="text-base font-heading font-bold text-foreground">
                {cleanActionName}
              </DialogTitle>
              {cleanTaskName && (
                <p className="text-xs text-muted-foreground font-medium">
                  Paso del flujo:{" "}
                  <strong className="text-foreground">{cleanTaskName}</strong>
                </p>
              )}
            </div>
          </div>

          <Badge variant="outline" className="text-[11px] font-mono shrink-0">
            {action.variable}: {action.value}
          </Badge>
        </div>

        <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
          {description ||
            (isAprobar
              ? `¿Estás seguro de que deseas confirmar la acción "${cleanActionName}" para esta solicitud?`
              : isObservar
                ? "Describe claramente las observaciones o motivos para que el solicitante o encargado pueda subsanarlas."
                : isCorregir
                  ? "Indica las correcciones que se han realizado para reiniciar el flujo."
                  : isIniciar
                    ? "Se iniciará la ejecución de los trabajos."
                    : isRevision
                      ? "Se enviará el trabajo completado para validación."
                      : isValidar
                        ? "Confirma que las tareas se ejecutaron satisfactoriamente."
                        : isCerrar
                          ? "Confirma la recepción conforme y el cierre definitivo del ciclo."
                          : `Completa los datos requeridos para ejecutar la acción "${cleanActionName}".`)}
        </DialogDescription>
      </DialogHeader>

      {/* Form Content */}
      <form id={formId} onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        {/* Observaciones obligatorias si es OBSERVAR / CORREGIR y no hay campos específicos */}
        {(isObservar || isCorregir) &&
          !writableFields.some((f) => f.id.toLowerCase().includes("observ")) && (
            <div className="space-y-1.5 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileEdit className="size-3.5 text-amber-600" />
                <span>Motivo u Observaciones de la Revisión</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              <Textarea
                rows={3}
                placeholder="Escribe detalladamente las observaciones o motivos para corregir..."
                value={formValues.observacion || ""}
                onChange={(e) => setFieldValue("observacion", e.target.value)}
                className="text-xs bg-background leading-relaxed resize-none"
              />
              {formErrors.observacion && (
                <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{formErrors.observacion}</span>
                </p>
              )}
            </div>
          )}

        {/* Dynamic Camunda BPMN Form Fields */}
        {writableFields.length > 0 && (
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3 text-primary" />
              <span>Campos del Formulario BPMN</span>
            </h4>

            {writableFields.map((field) => {
              const fieldId = field.id
              const fieldName = fixWorkflowEncoding(field.name || field.id)
              const isRequired = Boolean(field.required)
              const error = formErrors[fieldId]
              const lowerId = fieldId.toLowerCase()
              const lowerType = (field.type || "").toLowerCase()
              const isRestSource = Boolean(field.url) || field.source === "rest"
              const isDateField =
                lowerType === "date" ||
                lowerId.startsWith("fecha") ||
                lowerId.includes("fecha")

              return (
                <div key={fieldId} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>{fieldName}</span>
                    {isRequired && <span className="text-destructive font-bold">*</span>}
                  </Label>

                  {isRestSource && field.url ? (
                    <WorkflowRestSelect
                      url={field.url}
                      params={field.params}
                      value={formValues[fieldId] || ""}
                      onValueChange={(val) => setFieldValue(fieldId, val ?? "")}
                      placeholder={field.placeholder || `Seleccionar ${fieldName.toLowerCase()}...`}
                    />
                  ) : field.type === "enum" || (field.options && field.options.length > 0) ? (
                    <Select
                      value={formValues[fieldId] || ""}
                      onValueChange={(val) => setFieldValue(fieldId, val || "")}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder={`Seleccionar ${fieldName.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => {
                          const optKey = opt.value || opt.id || ""
                          const optLabel = fixWorkflowEncoding(opt.label || opt.name || optKey)
                          return (
                            <SelectItem key={optKey} value={optKey} className="text-xs">
                              {optLabel}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : lowerType === "empleado" ? (
                    <EmpleadoCombobox
                      value={formValues[fieldId] || ""}
                      onValueChange={(val) => setFieldValue(fieldId, val ?? "")}
                      placeholder={field.placeholder || `Seleccionar ${fieldName.toLowerCase()}...`}
                    />
                  ) : isDateField ? (
                    <Input
                      type="date"
                      value={formValues[fieldId] || ""}
                      onChange={(e) => setFieldValue(fieldId, e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-9 text-xs bg-background"
                    />
                  ) : field.type === "textarea" || lowerId.includes("observacion") || lowerId.includes("motivo") ? (
                    <Textarea
                      rows={3}
                      placeholder={field.placeholder || `Ingrese ${fieldName.toLowerCase()}...`}
                      value={formValues[fieldId] || ""}
                      onChange={(e) => setFieldValue(fieldId, e.target.value)}
                      className="text-xs bg-background resize-none"
                    />
                  ) : field.type === "enum" || field.options ? (
                    <Select
                      value={formValues[fieldId] || ""}
                      onValueChange={(val) => setFieldValue(fieldId, val || "")}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder={`Seleccionar ${fieldName.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => {
                          const optKey = opt.value || opt.id || ""
                          const optLabel = fixWorkflowEncoding(opt.label || opt.name || optKey)
                          return (
                            <SelectItem key={optKey} value={optKey} className="text-xs">
                              {optLabel}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === "long" || field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder || `Ingrese ${fieldName.toLowerCase()}...`}
                      value={formValues[fieldId] || ""}
                      onChange={(e) => setFieldValue(fieldId, e.target.value)}
                      className="h-9 text-xs bg-background"
                    />
                  )}

                  {error && (
                    <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Extra Module-Specific Content passed through {children} */}
        {typeof children === "function"
          ? children({
            formValues,
            setFieldValue,
            formErrors,
            setFieldError,
            isSubmitting,
            action,
            taskName: cleanTaskName,
          })
          : children}
      </form>

      {/* Footer */}
      <DialogFooter className="px-5 py-3 border-t bg-muted/20 flex flex-row items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="h-8 text-xs font-semibold px-3 cursor-pointer"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          form={formId}
          size="sm"
          disabled={isSubmitting}
          className={cn(
            "h-8 text-xs font-bold px-4 gap-1.5 cursor-pointer shadow-md transition-all",
            actionColorClass,
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5" />
              <span>Confirmar {cleanActionName}</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
