import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
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
  tipoActivoId?: string
  accesorio?: Accesorio | null
  onSuccess?: () => void
}

export function AccesorioFormDialog({
  open,
  onOpenChange,
  tipoActivoId: fixedTipoActivoId,
  accesorio,
  onSuccess,
}: AccesorioFormDialogProps) {
  const isEditing = Boolean(accesorio)
  const createMutation = useCreateAccesorio()
  const updateMutation = useUpdateAccesorio()
  const [formError, setFormError] = useState<string | null>(null)

  const tiposActivoQuery = useQuery({
    ...tipoActivoQueries.list({ page: 0, size: 100 }),
    enabled: !fixedTipoActivoId || open,
  })

  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )

  const tiposActivoById = useMemo(
    () => new Map(tiposActivo.map((t) => [t.id, t])),
    [tiposActivo],
  )

  const initialTipoActivoId =
    accesorio?.catalogo?.id ?? fixedTipoActivoId ?? ""

  const form = useForm({
    defaultValues: accesorio
      ? {
          tipoActivoId: initialTipoActivoId,
          codigo: accesorio.codigo,
          nombre: accesorio.nombre,
          descripcion: accesorio.descripcion ?? "",
        }
      : {
          ...defaultAccesorioValues,
          tipoActivoId: fixedTipoActivoId ?? "",
        },
    validators: {
      onSubmit: accesorioSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const targetTipoActivoId = fixedTipoActivoId || value.tipoActivoId

      const payload = {
        tipoActivoId: targetTipoActivoId,
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
          : "Define un accesorio asociado a un tipo de activo, como GPS o Botiquín."
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
      {!fixedTipoActivoId && (
        <form.Field name="tipoActivoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selected = tiposActivoById.get(field.state.value)

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Tipo de Activo
                </RequiredFieldLabel>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) => field.handleChange(value ?? "")}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Seleccionar tipo de activo">
                      {selected ? selected.nombre : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tiposActivo.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
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
