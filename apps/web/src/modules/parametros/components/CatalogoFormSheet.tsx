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
  useCreateCatalogo,
  useUpdateCatalogo,
} from "../api/catalogo.mutations"
import type { Catalogo } from "../api/catalogo.service"
import {
  catalogoSchema,
  defaultCatalogoValues,
  type CatalogoDto,
} from "../schemas/catalogo.schema"

type CatalogoFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogo?: Catalogo | null
  onSuccess?: (catalogo: Catalogo) => void
}

export function CatalogoFormSheet({
  open,
  onOpenChange,
  catalogo,
  onSuccess,
}: CatalogoFormSheetProps) {
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
        const saved = isEditing && catalogo
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
            {isEditing ? "Editar catálogo" : "Nuevo catálogo"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Actualiza el código y nombre del catálogo maestro."
              : "Define un catálogo maestro, por ejemplo Tipo de documento."}
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
            <form.Field name="codigo">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>Código</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
