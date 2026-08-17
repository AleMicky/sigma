import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { tipoInsumoQueries } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.queries"
import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateCategoriaInsumo,
  useUpdateCategoriaInsumo,
} from "../api/categoria-insumo.mutations"
import type { CategoriaInsumo } from "../api/categoria-insumo.service"
import {
  defaultCategoriaInsumoValues,
  categoriaInsumoSchema,
} from "../schemas/categoria-insumo.schema"

type CategoriaInsumoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: CategoriaInsumo | null
  onSuccess?: (categoria: CategoriaInsumo) => void
}

export function CategoriaInsumoFormDialog({
  open,
  onOpenChange,
  categoria,
  onSuccess,
}: CategoriaInsumoFormDialogProps) {
  const isEditing = Boolean(categoria)
  const createMutation = useCreateCategoriaInsumo()
  const updateMutation = useUpdateCategoriaInsumo()
  const [formError, setFormError] = useState<string | null>(null)

  const tiposInsumoQuery = useQuery(
    tipoInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposInsumo = tiposInsumoQuery.data?.content ?? []

  const form = useForm({
    defaultValues: categoria
      ? {
          tipoInsumoId: categoria.tipoInsumo?.id ?? categoria.tipoInsumoId ?? "",
          codigo: categoria.codigo,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? "",
        }
      : defaultCategoriaInsumoValues,
    validators: {
      onSubmit: categoriaInsumoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && categoria
            ? await updateMutation.mutateAsync({
                id: categoria.id,
                payload: {
                  tipoInsumoId: value.tipoInsumoId,
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion?.trim() || null,
                },
              })
            : await createMutation.mutateAsync({
                tipoInsumoId: value.tipoInsumoId,
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion?.trim() || null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la categoría de insumo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar categoría de insumo" : "Nueva categoría de insumo"}
      description={
        isEditing
          ? "Actualiza el tipo de insumo, código, nombre o descripción de la categoría de insumo."
          : "Crea una categoría para clasificar insumos (ej. Materiales Eléctricos, Lubricantes)."
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
      <form.Field name="tipoInsumoId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de insumo
              </RequiredFieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val ?? "")}
              >
                <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                  <SelectValue placeholder="Selecciona un tipo de insumo…" />
                </SelectTrigger>
                <SelectContent>
                  {tiposInsumo.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre} ({tipo.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
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
                aria-required
                aria-invalid={isInvalid}
                placeholder="LUBRICANTES"
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
                aria-required
                aria-invalid={isInvalid}
                placeholder="Aceites y Lubricantes"
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
                aria-invalid={isInvalid}
                placeholder="Insumos utilizados para lubricación y mantenimiento"
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
