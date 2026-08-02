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

      const payload = {
        catalogoId,
        nombre: value.nombre.trim(),
        valor: value.valor.trim(),
        orden: value.orden ?? 0,
      }

      try {
        if (isEditing && item) {
          await updateMutation.mutateAsync({ id: item.id, payload })
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
            : "No se pudo guardar el valor.",
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
            {isEditing ? "Editar valor" : "Agregar valor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza el ítem del catálogo seleccionado."
              : "Agrega un ítem hijo, por ejemplo CI o Pasaporte."}{" "}
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
            <form.Field name="valor">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>
                      Valor{" "}
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
                      placeholder="CI"
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
                      placeholder="Cédula de identidad"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    <FieldLabel htmlFor={field.name}>
                      Orden{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={0}
                      value={field.state.value ?? 0}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === ""
                            ? 0
                            : Number(e.target.value),
                        )
                      }
                      aria-invalid={isInvalid}
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
