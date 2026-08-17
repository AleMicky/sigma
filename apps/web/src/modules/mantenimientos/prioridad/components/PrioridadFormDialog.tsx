import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreatePrioridad,
  useUpdatePrioridad,
} from "../api/prioridad.mutations"
import type { Prioridad } from "../api/prioridad.service"
import {
  defaultPrioridadValues,
  prioridadSchema,
} from "../schemas/prioridad.schema"

type PrioridadFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prioridad?: Prioridad | null
  onSuccess?: (prioridad: Prioridad) => void
}

const NIVEL_OPTIONS = [
  { value: 1, label: "Nivel 1 - Muy Baja", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: 2, label: "Nivel 2 - Baja", color: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { value: 3, label: "Nivel 3 - Media", color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300" },
  { value: 4, label: "Nivel 4 - Alta", color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: 5, label: "Nivel 5 - Crítica / Urgente", color: "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300" },
]

export function PrioridadFormDialog({
  open,
  onOpenChange,
  prioridad,
  onSuccess,
}: PrioridadFormDialogProps) {
  const isEditing = Boolean(prioridad)
  const createMutation = useCreatePrioridad()
  const updateMutation = useUpdatePrioridad()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: prioridad
      ? {
          codigo: prioridad.codigo,
          nombre: prioridad.nombre,
          descripcion: prioridad.descripcion ?? "",
          nivel: prioridad.nivel,
        }
      : defaultPrioridadValues,
    validators: {
      onSubmit: prioridadSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && prioridad
            ? await updateMutation.mutateAsync({
                id: prioridad.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: (value.descripcion ?? "").trim() || null,
                  nivel: Number(value.nivel),
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: (value.descripcion ?? "").trim() || null,
                nivel: Number(value.nivel),
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la prioridad.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar prioridad" : "Nueva prioridad"}
      description={
        isEditing
          ? "Actualiza la configuración de esta prioridad de mantenimiento."
          : "Define una nueva prioridad para categorizar el nivel de urgencia de la atención."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) =>
            [state.canSubmit, state.isSubmitting] as const
          }
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
      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Código Identificador
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.value.toUpperCase().replace(/\s+/g, "_"))
                }
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="EJ: ALTA, MEDIA, CRITICA"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código técnico único en mayúsculas (ej. ALTA, CRITICA).
              </p>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nombre
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="Alta, Media, Urgencia Crítica"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="nivel">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nivel de Prioridad (1 a 5)
              </RequiredFieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {NIVEL_OPTIONS.map((opt) => {
                  const selected = field.state.value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.handleChange(opt.value)}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-xs font-medium transition-all ${
                        selected
                          ? `${opt.color} ring-2 ring-primary/40 font-semibold`
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Detalle de criterios de atención o tiempos de respuesta..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && prioridad ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={prioridad} />
        </div>
      ) : null}
    </FormDialog>
  )
}
