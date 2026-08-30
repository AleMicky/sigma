import { useId, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  FileEdit,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { empleadoResponsabilidadQueries } from "@/modules/organizacion/empleado-responsabilidad/api/empleado-responsabilidad.queries"
import { grupoAprobadorDependienteQueries } from "@/modules/organizacion/grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.queries"
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

import type { WorkflowAction, WorkflowField } from "../types/workflow.types"
import { fixWorkflowEncoding, getWorkflowActionVisuals } from "../utils/workflow.utils"

export type WorkflowActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: WorkflowAction | null
  taskName?: string
  fields?: WorkflowField[]
  entityId?: string
  responsableActual?: { id: string; nombre?: string } | null
  aprobadorId?: string
  fechaEstimadaActual?: string
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
  responsableActual,
  aprobadorId,
  fechaEstimadaActual,
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
        responsableActual={responsableActual}
        aprobadorId={aprobadorId}
        fechaEstimadaActual={fechaEstimadaActual}
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
  responsableActual,
  aprobadorId,
  fechaEstimadaActual,
  onOpenChange,
  onExecute,
  onSuccess,
}: {
  action: WorkflowAction
  taskName?: string
  fields: WorkflowField[]
  entityId?: string
  responsableActual?: { id: string; nombre?: string } | null
  aprobadorId?: string
  fechaEstimadaActual?: string
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

  const initialFechaEstimada = fechaEstimadaActual
    ? fechaEstimadaActual.includes("T")
      ? fechaEstimadaActual.substring(0, 10)
      : fechaEstimadaActual
    : ""

  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [responsableId, setResponsableId] = useState<string>(
    responsableActual?.id ?? "",
  )
  const [supervisorId, setSupervisorId] = useState<string>("")
  const [fechaEstimadaOt, setFechaEstimadaOt] = useState<string>(initialFechaEstimada)
  const [useAllEmployeesSearch, setUseAllEmployeesSearch] = useState<boolean>(false)
  const [useAllEmployeesForSupervisor, setUseAllEmployeesForSupervisor] = useState<boolean>(false)

  // Query dependientes if approver is given
  const dependientesQuery = useQuery({
    ...grupoAprobadorDependienteQueries.dependientesSelect(aprobadorId),
    enabled: Boolean(aprobadorId),
  })

  const dependientes = dependientesQuery.data ?? []
  const hasDependientes = dependientes.length > 0

  // Query supervisores de mantenimiento
  const supervisoresQuery = useQuery({
    ...empleadoResponsabilidadQueries.byResponsabilidadCodigo(
      "SUP_MANTENIMIENTO",
    ),
  })

  const supervisores = supervisoresQuery.data ?? []
  const hasSupervisores = supervisores.length > 0

  const cleanActionName = fixWorkflowEncoding(action.name || action.value)
  const cleanTaskName = fixWorkflowEncoding(taskName || "")

  const actionVal = action.value.toUpperCase()
  const actionName = cleanActionName.toLowerCase()

  const isAprobar =
    actionVal.includes("APROB") || actionName.includes("aprobar")
  const isObservar =
    actionVal.includes("OBSERV") || actionName.includes("observar")
  const isCorregir =
    actionVal.includes("CORREG") || actionName.includes("corregir")
  const isIniciar =
    actionVal.includes("INIC") || actionName.includes("iniciar")
  const isRevision =
    actionVal.includes("REVIS") || actionName.includes("revisión") || actionName.includes("revision")
  const isValidar =
    actionVal.includes("VALID") || actionName.includes("validar")
  const isCerrar =
    actionVal.includes("CERR") || actionVal.includes("RECIB") || actionName.includes("cerrar") || actionName.includes("recibir")
  const isRechazar =
    actionVal.includes("RECHAZ") || actionName.includes("rechazar") || actionName.includes("cancelar")

  const hasResponsableFieldInBpmn = fields.some(
    (f) =>
      f.id.toLowerCase() === "responsableid" ||
      f.name.toLowerCase().includes("responsable") ||
      f.name.toLowerCase().includes("técnico") ||
      f.name.toLowerCase().includes("tecnico"),
  )

  const isAssignmentRelevant =
    !isIniciar &&
    (hasResponsableFieldInBpmn ||
      (isAprobar && !responsableActual) ||
      (actionName.includes("asign") && !actionName.includes("iniciar")) ||
      (actionVal.includes("ASIGN") && !actionVal.includes("INIC")) ||
      (cleanTaskName?.toLowerCase().includes("asign") &&
        !cleanTaskName?.toLowerCase().includes("iniciar") &&
        !cleanTaskName?.toLowerCase().includes("mantenimiento")))

  const hasSupervisorFieldInBpmn = fields.some(
    (f) =>
      f.id.toLowerCase() === "supervisorid" ||
      f.name.toLowerCase().includes("supervisor"),
  )

  const isSupervisorRelevant =
    !isIniciar &&
    !isAprobar &&
    (hasSupervisorFieldInBpmn ||
      isRevision ||
      actionVal.includes("REVIS") ||
      actionName.includes("revis") ||
      (cleanTaskName?.toLowerCase().includes("enviar") &&
        cleanTaskName?.toLowerCase().includes("revis")))

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

  const writableFields = fields.filter(
    (f) =>
      f.writable !== false &&
      f.id.toLowerCase() !== "responsableid" &&
      f.id.toLowerCase() !== "supervisorid",
  )

  function handleFieldChange(fieldId: string, val: string) {
    setFormValues((prev) => ({ ...prev, [fieldId]: val }))
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!action) return

    const errors: Record<string, string> = {}

    for (const field of writableFields) {
      if (field.required && !formValues[field.id]?.trim()) {
        errors[field.id] = `El campo ${field.name} es obligatorio.`
      }
    }

    if (isObservar || isCorregir) {
      const obsValue =
        formValues.observacion ||
        formValues.observacionAprobacion ||
        formValues.observacionValidacion ||
        formValues.motivo
      if (!obsValue?.trim()) {
        errors.observacion =
          "Por favor ingrese el motivo u observación para continuar."
      }
    }

    if (isAssignmentRelevant && (isAprobar || actionName.includes("asign")) && !responsableId) {
      errors.responsableId = "Debe seleccionar el técnico o responsable asignado."
    }

    if (isSupervisorRelevant && !supervisorId) {
      errors.supervisorId = "Debe seleccionar el supervisor que validará el mantenimiento."
    }

    if (isAprobar && !fechaEstimadaOt?.trim()) {
      errors.fechaEstimadaOt =
        "La fecha estimada de la orden de trabajo es obligatoria al aprobar."
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

    if (responsableId) {
      payloadVariables.responsableId = responsableId
      payloadVariables.tecnicoId = responsableId
    }

    if (supervisorId) {
      payloadVariables.supervisorId = supervisorId
    }

    if (fechaEstimadaOt?.trim()) {
      payloadVariables.fechaEstimadaOt = fechaEstimadaOt.trim()
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
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-2xl rounded-2xl">
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
          {isAprobar
            ? "Estás a punto de aprobar esta solicitud. Selecciona el técnico responsable y la fecha estimada de la Orden de Trabajo (OT) para que el personal asignado pueda proceder con las labores."
            : isObservar
              ? "Describe claramente las observaciones o motivos para que el solicitante o encargado pueda subsanarlas antes de volver a evaluar."
              : isCorregir
                ? "Indica las correcciones que se han realizado sobre la solicitud u orden para reiniciar la revisión."
                : isIniciar
                  ? "Se iniciará la ejecución de los trabajos. El estado pasará a Mantenimiento en Progreso."
                  : isRevision
                    ? "Se enviará el trabajo completado para la validación y visto bueno del supervisor técnico."
                    : isValidar
                      ? "Confirma que los trabajos de mantenimiento se ejecutaron satisfactoriamente según los requerimientos técnicos."
                      : isCerrar
                        ? "Confirma la recepción conforme y el cierre definitivo del ciclo de mantenimiento."
                        : `Completa los datos requeridos para ejecutar la acción "${cleanActionName}".`}
        </DialogDescription>
      </DialogHeader>

      {/* Form Content */}
      <form id={formId} onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        {/* Assignment Section (Técnico / Responsable) */}
        {isAssignmentRelevant && (
          <div className="space-y-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-primary" />
                <span>Técnico / Responsable Asignado</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              {hasDependientes && (
                <button
                  type="button"
                  onClick={() => setUseAllEmployeesSearch(!useAllEmployeesSearch)}
                  className="text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Search className="size-3" />
                  <span>
                    {useAllEmployeesSearch
                      ? "Ver solo mi equipo"
                      : "Buscar en todo el personal"}
                  </span>
                </button>
              )}
            </div>

            {hasDependientes && !useAllEmployeesSearch ? (
              <div className="space-y-1.5">
                <Select
                  value={responsableId}
                  onValueChange={(val) => {
                    setResponsableId(val || "")
                    if (formErrors.responsableId) {
                      setFormErrors((prev) => {
                        const next = { ...prev }
                        delete next.responsableId
                        return next
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Seleccionar miembro de tu equipo dependiente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dependientes.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold">{d.nombreCompleto}</span>
                          {d.cargo && (
                            <span className="text-[10px] text-muted-foreground">{d.cargo}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                  <Users className="size-3 text-primary" />
                  <span>Personal asignado a tu grupo de aprobadores.</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <EmpleadoCombobox
                  value={responsableId}
                  onValueChange={(val) => {
                    setResponsableId(val ?? "")
                    if (formErrors.responsableId) {
                      setFormErrors((prev) => {
                        const next = { ...prev }
                        delete next.responsableId
                        return next
                      })
                    }
                  }}
                  placeholder="Buscar y seleccionar técnico responsable..."
                />
              </div>
            )}

            {formErrors.responsableId && (
              <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{formErrors.responsableId}</span>
              </p>
            )}
          </div>
        )}

        {/* Supervisor Selection */}
        {isSupervisorRelevant && (
          <div className="space-y-3 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-indigo-600" />
                <span>Supervisor de Validación Técnica</span>
                <span className="text-destructive font-bold">*</span>
              </Label>
              {hasSupervisores && (
                <button
                  type="button"
                  onClick={() => setUseAllEmployeesForSupervisor(!useAllEmployeesForSupervisor)}
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Search className="size-3" />
                  <span>
                    {useAllEmployeesForSupervisor
                      ? "Ver supervisores registrados"
                      : "Buscar en todo el personal"}
                  </span>
                </button>
              )}
            </div>

            {hasSupervisores && !useAllEmployeesForSupervisor ? (
              <div className="space-y-1.5">
                <Select
                  value={supervisorId}
                  onValueChange={(val) => {
                    setSupervisorId(val || "")
                    if (formErrors.supervisorId) {
                      setFormErrors((prev) => {
                        const next = { ...prev }
                        delete next.supervisorId
                        return next
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Seleccionar supervisor de mantenimiento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisores.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold">{s.nombreCompleto}</span>
                          <span className="text-[10px] text-muted-foreground">{s.codigo}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <EmpleadoCombobox
                value={supervisorId}
                onValueChange={(val) => {
                  setSupervisorId(val ?? "")
                  if (formErrors.supervisorId) {
                    setFormErrors((prev) => {
                      const next = { ...prev }
                      delete next.supervisorId
                      return next
                    })
                  }
                }}
                placeholder="Buscar supervisor técnico..."
              />
            )}

            {formErrors.supervisorId && (
              <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{formErrors.supervisorId}</span>
              </p>
            )}
          </div>
        )}

        {/* Fecha Estimada OT al Aprobar */}
        {isAprobar && (
          <div className="space-y-1.5 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-emerald-600" />
              <span>Fecha Estimada para la Orden de Trabajo (OT)</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              type="date"
              value={fechaEstimadaOt}
              onChange={(e) => {
                setFechaEstimadaOt(e.target.value)
                if (formErrors.fechaEstimadaOt) {
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.fechaEstimadaOt
                    return next
                  })
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              className="h-9 text-xs bg-background"
            />
            {formErrors.fechaEstimadaOt && (
              <p className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{formErrors.fechaEstimadaOt}</span>
              </p>
            )}
          </div>
        )}

        {/* Observaciones obligatorias si es OBSERVAR / CORREGIR */}
        {(isObservar || isCorregir) && !writableFields.some((f) => f.id.toLowerCase().includes("observ")) && (
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
              onChange={(e) => handleFieldChange("observacion", e.target.value)}
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

        {/* Dynamic Camunda BPMN Fields */}
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

              return (
                <div key={fieldId} className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>{fieldName}</span>
                    {isRequired && <span className="text-destructive font-bold">*</span>}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      rows={3}
                      placeholder={field.placeholder || `Ingrese ${fieldName.toLowerCase()}...`}
                      value={formValues[fieldId] || ""}
                      onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                      className="text-xs bg-background resize-none"
                    />
                  ) : field.type === "enum" || field.options ? (
                    <Select
                      value={formValues[fieldId] || ""}
                      onValueChange={(val) => handleFieldChange(fieldId, val || "")}
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
                      onChange={(e) => handleFieldChange(fieldId, e.target.value)}
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
      </form>

      {/* Footer */}
      <DialogFooter className="px-5 py-3 border-t bg-muted/20 flex flex-row items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="h-8 text-xs font-semibold px-3"
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
