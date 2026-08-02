import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import {
  useCreateCatalogoItem,
  useUpdateCatalogoItem,
} from "../api/catalogo-item.mutations"
import type { CatalogoItem } from "../api/catalogo-item.service"
import {
  catalogoItemSchema,
  defaultCatalogoItemValues,
} from "../schemas/catalogo-item.schema"

type CatalogoItemFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogoId: string
  item?: CatalogoItem | null
}

export function CatalogoItemFormSheet({
  open,
  onOpenChange,
  catalogoId,
  item,
}: CatalogoItemFormSheetProps) {
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setFormError(null)
          form.reset()
        }
        onOpenChange(next)
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar valor" : "Agregar valor"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza el ítem del catálogo seleccionado."
              : "Agrega un ítem hijo, por ejemplo CI o Pasaporte."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 px-4"
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
                    <FieldLabel htmlFor={field.name}>Valor</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                    <FieldLabel htmlFor={field.name}>Orden</FieldLabel>
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

          <SheetFooter className="px-0">
            <form.Subscribe
              selector={(state) =>
                [state.canSubmit, state.isSubmitting] as const
              }
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Guardando…" : "Guardar"}
                </Button>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
