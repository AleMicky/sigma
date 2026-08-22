import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateGrupoAprobador,
  useUpdateGrupoAprobador,
} from "../api/grupo-aprobador.mutations"
import type { GrupoAprobador } from "../api/grupo-aprobador.service"
import {
  defaultGrupoAprobadorValues,
  grupoAprobadorSchema,
} from "../schemas/grupo-aprobador.schema"

type GrupoAprobadorFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  grupo?: GrupoAprobador | null
  onSuccess?: (grupo: GrupoAprobador) => void
}

export function GrupoAprobadorFormDialog({
  open,
  onOpenChange,
  grupo,
  onSuccess,
}: GrupoAprobadorFormDialogProps) {
  const isEditing = Boolean(grupo)
  const createMutation = useCreateGrupoAprobador()
  const updateMutation = useUpdateGrupoAprobador()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: grupo
      ? {
          codigo: grupo.codigo,
          nombre: grupo.nombre,
          descripcion: grupo.descripcion ?? "",
        }
      : defaultGrupoAprobadorValues,
    validators: {
      onSubmit: grupoAprobadorSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          codigo: value.codigo.trim(),
          nombre: value.nombre.trim(),
          descripcion: value.descripcion?.trim() || null,
        }

        const saved =
          isEditing && grupo
            ? await updateMutation.mutateAsync({
                id: grupo.id,
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
            : "No se pudo guardar el grupo aprobador.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar grupo aprobador" : "Nuevo grupo aprobador"}
      description={
        isEditing
          ? "Actualiza el código, nombre o descripción del grupo aprobador."
          : "Crea un nuevo grupo para estructurar flujos de aprobación."
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
      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

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
                onChange={(e) => field.handleChange(e.target.value)}
                required
                placeholder="GA-001"
              />
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
                placeholder="Ej. Aprobadores de Solicitudes TI"
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
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Descripción del alcance y propósito de este grupo aprobador…"
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
