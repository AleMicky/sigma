import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Sparkles, Wand2 } from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import {
  useCreateCatalogo,
  useUpdateCatalogo,
} from "../api/catalogo.mutations"
import type { Catalogo } from "../api/catalogo.service"
import {
  catalogoSchema,
  defaultCatalogoValues,
  type CatalogoDto,
} from "../schemas/catalogo.schema"

type CatalogoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogo?: Catalogo | null
  onSuccess?: (catalogo: Catalogo) => void
}

function formatSnakeCase(val: string): string {
  return val
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
}

export function CatalogoFormDialog({
  open,
  onOpenChange,
  catalogo,
  onSuccess,
}: CatalogoFormDialogProps) {
  const isEditing = Boolean(catalogo)
  const createMutation = useCreateCatalogo()
  const updateMutation = useUpdateCatalogo()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: catalogo
      ? { codigo: catalogo.codigo, nombre: catalogo.nombre }
      : defaultCatalogoValues,
    validators: {
      onSubmit: catalogoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload: CatalogoDto = {
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
      }

      try {
        const saved =
          isEditing && catalogo
            ? await updateMutation.mutateAsync({
                id: catalogo.id,
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
            : "No se pudo guardar el catálogo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar catálogo" : "Nuevo catálogo"}
      description={
        isEditing
          ? "Actualiza el código y nombre del catálogo maestro."
          : "Define un catálogo maestro para agrupar parámetros dinámicos."
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
          const formatted = formatSnakeCase(field.state.value)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <div className="flex items-center justify-between">
                <RequiredFieldLabel htmlFor={field.name}>
                  Código del Catálogo
                </RequiredFieldLabel>
                {field.state.value && field.state.value !== formatted ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => field.handleChange(formatted)}
                    className="h-6 gap-1 text-[11px] text-primary"
                    title="Convertir a UPPERCASE_SNAKE_CASE"
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
                placeholder="TIPO_DOCUMENTO"
                className="font-mono text-sm uppercase"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                <span>Identificador único en mayúsculas sin espacios.</span>
                {field.state.value ? (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-primary font-mono">
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
                Nombre Descriptivo
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
                placeholder="Tipo de documento de identidad"
              />
              <p className="text-xs text-muted-foreground">
                Nombre visible en los paneles y formularios del sistema.
              </p>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
        <Sparkles className="size-4 text-primary shrink-0" />
        <span>
          Al guardar, podrás agregar los valores e ítems hijos dentro de este catálogo.
        </span>
      </div>
    </FormDialog>
  )
}
