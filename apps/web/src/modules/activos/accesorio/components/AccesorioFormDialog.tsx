import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { FolderTree } from "lucide-react"

import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
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
  useCreateAccesorio,
  useUpdateAccesorio,
} from "../api/accesorio.mutations"
import type { Accesorio } from "../api/accesorio.service"
import {
  defaultAccesorioValues,
  accesorioSchema,
} from "../schemas/accesorio.schema"

type AccesorioFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoriaId?: string
  accesorio?: Accesorio | null
  onSuccess?: () => void
}

export function AccesorioFormDialog({
  open,
  onOpenChange,
  categoriaId: fixedCategoriaId,
  accesorio,
  onSuccess,
}: AccesorioFormDialogProps) {
  const isEditing = Boolean(accesorio)
  const createMutation = useCreateAccesorio()
  const updateMutation = useUpdateAccesorio()
  const [formError, setFormError] = useState<string | null>(null)

  const categoriasQuery = useQuery({
    ...categoriaQueries.list({ page: 0, size: 100 }),
    enabled: !fixedCategoriaId || open,
  })

  const categorias = useMemo(
    () => categoriasQuery.data?.content ?? [],
    [categoriasQuery.data?.content],
  )

  const categoriasById = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias],
  )

  const initialCategoriaId =
    accesorio?.catalogo?.id ?? fixedCategoriaId ?? ""

  const form = useForm({
    defaultValues: accesorio
      ? {
          categoriaId: initialCategoriaId,
          codigo: accesorio.codigo,
          nombre: accesorio.nombre,
          descripcion: accesorio.descripcion ?? "",
        }
      : {
          ...defaultAccesorioValues,
          categoriaId: fixedCategoriaId ?? "",
        },
    validators: {
      onSubmit: accesorioSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const targetCategoriaId = fixedCategoriaId || value.categoriaId

      const payload = {
        categoriaId: targetCategoriaId,
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      }

      try {
        if (isEditing && accesorio) {
          await updateMutation.mutateAsync({
            id: accesorio.id,
            payload,
          })
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
            : "No se pudo guardar el accesorio.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar accesorio" : "Crear accesorio"}
      description={
        isEditing
          ? "Actualiza la información del accesorio."
          : "Define un accesorio asociado a una categoría, como GPS o Botiquín."
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
      {!fixedCategoriaId && (
        <form.Field name="categoriaId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selected = categoriasById.get(field.state.value)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Categoría
                </RequiredFieldLabel>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) => field.handleChange(value ?? "")}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Seleccionar categoría">
                      {selected ? (
                        <div className="flex items-center gap-2 truncate">
                          <FolderTree className="size-3.5 shrink-0 text-primary" />
                          <span className="truncate font-medium text-foreground">
                            {selected.nombre}
                          </span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {categorias.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderTree className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate font-medium text-foreground">
                            {cat.nombre}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({cat.codigo})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      )}

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
                placeholder="GPS"
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
                placeholder="GPS Rastreador"
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
                placeholder="Navegador GPS para el activo"
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
