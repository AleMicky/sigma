import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  Award,
  Calendar,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

import { EmpleadoCombobox } from "../../empleado/components/EmpleadoCombobox"
import {
  useCreateEmpleadoResponsabilidad,
  useUpdateEmpleadoResponsabilidad,
} from "../api/empleado-responsabilidad.mutations"
import type { EmpleadoResponsabilidad } from "../api/empleado-responsabilidad.service"
import {
  defaultEmpleadoResponsabilidadValues,
  empleadoResponsabilidadSchema,
} from "../schemas/empleado-responsabilidad.schema"

type EmpleadoResponsabilidadFormDialogProps = {
  responsabilidadId: string
  responsabilidadNombre?: string
  responsabilidadCodigo?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  asignacion?: EmpleadoResponsabilidad | null
  onSuccess?: () => void
}

function calculateDurationText(
  fechaInicio: string,
  fechaFin: string | null,
): { label: string; isIndefinite: boolean } {
  if (!fechaInicio) return { label: "Define la fecha de inicio", isIndefinite: true }
  if (!fechaFin) return { label: "Vigencia continua / Indefinida", isIndefinite: true }

  const start = new Date(fechaInicio)
  const end = new Date(fechaFin)

  if (end < start) {
    return { label: "Rango de fechas inválido", isIndefinite: false }
  }

  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return { label: `${diffDays} día${diffDays === 1 ? "" : "s"} de vigencia`, isIndefinite: false }
  }

  const months = Math.round(diffDays / 30.44)
  if (months < 12) {
    return { label: `Aprox. ${months} mes${months === 1 ? "" : "es"} de vigencia`, isIndefinite: false }
  }

  const years = (months / 12).toFixed(1).replace(".0", "")
  return { label: `Aprox. ${years} año${years === "1" ? "" : "s"} de vigencia`, isIndefinite: false }
}

export function EmpleadoResponsabilidadFormDialog({
  responsabilidadId,
  responsabilidadNombre,
  responsabilidadCodigo,
  open,
  onOpenChange,
  asignacion,
  onSuccess,
}: EmpleadoResponsabilidadFormDialogProps) {
  const isEditing = Boolean(asignacion)
  const createMutation = useCreateEmpleadoResponsabilidad()
  const updateMutation = useUpdateEmpleadoResponsabilidad()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: asignacion
      ? {
          empleadoId:
            asignacion.empleadoInfo?.id ?? asignacion.empleadoId ?? "",
          responsabilidadId:
            asignacion.responsabilidadInfo?.id ??
            asignacion.responsabilidadId ??
            responsabilidadId,
          fechaInicio: asignacion.fechaInicio ?? "",
          fechaFin: asignacion.fechaFin ?? "",
        }
      : {
          ...defaultEmpleadoResponsabilidadValues,
          responsabilidadId,
        },
    validators: {
      onSubmit: empleadoResponsabilidadSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          empleadoId: value.empleadoId,
          responsabilidadId,
          fechaInicio: value.fechaInicio,
          fechaFin: value.fechaFin || null,
        }

        if (isEditing && asignacion) {
          await updateMutation.mutateAsync({
            id: asignacion.id,
            payload,
          })
        } else {
          await createMutation.mutateAsync(payload)
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la asignación de responsabilidad.",
        )
      }
    },
  })

  // Funciones para presets de fechas
  function setPresetIndefinite() {
    form.setFieldValue("fechaFin", "")
  }

  function setPresetEndOfYear() {
    const inicio = form.getFieldValue("fechaInicio") || new Date().toISOString().split("T")[0]
    const year = new Date(inicio).getFullYear()
    form.setFieldValue("fechaFin", `${year}-12-31`)
  }

  function setPresetMonths(monthsToAdd: number) {
    const inicioStr = form.getFieldValue("fechaInicio") || new Date().toISOString().split("T")[0]
    const date = new Date(inicioStr)
    date.setMonth(date.getMonth() + monthsToAdd)
    form.setFieldValue("fechaFin", date.toISOString().split("T")[0])
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing
          ? "Editar asignación de responsabilidad"
          : "Asignar empleado a responsabilidad"
      }
      description={
        isEditing
          ? `Modifica el colaborador asignado o el período de vigencia para "${responsabilidadNombre ?? "la responsabilidad"}".`
          : `Selecciona el colaborador y establece el período de vigencia de esta responsabilidad.`
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </form.Subscribe>
      }
    >
      {/* Banner de Contexto de la Responsabilidad */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 shadow-2xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <Award className="size-4.5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground truncate">
              {responsabilidadNombre ?? "Responsabilidad Organizacional"}
            </span>
            {responsabilidadCodigo ? (
              <Badge
                variant="outline"
                className="font-mono text-[10px] px-1.5 py-0 font-semibold bg-background/80"
              >
                {responsabilidadCodigo}
              </Badge>
            ) : null}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            Rol transversal institucional asignable a colaboradores
          </span>
        </div>
      </div>

      {/* Sección 1: Selección del Colaborador (con Card Select como la imagen de referencia) */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <UserCheck className="size-4 text-primary" />
            <span>Colaborador / Funcionario</span>
          </div>
          <Badge variant="secondary" className="text-[10px] font-normal px-2">
            Búsqueda interactiva
          </Badge>
        </div>

        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Empleado Asignado
                </RequiredFieldLabel>

                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Escribe el nombre o código del empleado (ej. EMP-001)…"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* Sección 2: Período de Vigencia y Presets */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Calendar className="size-4 text-primary" />
            <span>Período y Vigencia</span>
          </div>

          <form.Subscribe
            selector={(state) => ({
              inicio: state.values.fechaInicio,
              fin: state.values.fechaFin,
            })}
          >
            {({ inicio, fin }) => {
              const { label, isIndefinite } = calculateDurationText(
                inicio ?? "",
                fin ?? null,
              )
              return (
                <Badge
                  variant={isIndefinite ? "secondary" : "outline"}
                  className={cn(
                    "text-[10px] font-normal px-2 h-5",
                    isIndefinite
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "text-muted-foreground bg-background",
                  )}
                >
                  <Clock className="size-3 mr-1" />
                  {label}
                </Badge>
              )
            }}
          </form.Subscribe>
        </div>

        {/* Atajos Rápidos de Vigencia */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" />
            <span>Atajos:</span>
          </span>
          <button
            type="button"
            onClick={setPresetIndefinite}
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            Indefinido
          </button>
          <button
            type="button"
            onClick={() => setPresetMonths(6)}
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            6 Meses
          </button>
          <button
            type="button"
            onClick={() => setPresetMonths(12)}
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            1 Año
          </button>
          <button
            type="button"
            onClick={setPresetEndOfYear}
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          >
            Fin de Año
          </button>
        </div>

        {/* Inputs de Fechas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
          <form.Field name="fechaInicio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Fecha Inicio
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    className="shadow-2xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="fechaFin">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>
                    Fecha Fin (Opcional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="shadow-2xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      {isEditing && asignacion ? (
        <div className="pt-2 border-t">
          <AuditInfo data={asignacion} />
        </div>
      ) : null}
    </FormDialog>
  )
}
