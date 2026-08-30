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
        porDefecto: Boolean(prioridad.porDefecto),
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
                porDefecto: Boolean(value.porDefecto),
              },
            })
            : await createMutation.mutateAsync({
              codigo: value.codigo.trim(),
              nombre: value.nombre.trim(),
              descripcion: (value.descripcion ?? "").trim() || null,
              nivel: Number(value.nivel),
              porDefecto: Boolean(value.porDefecto),
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
      size="sm"
      title={isEditing ? "Editar prioridad" : "Nueva prioridad"}
      description={
        isEditing
          ? "Actualiza los datos de esta prioridad de mantenimiento."
          : "Define una nueva prioridad y su nivel de urgencia."
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.Field name="codigo">
          {(field) => {
            const isInvalid = Boolean(field.state.meta.errors.length)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Código
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    )
                  }
                  aria-required
                  aria-invalid={isInvalid}
                  placeholder="EJ: ALTA"
                  className="font-mono uppercase"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="nivel">
          {(field) => {
            const isInvalid = Boolean(field.state.meta.errors.length)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Nivel (1 - 5)
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={1}
                  max={5}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value))
                  }
                  aria-required
                  aria-invalid={isInvalid}
                  placeholder="1 - 5"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid = Boolean(field.state.meta.errors.length)

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
                aria-required
                aria-invalid={isInvalid}
                placeholder="Alta, Media, Urgencia Crítica..."
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid = Boolean(field.state.meta.errors.length)

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
                placeholder="Detalle de criterios de atención o tiempos..."
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="porDefecto">
        {(field) => (
          <Field orientation="horizontal" className="pt-0.5">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 rounded border border-input accent-primary"
            />
            <div className="flex flex-col gap-0.5">
              <FieldLabel htmlFor={field.name} className="font-medium text-xs">
                Establecer como prioridad por defecto
              </FieldLabel>
              <p className="text-[11px] text-muted-foreground">
                Se autoseleccionará automáticamente al crear nuevas solicitudes.
              </p>
            </div>
          </Field>
        )}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && prioridad ? (
        <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1 mt-1 text-xs">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={prioridad} compact />
        </div>
      ) : null}
    </FormDialog>
  )
}
