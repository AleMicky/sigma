import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setFormError(null)
          form.reset()
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar catálogo" : "Nuevo catálogo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza el código y nombre del catálogo maestro."
              : "Define un catálogo maestro, por ejemplo Tipo de documento."}{" "}
            <span className="text-muted-foreground">
              Los campos con <span className="text-destructive">*</span> son
              obligatorios.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="codigo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>
                      Código{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </FieldLabel>
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
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    <FieldLabel htmlFor={field.name}>
                      Nombre{" "}
                      <span className="text-destructive" aria-hidden>
                        *
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                      aria-required
                      aria-invalid={isInvalid}
                      placeholder="Tipo de documento"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Guardando…" : "Guardar"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
