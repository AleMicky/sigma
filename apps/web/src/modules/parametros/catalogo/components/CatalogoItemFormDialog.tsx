import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Layers, Wand2 } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import {
  useCreateCatalogoItem,
  useUpdateCatalogoItem,
} from "../api/catalogo-item.mutations"
import type { CatalogoItem } from "../api/catalogo-item.service"
import {
  catalogoItemSchema,
  defaultCatalogoItemValues,
} from "../schemas/catalogo-item.schema"

type CatalogoItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogoId: string
  item?: CatalogoItem | null
  onSuccess?: () => void
}

function formatValue(val: string): string {
  return val
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9_-]/g, "_")
}

export function CatalogoItemFormDialog({
  open,
  onOpenChange,
  catalogoId,
  item,
  onSuccess,
}: CatalogoItemFormDialogProps) {
  const isEditing = Boolean(item)
  const createMutation = useCreateCatalogoItem()
  const updateMutation = useUpdateCatalogoItem()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: item
      ? {
          nombre: item.nombre,
          valor: item.valor,
          orden: item.orden,
        }
      : defaultCatalogoItemValues,
    validators: {
      onSubmit: catalogoItemSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        if (isEditing && item) {
          await updateMutation.mutateAsync({
            id: item.id,
            payload: {
              catalogoId,
              nombre: value.nombre.trim(),
              valor: value.valor.trim(),
              orden: value.orden ?? 0,
            },
          })
        } else {
          await createMutation.mutateAsync({
            catalogoId,
            nombre: value.nombre.trim(),
            valor: value.valor.trim(),
            orden: null,
          })
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el valor.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar valor de catálogo" : "Agregar valor al catálogo"}
      description={
        isEditing
          ? "Actualiza las propiedades del ítem del catálogo."
          : "Define un nuevo ítem hijo, por ejemplo 'CI' o 'Pasaporte'."
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
      <form.Field name="valor">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          const formatted = formatValue(field.state.value)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <div className="flex items-center justify-between">
                <RequiredFieldLabel htmlFor={field.name}>
                  Valor (Clave Almacenada)
                </RequiredFieldLabel>
                {field.state.value && field.state.value !== formatted ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => field.handleChange(formatted)}
                    className="h-6 gap-1 text-[11px] text-primary"
                    title="Convertir a mayúsculas sin espacios"
                  >
                    <Wand2 className="size-3" />
                    Formatear
                  </Button>
                ) : null}
              </div>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="CI"
                className="font-mono text-sm uppercase"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                <span>Clave interna guardada en la base de datos.</span>
                {field.state.value ? (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {field.state.value.toUpperCase()}
                  </code>
                ) : null}
              </div>
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
                Nombre Visible (Etiqueta)
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
                placeholder="Cédula de Identidad"
              />
              <p className="text-xs text-muted-foreground">
                Texto legible presentado en selectores y reportes.
              </p>
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
                <FieldLabel htmlFor={field.name}>Orden de Presentación</FieldLabel>
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
                  className="w-32 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Número relativo para posicionar este ítem en la lista desplegable.
                </p>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Layers className="size-4 text-primary shrink-0" />
          <span>
            El número de orden de este ítem se asignará automáticamente al final de la lista.
          </span>
        </div>
      )}
    </FormDialog>
  )
}
