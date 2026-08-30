import { useState, useId, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  CheckCheck,
  Clock,
  FileCheck2,
  HelpCircle,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"

import { ordenTrabajoQueries } from "@/modules/mantenimientos/orden-trabajo/api/orden-trabajo.queries"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { empleadoResponsabilidadQueries } from "@/modules/organizacion/empleado-responsabilidad/api/empleado-responsabilidad.queries"
import { grupoAprobadorDependienteQueries } from "@/modules/organizacion/grupo-aprobador-dependiente/api/grupo-aprobador-dependiente.queries"
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
import { formatDate } from "@/shared/utils/date.utils"

import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"
import { fixEncoding } from "../lib/solicitud.utils"

type WorkflowActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  action: WorkflowAction | null
  taskName?: string
  fields?: WorkflowField[]
  onSuccess?: () => void
}

type WorkflowActionDialogContentProps = {
  solicitud: SolicitudMantenimiento
  action: WorkflowAction
  taskName?: string
  fields: WorkflowField[]
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function WorkflowActionDialog({
  open,
  onOpenChange,
  solicitud,
  action,
  taskName,
  fields = [],
  onSuccess,
}: WorkflowActionDialogProps) {
  if (!open || !solicitud || !action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WorkflowActionDialogContent
        key={`${solicitud.id}-${action.variable}-${action.value}`}
        solicitud={solicitud}
        action={action}
        taskName={taskName}
        fields={fields}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  )
}

function WorkflowActionDialogContent({
  solicitud,
  action,
  taskName,
  fields,
  onOpenChange,
  onSuccess,
}: WorkflowActionDialogContentProps) {
  const completeMutation = useCompleteWorkflowTask()
  const formId = useId()

  const initialFechaEstimada = solicitud.fechaEstimadaOt
    ? (solicitud.fechaEstimadaOt.includes("T")
        ? solicitud.fechaEstimadaOt.substring(0, 10)
        : solicitud.fechaEstimadaOt)
    : ""

  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [responsableId, setResponsableId] = useState<string>(
    solicitud.responsable?.id ?? "",
  )
  const [supervisorId, setSupervisorId] = useState<string>("")
  const [fechaEstimadaOt, setFechaEstimadaOt] =
    useState<string>(initialFechaEstimada)
  const [useAllEmployeesSearch, setUseAllEmployeesSearch] =
    useState<boolean>(false)
  const [useAllEmployeesForSupervisor, setUseAllEmployeesForSupervisor] =
    useState<boolean>(false)

  // Aprobador ID from the request if already approved
  const aprobadorId = solicitud.aprobadoPor?.id

  // Query dependientes of the approver via /v1/grupos-aprobadores/aprobadores/{aprobadorId}/dependientes/select
  const dependientesQuery = useQuery({
    ...grupoAprobadorDependienteQueries.dependientesSelect(aprobadorId),
    enabled: Boolean(aprobadorId),
  })

  const dependientes = dependientesQuery.data ?? []
  const hasDependientes = dependientes.length > 0

  // Query supervisores de mantenimiento with responsibility SUP_MANTENIMIENTO
  const supervisoresQuery = useQuery({
    ...empleadoResponsabilidadQueries.byResponsabilidadCodigo(
      "SUP_MANTENIMIENTO",
    ),
  })

  const supervisores = supervisoresQuery.data ?? []
  const hasSupervisores = supervisores.length > 0

  // Query OT list to find matching OT by solicitudId
  const otListQuery = useQuery({
    ...ordenTrabajoQueries.list({ size: 100 }),
    enabled: Boolean(solicitud.id),
  })

  const ordenTrabajo = useMemo(() => {
    const list = otListQuery.data?.content ?? []
    return (
      list.find((ot) => ot.solicitudMantenimientoId === solicitud.id) ?? null
    )
  }, [otListQuery.data?.content, solicitud.id])

  // Query actividades if OT exists
  const actividadesQuery = useQuery({
    ...ordenTrabajoQueries.actividadesByOT(ordenTrabajo?.id ?? "", {
      size: 100,
    }),
    enabled: Boolean(ordenTrabajo?.id),
  })

  const actividades = useMemo(
    () => actividadesQuery.data?.content ?? [],
    [actividadesQuery.data?.content],
  )

  const cleanActionName = fixEncoding(action.name)
  const cleanTaskName = fixEncoding(taskName)

  const actionName = (cleanActionName ?? "").toLowerCase()
  const actionVal = (action.value ?? "").toUpperCase()

  const isAprobar =
    actionVal.includes("APROB") || actionName.includes("aprobar")
  const isObservar =
    actionVal.includes("OBSERV") || actionName.includes("observar")
  const isCorregir =
    actionVal.includes("CORREG") || actionName.includes("corregir")
  const isIniciar =
    actionVal.includes("INIC") || actionName.includes("iniciar")
  const isRevision =
    actionVal.includes("REVIS") ||
    actionName.includes("revisión") ||
    actionName.includes("revision") ||
    actionName.includes("revis")
  const isValidar =
    actionVal.includes("VALID") || actionName.includes("validar")
  const isCerrar =
    actionVal.includes("CERR") || actionVal.includes("RECIB") || actionName.includes("cerrar") || actionName.includes("recibir")
  const isRechazar =
    actionVal.includes("RECHAZ") || actionVal.includes("CANCEL") || actionName.includes("rechazar")

  // Check if this action involves assigning a responsible
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
      (isAprobar && !solicitud.responsable) ||
      (actionName.includes("asign") && !actionName.includes("iniciar")) ||
      (actionVal.includes("ASIGN") && !actionVal.includes("INIC")) ||
      (cleanTaskName?.toLowerCase().includes("asign") &&
        !cleanTaskName?.toLowerCase().includes("iniciar") &&
        !cleanTaskName?.toLowerCase().includes("mantenimiento")))

  // Check if this action involves assigning a supervisor (sending to review from maintenance)
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
    if (!solicitud || !action) return

    const errors: Record<string, string> = {}

    // Check required BPMN fields
    for (const field of writableFields) {
      if (field.required && !formValues[field.id]?.trim()) {
        errors[field.id] = `El campo ${field.name} es obligatorio.`
      }
    }

    // Check observation requirement for OBSERVAR / CORREGIR
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

    // Check responsable requirement if assignment is relevant
    if (isAssignmentRelevant && (isAprobar || actionName.includes("asign")) && !responsableId) {
      errors.responsableId =
        "Debe seleccionar el técnico o responsable asignado."
    }

    // Check supervisor requirement when sending to review or completing execution
    if (isSupervisorRelevant && !supervisorId) {
      errors.supervisorId =
        "Debe seleccionar el supervisor que validará el mantenimiento."
    }

    // Check fechaEstimadaOt requirement when approving
    if (isAprobar && !fechaEstimadaOt?.trim()) {
      errors.fechaEstimadaOt =
        "La fecha estimada de la orden de trabajo (OT) es obligatoria al aprobar."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const variables: Record<string, unknown> = {
      [action.variable]: action.value,
      ...formValues,
    }

    if (isAssignmentRelevant && responsableId) {
      variables.responsableId = responsableId
    }

    if (isSupervisorRelevant && supervisorId) {
      variables.supervisorId = supervisorId
    }

    if (fechaEstimadaOt?.trim()) {
      variables.fechaEstimadaOt = fechaEstimadaOt.includes("T")
        ? fechaEstimadaOt.trim()
        : `${fechaEstimadaOt.trim()}T00:00:00`
    }

    try {
      await completeMutation.mutateAsync({
        solicitudId: solicitud.id,
        payload: { variables },
      })
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Handled by toast in mutation
    }
  }

  return (
    <DialogContent className="sm:max-w-md md:max-w-lg p-5">
        <DialogHeader className="space-y-1.5 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-xl text-white shadow-xs",
                isAprobar
                  ? "bg-emerald-600"
                  : isObservar
                    ? "bg-amber-600"
                    : isCorregir
                      ? "bg-orange-600"
                      : isIniciar
                        ? "bg-sky-600"
                        : isRevision
                          ? "bg-indigo-600"
                          : isValidar
                            ? "bg-teal-600"
                            : isCerrar
                              ? "bg-emerald-700"
                              : isRechazar
                                ? "bg-rose-600"
                                : "bg-primary",
              )}
            >
              {isAprobar ? (
                <CheckCircle2 className="size-4" />
              ) : isObservar ? (
                <AlertCircle className="size-4" />
              ) : isCorregir ? (
                <RotateCcw className="size-4" />
              ) : isIniciar ? (
                <Play className="size-4" />
              ) : isRevision ? (
                <Send className="size-4" />
              ) : isValidar ? (
                <ShieldCheck className="size-4" />
              ) : isCerrar ? (
                <CheckCheck className="size-4" />
              ) : isRechazar ? (
                <AlertOctagon className="size-4" />
              ) : (
                <FileCheck2 className="size-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold">
                {cleanActionName} Solicitud
              </DialogTitle>
              {cleanTaskName && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  {cleanTaskName}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Vas a registrar la decisión <strong className="text-foreground">{cleanActionName}</strong> en el flujo de trabajo.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Summary Mini Card */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-primary text-[11px]">
                {solicitud.numero}
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-primary/10 text-primary border border-primary/20">
                Acción: {cleanActionName}
              </span>
            </div>
            <p className="font-medium text-foreground truncate">
              {solicitud.titulo}
            </p>
          </div>

          {/* Listado de Actividades de la OT para Validación del Supervisor */}
          {(isValidar || isObservar || solicitud.estado === "EN_REVISION") && (
            <div className="space-y-2.5 rounded-xl bg-muted/30 border border-border/80 p-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ListChecks className="size-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    Actividades de la Orden de Trabajo
                  </span>
                  {ordenTrabajo?.numero && (
                    <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold truncate">
                      {ordenTrabajo.numero}
                    </span>
                  )}
                </div>

                {actividades.length > 0 && (
                  <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                    {actividades.filter((a) => a.realizado).length} de {actividades.length} realizadas
                  </span>
                )}
              </div>

              {otListQuery.isLoading || actividadesQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Consultando actividades técnicas...</span>
                </div>
              ) : !ordenTrabajo ? (
                <div className="py-2 text-center text-xs text-muted-foreground italic">
                  No se encontró una orden de trabajo vinculada a esta solicitud.
                </div>
              ) : actividades.length === 0 ? (
                <div className="py-2.5 text-center text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Sin actividades registradas</p>
                  <p className="text-[11px]">La orden de trabajo aún no contiene tareas registradas.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {actividades.map((act, index) => (
                    <div
                      key={act.id}
                      className={cn(
                        "rounded-lg border p-2 text-xs flex items-start gap-2 transition-all",
                        act.realizado
                          ? "bg-background border-border/80"
                          : "bg-muted/40 border-border/50 opacity-80",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold mt-0.5",
                          act.realizado
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground border border-border/60",
                        )}
                      >
                        {act.realizado ? (
                          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-foreground text-[11.5px] leading-tight">
                            {act.actividadMantenimiento?.nombre || act.descripcion || `Actividad #${index + 1}`}
                          </p>
                          <span
                            className={cn(
                              "text-[9.5px] font-bold px-1.5 py-0.2 rounded shrink-0",
                              act.realizado
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {act.realizado ? "Realizada" : "Pendiente"}
                          </span>
                        </div>

                        {act.observacion && (
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {act.observacion}
                          </p>
                        )}

                        {act.fechaRealizacion && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                            <Clock className="size-2.5" />
                            <span>{formatDate(act.fechaRealizacion)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ordenTrabajo?.trabajoRealizado && (
                <div className="pt-1.5 border-t border-border/50 text-[11.5px]">
                  <span className="font-bold text-foreground">Detalle del Trabajo: </span>
                  <span className="text-muted-foreground">{ordenTrabajo.trabajoRealizado}</span>
                </div>
              )}
            </div>
          )}

          {/* Selector de Responsable (con soporte para dependientes del aprobador) */}
          {isAssignmentRelevant && (
            <div className="space-y-2 rounded-xl bg-muted/30 border border-border/70 p-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="modalResponsableSelect"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <UserCheck className="size-3.5 text-primary" />
                  <span>Asignar Técnico / Responsable</span>
                  <span className="text-destructive">*</span>
                </Label>

                {hasDependientes && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseAllEmployeesSearch((prev) => !prev)}
                    className="h-6 px-1.5 text-[10.5px] text-muted-foreground hover:text-primary font-normal"
                  >
                    {useAllEmployeesSearch ? "Ver dependientes" : "Buscar en todos"}
                  </Button>
                )}
              </div>

              {/* Si el aprobador tiene dependientes asignados, usamos el selector de dependientes */}
              {hasDependientes && !useAllEmployeesSearch ? (
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-primary/5 border border-primary/15 rounded-lg px-2.5 py-1">
                    <Users className="size-3.5 text-primary shrink-0" />
                    <span>
                      Técnicos a cargo de: <strong className="text-foreground">{solicitud.aprobadoPor?.nombre}</strong>
                    </span>
                  </div>

                  <Select
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
                  >
                    <SelectTrigger
                      id="modalResponsableSelect"
                      className="h-9 w-full text-xs bg-background shadow-2xs"
                    >
                      <SelectValue placeholder="Seleccionar técnico responsable...">
                        {dependientes.find((d) => d.id === responsableId)
                          ? (() => {
                              const dep = dependientes.find((d) => d.id === responsableId)!
                              return `${dep.nombreCompleto}${dep.cargo ? ` — ${dep.cargo}` : ""}`
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {dependientes.map((dep) => (
                        <SelectItem key={dep.id} value={dep.id} className="text-xs py-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{dep.nombreCompleto}</span>
                            {dep.cargo && (
                              <span className="text-[11px] text-muted-foreground">
                                • {dep.cargo}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <EmpleadoCombobox
                  id="modalResponsableSelect"
                  value={responsableId}
                  onValueChange={(val) => {
                    setResponsableId(val)
                    if (formErrors.responsableId) {
                      setFormErrors((prev) => {
                        const next = { ...prev }
                        delete next.responsableId
                        return next
                      })
                    }
                  }}
                  placeholder="Buscar y seleccionar técnico responsable..."
                  aria-invalid={Boolean(formErrors.responsableId)}
                  className="w-full bg-background text-xs"
                />
              )}

              {formErrors.responsableId && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{formErrors.responsableId}</span>
                </p>
              )}
            </div>
          )}

          {/* Selector de Supervisor para Validación (Requerido al enviar a revisión) */}
          {isSupervisorRelevant && (
            <div className="space-y-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/30 p-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="modalSupervisorSelect"
                    className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                  >
                    <ShieldCheck className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Asignar Supervisor para Validación</span>
                    <span className="text-destructive font-bold">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Selecciona el supervisor responsable de validar los trabajos realizados y evidencias técnicas.
                  </p>
                </div>

                {hasSupervisores && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseAllEmployeesForSupervisor((prev) => !prev)}
                    className="h-6 px-1.5 text-[10.5px] text-muted-foreground hover:text-indigo-600 font-normal shrink-0"
                  >
                    {useAllEmployeesForSupervisor ? "Ver supervisores" : "Buscar en todos"}
                  </Button>
                )}
              </div>

              <div className="pt-0.5">
                {hasSupervisores && !useAllEmployeesForSupervisor ? (
                  <Select
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
                  >
                    <SelectTrigger
                      id="modalSupervisorSelect"
                      className="h-9 w-full text-xs bg-background shadow-2xs"
                    >
                      <SelectValue placeholder={supervisoresQuery.isLoading ? "Cargando supervisores..." : "Buscar y seleccionar supervisor..."}>
                        {supervisores.find((s) => s.id === supervisorId)
                          ? (() => {
                              const sup = supervisores.find((s) => s.id === supervisorId)!
                              return `${sup.nombreCompleto} (${sup.codigo})`
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {supervisores.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id} className="text-xs py-1.5 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{sup.nombreCompleto}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">({sup.codigo})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <EmpleadoCombobox
                    id="modalSupervisorSelect"
                    value={supervisorId}
                    onValueChange={(val) => {
                      setSupervisorId(val)
                      if (formErrors.supervisorId) {
                        setFormErrors((prev) => {
                          const next = { ...prev }
                          delete next.supervisorId
                          return next
                        })
                      }
                    }}
                    placeholder="Buscar y seleccionar supervisor..."
                    aria-invalid={Boolean(formErrors.supervisorId)}
                    className="w-full bg-background text-xs"
                  />
                )}
              </div>

              {formErrors.supervisorId && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{formErrors.supervisorId}</span>
                </p>
              )}
            </div>
          )}

          {/* Fecha Estimada de OT (Al Aprobar) */}
          {isAprobar && (
            <div className="space-y-1.5 rounded-xl bg-muted/30 border border-border/70 p-3">
              <Label
                htmlFor="modalFechaEstimadaOt"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Calendar className="size-3.5 text-primary" />
                <span>Fecha Estimada de OT</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="modalFechaEstimadaOt"
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
                className="h-9 text-xs bg-background"
              />
              {formErrors.fechaEstimadaOt && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{formErrors.fechaEstimadaOt}</span>
                </p>
              )}
            </div>
          )}

          {/* Observation Field for OBSERVAR / CORREGIR or General Note */}
          {(isObservar || isCorregir || isAprobar || isCerrar) && (
            <div className="space-y-1.5">
              <Label
                htmlFor="modalObservacion"
                className="text-xs font-semibold flex items-center justify-between"
              >
                <span>
                  {isObservar
                    ? "Motivo de la Observación"
                    : isCorregir
                      ? "Detalles de Corrección requerida"
                      : isCerrar
                        ? "Observaciones de Cierre / Conformidad"
                        : "Comentario u Observación de Aprobación"}
                  {(isObservar || isCorregir) && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </span>
              </Label>
              <Textarea
                id="modalObservacion"
                placeholder={
                  isObservar
                    ? "Explique detalladamente qué debe subsanar el solicitante..."
                    : isCorregir
                      ? "Indique qué correcciones técnicas deben efectuarse..."
                      : "Comentarios u observaciones adicionales (opcional)..."
                }
                value={
                  formValues.observacion ||
                  formValues.observacionAprobacion ||
                  formValues.observacionValidacion ||
                  formValues.observacionCierre ||
                  ""
                }
                onChange={(e) => {
                  handleFieldChange("observacion", e.target.value)
                  handleFieldChange("observacionAprobacion", e.target.value)
                  handleFieldChange("observacionValidacion", e.target.value)
                  handleFieldChange("observacionCierre", e.target.value)
                }}
                className="text-xs min-h-[80px] resize-none"
              />
              {formErrors.observacion && (
                <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{formErrors.observacion}</span>
                </p>
              )}
            </div>
          )}

          {/* Dynamic BPMN Fields */}
          {writableFields.length > 0 && (
            <div className="space-y-3">
              {writableFields.map((field) => {
                const isTextarea =
                  field.type === "textarea" ||
                  field.id.toLowerCase().includes("observ") ||
                  field.id.toLowerCase().includes("motivo") ||
                  field.id.toLowerCase().includes("coment")

                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label
                      htmlFor={field.id}
                      className="text-xs font-semibold flex items-center justify-between"
                    >
                      <span>
                        {field.name}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </span>
                    </Label>

                    {field.options && field.options.length > 0 ? (
                      <Select
                        value={formValues[field.id] ?? ""}
                        onValueChange={(val) =>
                          handleFieldChange(field.id, val ?? "")
                        }
                      >
                        <SelectTrigger id={field.id} className="h-8.5 text-xs">
                          <SelectValue placeholder={`Seleccionar ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isTextarea ? (
                      <Textarea
                        id={field.id}
                        placeholder={`Ingrese ${field.name.toLowerCase()}...`}
                        value={formValues[field.id] ?? ""}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        className="text-xs min-h-[75px] resize-none"
                      />
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={`Ingrese ${field.name.toLowerCase()}...`}
                        value={formValues[field.id] ?? ""}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        className="h-8.5 text-xs"
                      />
                    )}

                    {formErrors[field.id] && (
                      <p className="text-[11px] font-medium text-destructive">
                        {formErrors[field.id]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Simple Confirmation notice if no inputs needed */}
          {!isAssignmentRelevant &&
            !isSupervisorRelevant &&
            !isObservar &&
            !isCorregir &&
            writableFields.length === 0 && (
              <div className="rounded-lg bg-muted/40 p-2.5 flex items-start gap-2 text-muted-foreground text-xs">
                <HelpCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11.5px] leading-relaxed">
                  Esta acción registrará <strong className="text-foreground">{cleanActionName}</strong> y avanzará la solicitud a la siguiente etapa automáticamente.
                </p>
              </div>
            )}
        </form>

        <DialogFooter className="gap-2 pt-2 border-t sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={completeMutation.isPending}
            className="text-xs h-8 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={completeMutation.isPending}
            className={cn("text-xs h-8 font-semibold gap-1.5 shadow-sm cursor-pointer", actionColorClass)}
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                {isAprobar ? (
                  <CheckCircle2 className="size-3.5" />
                ) : isObservar ? (
                  <AlertCircle className="size-3.5" />
                ) : isCorregir ? (
                  <RotateCcw className="size-3.5" />
                ) : isIniciar ? (
                  <Play className="size-3.5" />
                ) : isRevision ? (
                  <Send className="size-3.5" />
                ) : isValidar ? (
                  <ShieldCheck className="size-3.5" />
                ) : isCerrar ? (
                  <CheckCheck className="size-3.5" />
                ) : isRechazar ? (
                  <AlertOctagon className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>Confirmar {cleanActionName}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}
