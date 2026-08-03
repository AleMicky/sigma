import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { Plus, Trash2 } from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"

import {
  useCreateActivoAtributo,
  useUpdateActivoAtributo,
} from "../api/activo-atributo.mutations"
import type { ActivoAtributo } from "../api/activo-atributo.service"
import {
  defaultActivoAtributoValues,
  activoAtributoSchema,
} from "../schemas/activo-atributo.schema"

type ActivoAtributoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoActivoId: string
  atributo?: ActivoAtributo | null
  onSuccess?: () => void
}

export function ActivoAtributoFormDialog({
  open,
  onOpenChange,
  tipoActivoId,
  atributo,
  onSuccess,
}: ActivoAtributoFormDialogProps) {
  const isEditing = Boolean(atributo)
  const createMutation = useCreateActivoAtributo()
  const updateMutation = useUpdateActivoAtributo()
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
  const tiposById = useMemo(
    () => new Map(tiposDato.map((tipo) => [tipo.id, tipo])),
    [tiposDato],
  )

  const form = useForm({
    defaultValues: atributo
      ? {
          codigo: atributo.codigo,
          etiqueta: atributo.etiqueta,
          descripcion: atributo.descripcion ?? "",
          tipoDatoId: atributo.tipoDatoId,
          orden: atributo.orden,
          requerido: atributo.requerido,
          visible: atributo.visible,
          editable: atributo.editable,
          valorDefecto: atributo.valorDefecto ?? "",
          opciones: atributo.opciones ?? [],
        }
      : defaultActivoAtributoValues,
    validators: {
      onSubmit: activoAtributoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const tipoDato = tiposById.get(value.tipoDatoId)
      if (!tipoDato) {
        setFormError("Selecciona un tipo de dato válido.")
        return
      }

      if (tipoDato.permiteOpciones && value.opciones.length === 0) {
        setFormError("Agrega al menos una opción para este tipo de dato.")
        return
      }

      const payload = {
        tipoActivoId,
        codigo: value.codigo.trim(),
        etiqueta: value.etiqueta.trim(),
        descripcion: value.descripcion.trim() || null,
        tipoDatoId: value.tipoDatoId,
        orden: isEditing ? (value.orden ?? 0) : null,
        requerido: value.requerido,
        visible: value.visible,
        editable: value.editable,
        valorDefecto: value.valorDefecto.trim() || null,
        opciones: tipoDato.permiteOpciones
          ? value.opciones.map((opcion) => ({
              value: opcion.value.trim(),
              label: opcion.label.trim(),
            }))
          : null,
      }

      try {
        if (isEditing && atributo) {
          await updateMutation.mutateAsync({
            id: atributo.id,
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
            : "No se pudo guardar el atributo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={isEditing ? "Editar atributo" : "Crear atributo"}
      description={
        isEditing
          ? "Actualiza el campo personalizado del tipo de activo."
          : "Define un campo personalizado, por ejemplo placa o marca."
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
                placeholder="TIPO_COMBUSTIBLE"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="etiqueta">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Etiqueta
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
                placeholder="Tipo de combustible"
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
                placeholder="Combustible utilizado por el vehículo"
                rows={2}
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
          const selected = tiposById.get(field.state.value)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de dato
              </RequiredFieldLabel>
              <Select
                value={field.state.value || null}
                onValueChange={(value) => {
                  const nextId = value ?? ""
                  field.handleChange(nextId)
                  const nextTipo = tiposById.get(nextId)
                  if (!nextTipo?.permiteOpciones) {
                    form.setFieldValue("opciones", [])
                  } else if (form.state.values.opciones.length === 0) {
                    form.setFieldValue("opciones", [
                      { value: "", label: "" },
                    ])
                  }
                }}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue placeholder="Seleccionar tipo de dato">
                    {selected
                      ? `${selected.nombre} (${selected.codigo})`
                      : null}
                  </SelectValue>
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

      <form.Field name="valorDefecto">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Valor por defecto</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Opcional"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <form.Field name="requerido">
          {(field) => (
            <Field orientation="horizontal">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 rounded border border-input accent-primary"
              />
              <FieldLabel htmlFor={field.name} className="font-normal">
                Requerido
              </FieldLabel>
            </Field>
          )}
        </form.Field>

        <form.Field name="visible">
          {(field) => (
            <Field orientation="horizontal">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 rounded border border-input accent-primary"
              />
              <FieldLabel htmlFor={field.name} className="font-normal">
                Visible
              </FieldLabel>
            </Field>
          )}
        </form.Field>

        <form.Field name="editable">
          {(field) => (
            <Field orientation="horizontal">
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 rounded border border-input accent-primary"
              />
              <FieldLabel htmlFor={field.name} className="font-normal">
                Editable
              </FieldLabel>
            </Field>
          )}
        </form.Field>
      </div>

      {isEditing ? (
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
                      e.target.value === "" ? 0 : Number(e.target.value),
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
      ) : (
        <p className="text-xs text-muted-foreground">
          El orden se asigna automáticamente al crear el atributo.
        </p>
      )}

      <form.Subscribe selector={(state) => state.values.tipoDatoId}>
        {(tipoDatoId) => {
          const tipoDato = tiposById.get(tipoDatoId)
          if (!tipoDato?.permiteOpciones) return null

          return (
            <form.Field name="opciones" mode="array">
              {(field) => (
                <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Opciones</p>
                      <p className="text-xs text-muted-foreground">
                        Requeridas para {tipoDato.codigo}.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        field.pushValue({ value: "", label: "" })
                      }
                    >
                      <Plus />
                      Agregar
                    </Button>
                  </div>

                  {field.state.value.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aún no hay opciones.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {field.state.value.map((_, index) => (
                        <li
                          key={index}
                          className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                        >
                          <form.Field name={`opciones[${index}].value`}>
                            {(optionField) => (
                              <Input
                                value={optionField.state.value}
                                onBlur={optionField.handleBlur}
                                onChange={(e) =>
                                  optionField.handleChange(e.target.value)
                                }
                                placeholder="Valor"
                                aria-label={`Valor de opción ${index + 1}`}
                              />
                            )}
                          </form.Field>
                          <form.Field name={`opciones[${index}].label`}>
                            {(optionField) => (
                              <Input
                                value={optionField.state.value}
                                onBlur={optionField.handleBlur}
                                onChange={(e) =>
                                  optionField.handleChange(e.target.value)
                                }
                                placeholder="Etiqueta"
                                aria-label={`Etiqueta de opción ${index + 1}`}
                              />
                            )}
                          </form.Field>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Eliminar opción ${index + 1}`}
                            onClick={() => field.removeValue(index)}
                          >
                            <Trash2 />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form.Field>
          )
        }}
      </form.Subscribe>
    </FormDialog>
  )
}
