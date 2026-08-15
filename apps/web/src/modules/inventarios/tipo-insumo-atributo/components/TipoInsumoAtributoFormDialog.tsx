import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
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

import {
  useCreateTipoInsumoAtributo,
  useUpdateTipoInsumoAtributo,
} from "../api/tipo-insumo-atributo.mutations"
import type { TipoInsumoAtributo } from "../api/tipo-insumo-atributo.service"
import {
  defaultTipoInsumoAtributoValues,
  tipoInsumoAtributoSchema,
} from "../schemas/tipo-insumo-atributo.schema"

type TipoInsumoAtributoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoInsumoId: string
  atributo?: TipoInsumoAtributo | null
  onSuccess?: (atributo: TipoInsumoAtributo) => void
}

export function TipoInsumoAtributoFormDialog({
  open,
  onOpenChange,
  tipoInsumoId,
  atributo,
  onSuccess,
}: TipoInsumoAtributoFormDialogProps) {
  const isEditing = Boolean(atributo)
  const createMutation = useCreateTipoInsumoAtributo()
  const updateMutation = useUpdateTipoInsumoAtributo()
  const [formError, setFormError] = useState<string | null>(null)

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposDato = tiposDatoQuery.data?.content ?? []

  const form = useForm({
    defaultValues: atributo
      ? {
          tipoDatoId: atributo.tipoDatoId,
          tipoInsumoId: atributo.tipoInsumoId,
          codigo: atributo.codigo,
          nombre: atributo.nombre,
          requerido: atributo.requerido ?? false,
          orden: atributo.orden ?? 0,
        }
      : {
          ...defaultTipoInsumoAtributoValues,
          tipoInsumoId,
        },
    validators: {
      onSubmit: tipoInsumoAtributoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const saved =
          isEditing && atributo
            ? await updateMutation.mutateAsync({
                id: atributo.id,
                payload: {
                  tipoDatoId: value.tipoDatoId,
                  tipoInsumoId,
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  requerido: value.requerido,
                  orden: value.orden,
                },
              })
            : await createMutation.mutateAsync({
                tipoDatoId: value.tipoDatoId,
                tipoInsumoId,
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                requerido: value.requerido,
                orden: value.orden,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el atributo del tipo de insumo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar atributo de insumo" : "Nuevo atributo de insumo"}
      description={
        isEditing
          ? "Actualiza la configuración del atributo para este tipo de insumo."
          : "Define un nuevo atributo dinámico (ej. Viscosidad, Diámetro, Voltaje) para este tipo de insumo."
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
                placeholder="VISCOSIDAD"
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
                placeholder="Grado de Viscosidad"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="tipoDatoId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de dato
              </RequiredFieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val ?? "")}
              >
                <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                  <SelectValue placeholder="Selecciona un tipo de dato…" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDato.map((tipo) => (
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

      <div className="grid grid-cols-2 gap-4">
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
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="requerido">
          {(field) => {
            return (
              <Field className="flex flex-col justify-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>¿Es obligatorio?</span>
                </label>
              </Field>
            )
          }}
        </form.Field>
      </div>
    </FormDialog>
  )
}
