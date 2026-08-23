import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
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

function parseOpciones(
  opciones: string | null | undefined,
): Array<{ value: string; label: string }> {
  if (!opciones) return []
  try {
    const parsed = JSON.parse(opciones)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === "string") {
          return { value: item, label: item }
        }
        if (typeof item === "object" && item !== null) {
          return {
            value: String(item.value ?? item.val ?? item.label ?? ""),
            label: String(item.label ?? item.nombre ?? item.value ?? ""),
          }
        }
        return { value: String(item), label: String(item) }
      })
    }
  } catch {
    return opciones
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ value: s, label: s }))
  }
  return []
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
  const tiposById = useMemo(
    () => new Map(tiposDato.map((tipo) => [tipo.id, tipo])),
    [tiposDato],
  )

  const form = useForm({
    defaultValues: atributo
      ? {
          tipoDatoId: atributo.tipoDatoId,
          tipoInsumoId: atributo.tipoInsumoId,
          codigo: atributo.codigo,
          nombre: atributo.nombre,
          requerido: atributo.requerido ?? false,
          orden: atributo.orden ?? 0,
          opciones: parseOpciones(atributo.opciones),
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

      const tipoDato = tiposById.get(value.tipoDatoId)
      if (tipoDato?.permiteOpciones && value.opciones.length === 0) {
        setFormError("Agrega al menos una opción para este tipo de dato.")
        return
      }

      const validOpciones = value.opciones.filter(
        (op) => op.value.trim() || op.label.trim(),
      )

      if (tipoDato?.permiteOpciones && validOpciones.length === 0) {
        setFormError(
          "Agrega al menos una opción válida para este tipo de dato.",
        )
        return
      }

      const opcionesJson = tipoDato?.permiteOpciones
        ? JSON.stringify(
            validOpciones.map((opcion) => ({
              value: opcion.value.trim(),
              label: opcion.label.trim() || opcion.value.trim(),
            })),
          )
        : null

      const payload = {
        tipoDatoId: value.tipoDatoId,
        tipoInsumoId,
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        requerido: value.requerido,
        orden: value.orden,
        opciones: opcionesJson,
      }

      try {
        const saved =
          isEditing && atributo
            ? await updateMutation.mutateAsync({
                id: atributo.id,
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
                onValueChange={(val) => {
                  const nextId = val ?? ""
                  field.handleChange(nextId)
                  const nextTipo = tiposById.get(nextId)
                  if (!nextTipo?.permiteOpciones) {
                    form.setFieldValue("opciones", [])
                  } else if (form.state.values.opciones.length === 0) {
                    form.setFieldValue("opciones", [{ value: "", label: "" }])
                  }
                }}
              >
                <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                  <SelectValue placeholder="Selecciona un tipo de dato…">
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
                      <Plus className="size-4" />
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
                            <Trash2 className="size-4" />
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
