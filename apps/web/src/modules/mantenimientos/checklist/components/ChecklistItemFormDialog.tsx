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
  useCreateChecklistItem,
  useUpdateChecklistItem,
} from "../api/checklist-item.mutations"
import type { ChecklistItem } from "../api/checklist-item.service"
import {
  checklistItemSchema,
  defaultChecklistItemValues,
} from "../schemas/checklist-item.schema"

type ChecklistItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  checklistId: string
  item?: ChecklistItem | null
  nextOrder?: number
  onSuccess?: (item: ChecklistItem) => void
}

export function ChecklistItemFormDialog({
  open,
  onOpenChange,
  checklistId,
  item,
  nextOrder = 0,
  onSuccess,
}: ChecklistItemFormDialogProps) {
  const isEditing = Boolean(item)
  const createMutation = useCreateChecklistItem()
  const updateMutation = useUpdateChecklistItem()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: item
      ? {
          checklistMantenimientoId: checklistId,
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion ?? "",
          tipoDatoId: item.tipoDato?.id ?? "",
          orden: item.orden,
          obligatorio: item.obligatorio,
          opciones: item.opciones ?? "",
        }
      : {
          ...defaultChecklistItemValues,
          checklistMantenimientoId: checklistId,
          orden: nextOrder,
        },
    validators: {
      onSubmit: checklistItemSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          checklistMantenimientoId: checklistId,
          codigo: value.codigo.trim(),
          nombre: value.nombre.trim(),
          descripcion: (value.descripcion ?? "").trim() || null,
          tipoDatoId: value.tipoDatoId.trim(),
          orden: Number(value.orden),
          obligatorio: value.obligatorio,
          opciones: (value.opciones ?? "").trim() || null,
        }

        const saved =
          isEditing && item
            ? await updateMutation.mutateAsync({
                id: item.id,
                payload,
              })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el ítem del checklist.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar ítem de checklist" : "Nuevo ítem de verificación"}
      description={
        isEditing
          ? "Modifica las especificaciones de este paso de verificación."
          : "Define un nuevo paso o ítem que deberá ser completado durante la revisión."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <form.Field name="codigo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Código Ítem
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
                  required
                  aria-required
                  aria-invalid={isInvalid}
                  placeholder="EJ: ITEM-01, NIVEL_ACEITE"
                  className="font-mono uppercase"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="orden">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Secuencia / Orden
                </RequiredFieldLabel>
                <Input
                  type="number"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  required
                  aria-required
                  aria-invalid={isInvalid}
                  min={0}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nombre / Pregunta del Ítem
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
                placeholder="Ej. Verificar nivel de aceite en varilla"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="tipoDatoId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                ID Tipo de Dato
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
                placeholder="UUID del Tipo de Dato (Texto, Booleano, Número, etc.)"
              />
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
              <FieldLabel htmlFor={field.name}>Instrucciones / Criterio</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Criterios de aceptación o notas para la medición..."
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="opciones">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Opciones JSON (Opcional si es tipo Selección)
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='[{"value":"OK","label":"Conforme"},{"value":"NOK","label":"No Conforme"}]'
              className="font-mono text-xs"
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="obligatorio">
        {(field) => (
          <label className="flex items-center gap-2.5 rounded-lg border border-border/80 p-2.5 hover:bg-muted/30 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs font-semibold text-foreground">
              Respuesta obligatoria para completar el checklist
            </span>
          </label>
        )}
      </form.Field>

      {/* Audit info in edit mode */}
      {isEditing && item ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={item} />
        </div>
      ) : null}
    </FormDialog>
  )
}
