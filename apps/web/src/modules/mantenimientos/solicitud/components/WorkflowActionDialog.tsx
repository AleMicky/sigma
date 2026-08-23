import { useState, useId } from "react"
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react"

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

import { useCompleteWorkflowTask } from "../api/solicitud.mutations"
import type {
  SolicitudMantenimiento,
  WorkflowAction,
  WorkflowField,
} from "../api/solicitud.service"

type WorkflowActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  action: WorkflowAction | null
  taskName?: string
  fields?: WorkflowField[]
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
  const completeMutation = useCompleteWorkflowTask()
  const formId = useId()

  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const isAprobar =
    action?.value?.toUpperCase().includes("APROB") ||
    action?.name?.toLowerCase().includes("aprobar")
  const isObservar =
    action?.value?.toUpperCase().includes("OBSERV") ||
    action?.name?.toLowerCase().includes("observar")
  const isRechazar =
    action?.value?.toUpperCase().includes("RECHAZ") ||
    action?.name?.toLowerCase().includes("rechazar")

  const actionColorClass = isAprobar
    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
    : isObservar
      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
      : isRechazar
        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
        : "bg-primary hover:bg-primary/90 text-primary-foreground"

  const writableFields = fields.filter((f) => f.writable !== false)

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

    // Validar campos requeridos
    const errors: Record<string, string> = {}
    for (const field of writableFields) {
      if (field.required && !formValues[field.id]?.trim()) {
        errors[field.id] = `El campo ${field.name} es obligatorio.`
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const variables: Record<string, unknown> = {
      [action.variable]: action.value,
      ...formValues,
    }

    try {
      await completeMutation.mutateAsync({
        solicitudId: solicitud.id,
        payload: { variables },
      })
      setFormValues({})
      setFormErrors({})
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Toast notification is managed by mutation
    }
  }

  if (!solicitud || !action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-5">
        <DialogHeader className="space-y-1.5 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7.5 items-center justify-center rounded-lg text-white shadow-xs",
                isAprobar
                  ? "bg-emerald-600"
                  : isObservar
                    ? "bg-amber-600"
                    : isRechazar
                      ? "bg-rose-600"
                      : "bg-primary",
              )}
            >
              {isAprobar ? (
                <CheckCircle2 className="size-4" />
              ) : isObservar ? (
                <AlertCircle className="size-4" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold">
                {action.name} Solicitud
              </DialogTitle>
              {taskName && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  {taskName}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Vas a registrar la decisión <strong className="text-foreground">{action.name}</strong> para el expediente.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Summary card */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-primary text-[11px]">
                {solicitud.numero}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border",
                  isAprobar
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    : isObservar
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-primary/10 border-primary/20 text-primary",
                )}
              >
                Acción: {action.name}
              </span>
            </div>
            <p className="font-semibold text-foreground truncate">
              {solicitud.titulo}
            </p>
            {solicitud.activo && (
              <p className="text-muted-foreground text-[11px] truncate">
                Activo: <span className="font-medium text-foreground">{solicitud.activo.codigo} - {solicitud.activo.nombre}</span>
              </p>
            )}
          </div>

          {/* Dynamic Workflow Fields */}
          {writableFields.length > 0 ? (
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
                          <span className="text-rose-500 ml-1">*</span>
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
                      <p className="text-[11px] font-medium text-rose-500">
                        {formErrors[field.id]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/40 p-2.5 flex items-start gap-2 text-muted-foreground text-xs">
              <HelpCircle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11.5px] leading-relaxed">
                Esta acción actualizará el estado de la solicitud en el flujo de trabajo automáticamente con el valor{" "}
                <strong className="text-foreground">{action.value}</strong>.
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
            className="text-xs h-8"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={completeMutation.isPending}
            className={cn("text-xs h-8 font-semibold gap-1.5 shadow-sm", actionColorClass)}
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
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                <span>Confirmar {action.name}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
