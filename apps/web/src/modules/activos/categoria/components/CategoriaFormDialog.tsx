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
  useCreateCategoria,
  useUpdateCategoria,
} from "../api/categoria.mutations"
import type { Categoria } from "../api/categoria.service"
import {
  defaultCategoriaValues,
  categoriaSchema,
} from "../schemas/categoria.schema"

type CategoriaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria | null
  onSuccess?: (categoria: Categoria) => void
}

export function CategoriaFormDialog({
  open,
  onOpenChange,
  categoria,
  onSuccess,
}: CategoriaFormDialogProps) {
  const isEditing = Boolean(categoria)
  const createMutation = useCreateCategoria()
  const updateMutation = useUpdateCategoria()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: categoria
      ? {
          codigo: categoria.codigo,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? "",
          orden: categoria.orden ?? 0,
        }
      : defaultCategoriaValues,
    validators: {
      onSubmit: categoriaSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && categoria
            ? await updateMutation.mutateAsync({
                id: categoria.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion.trim() || null,
                  orden: value.orden ?? 0,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                orden: null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la categoría.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description={
        isEditing
          ? "Actualiza la configuración, denominación o posición de orden de la categoría."
          : "Define una nueva categoría para organizar y catalogar activos."
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
                placeholder="EJ: VEHICULOS, COMPUTO"
                className="font-mono uppercase"
              />
              <p className="text-[11px] text-muted-foreground">
                Código único en mayúsculas sin espacios (ej. MOBILIARIO, EQUIPO_MEDICO).
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
                Nombre de la Categoría
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
                placeholder="Equipos de Cómputo y Telecomunicaciones"
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
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Criterios y alcance de bienes incluidos en esta categoría..."
                rows={3}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {isEditing ? (
        <form.Field name="orden">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Orden de visualización</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  value={field.state.value ?? 0}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  aria-invalid={isInvalid}
                  className="font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Prioridad en menús desplegables (números menores aparecen primero).
                </p>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      ) : (
        <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/60">
          El orden se asigna automáticamente al crear la categoría.
        </p>
      )}

      {/* Audit info in edit mode */}
      {isEditing && categoria ? (
        <div className="rounded-lg border bg-muted/30 p-3 pt-2.5 space-y-1 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Auditoría
          </p>
          <AuditInfo data={categoria} />
        </div>
      ) : null}
    </FormDialog>
  )
}
