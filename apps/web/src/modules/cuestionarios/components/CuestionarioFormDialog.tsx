import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, EyeOff, RefreshCw, ShieldCheck } from "lucide-react"

import { getErrorMessage, isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import {
  useCreateCuestionario,
  useUpdateCuestionario,
} from "../api/cuestionario.mutations"
import { cuestionarioQueries } from "../api/cuestionario.queries"
import type {
  Cuestionario,
  CuestionarioDetalle,
} from "../api/cuestionario.types"
import {
  buildDisparadorKey,
  formatDisparadorOptionLabel,
  formatEvaluadoTipoLabel,
  parseDisparadorKey,
} from "../lib/cuestionario.utils"
import {
  cuestionarioFormSchema,
  type CuestionarioFormValues,
} from "../schemas/cuestionario.schema"

export type CuestionarioFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cuestionario?: Cuestionario | null
  onSaved?: (saved: CuestionarioDetalle) => void
}

function CuestionarioFormContent({
  cuestionario,
  onOpenChange,
  onSaved,
}: {
  cuestionario?: Cuestionario | null
  onOpenChange: (open: boolean) => void
  onSaved?: (saved: CuestionarioDetalle) => void
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const isEditing = Boolean(cuestionario)

  const createMutation = useCreateCuestionario()
  const updateMutation = useUpdateCuestionario()

  const disparadoresQuery = useQuery(cuestionarioQueries.disparadores())

  const disparadorOptions = useMemo<OptionsComboboxOption[]>(() => {
    const list = disparadoresQuery.data ?? []
    return list.map((d) => ({
      value: buildDisparadorKey(d),
      label: formatDisparadorOptionLabel(d),
      keywords: [
        d.moduloOrigen,
        d.moduloEtiqueta,
        d.entidadTipo,
        d.entidadEtiqueta,
        d.eventoDisparador,
        d.eventoEtiqueta,
        d.evaluadoTipoDefecto ?? "",
        formatEvaluadoTipoLabel(d.evaluadoTipoDefecto),
      ].filter(Boolean),
    }))
  }, [disparadoresQuery.data])

  const defaultValues: CuestionarioFormValues = {
    codigo: cuestionario?.codigo ?? "",
    nombre: cuestionario?.nombre ?? "",
    descripcion: cuestionario?.descripcion ?? "",
    moduloOrigen: cuestionario?.moduloOrigen ?? "",
    entidadTipo: cuestionario?.entidadTipo ?? "",
    eventoDisparador: cuestionario?.eventoDisparador ?? "",
    obligatorio: cuestionario?.obligatorio ?? false,
    anonimoEnReportes: cuestionario?.anonimoEnReportes ?? false,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: cuestionarioFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)
      const payload = {
        codigo: value.codigo.trim().toUpperCase(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        moduloOrigen: value.moduloOrigen.trim(),
        entidadTipo: value.entidadTipo.trim(),
        eventoDisparador: value.eventoDisparador.trim(),
        obligatorio: value.obligatorio,
        anonimoEnReportes: value.anonimoEnReportes,
      }

      try {
        const saved = cuestionario
          ? await updateMutation.mutateAsync({ id: cuestionario.id, payload })
          : await createMutation.mutateAsync(payload)
        onSaved?.(saved)
        onOpenChange(false)
      } catch (err: unknown) {
        if (isApiError(err) && err.validationErrors.length > 0) {
          const details = err.validationErrors
            .map((item) => `${item.field}: ${item.messages.join(", ")}`)
            .join(" · ")
          setFormError(`${err.message} (${details})`)
        } else {
          setFormError(getErrorMessage(err))
        }
      }
    },
  })

  return (
    <FormDialog
      open={true}
      onOpenChange={onOpenChange}
      size="md"
      title={isEditing ? "Editar cuestionario" : "Nuevo cuestionario"}
      description={
        isEditing
          ? "Actualiza la configuración general y el disparador del cuestionario."
          : "Configura los datos base y el evento que habilitará esta evaluación."
      }
      formError={formError}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              allowInvalidSubmit
              label={isEditing ? "Guardar cambios" : "Crear cuestionario"}
              submittingLabel={isEditing ? "Guardando…" : "Creando…"}
            />
          )}
        </form.Subscribe>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="codigo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const disabledCode =
              isEditing && cuestionario?.estado !== "BORRADOR"
            return (
              <Field data-invalid={isInvalid}>
                <RequiredFieldLabel htmlFor="cuestionario-codigo">
                  Código
                </RequiredFieldLabel>
                <Input
                  id="cuestionario-codigo"
                  name={field.name}
                  value={field.state.value}
                  disabled={disabledCode}
                  placeholder="EVAL-COND-01"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value.toUpperCase())
                  }
                  className="h-10 rounded-xl font-mono uppercase"
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="nombre">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid} className="sm:col-span-2">
                <RequiredFieldLabel htmlFor="cuestionario-nombre">
                  Nombre del cuestionario
                </RequiredFieldLabel>
                <Input
                  id="cuestionario-nombre"
                  name={field.name}
                  value={field.state.value}
                  placeholder="Evaluación de servicio del conductor"
                  aria-invalid={isInvalid}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="h-10 rounded-xl"
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <form.Field name="eventoDisparador">
        {(eventoField) => (
          <form.Subscribe
            selector={(state) => ({
              moduloOrigen: state.values.moduloOrigen,
              entidadTipo: state.values.entidadTipo,
              eventoDisparador: state.values.eventoDisparador,
            })}
          >
            {({ moduloOrigen, entidadTipo, eventoDisparador }) => {
              const selectedKey = buildDisparadorKey({
                moduloOrigen,
                entidadTipo,
                eventoDisparador,
              })
              const isInvalid =
                eventoField.state.meta.isTouched &&
                !eventoField.state.meta.isValid

              return (
                <Field data-invalid={isInvalid}>
                  <RequiredFieldLabel htmlFor="cuestionario-disparador">
                    Disparador del proceso
                  </RequiredFieldLabel>

                  {disparadoresQuery.isError ? (
                    <div
                      role="alert"
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="size-4 shrink-0" />
                        {getErrorMessage(disparadoresQuery.error)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => void disparadoresQuery.refetch()}
                      >
                        <RefreshCw className="size-3" />
                        Reintentar
                      </Button>
                    </div>
                  ) : (
                    <OptionsCombobox
                      id="cuestionario-disparador"
                      options={disparadorOptions}
                      value={selectedKey}
                      disabled={
                        disparadoresQuery.isLoading ||
                        (isEditing && cuestionario?.estado !== "BORRADOR")
                      }
                      ariaLabel="Disparador del proceso"
                      aria-invalid={isInvalid}
                      placeholder={
                        disparadoresQuery.isLoading
                          ? "Cargando disparadores…"
                          : "Selecciona el módulo y evento…"
                      }
                      emptyMessage="No hay disparadores disponibles"
                      onBlur={eventoField.handleBlur}
                      onValueChange={(nextKey) => {
                        const parsed = parseDisparadorKey(nextKey)
                        if (parsed) {
                          form.setFieldValue(
                            "moduloOrigen",
                            parsed.moduloOrigen,
                          )
                          form.setFieldValue("entidadTipo", parsed.entidadTipo)
                          form.setFieldValue(
                            "eventoDisparador",
                            parsed.eventoDisparador,
                          )
                        } else {
                          form.setFieldValue("moduloOrigen", "")
                          form.setFieldValue("entidadTipo", "")
                          form.setFieldValue("eventoDisparador", "")
                        }
                      }}
                    />
                  )}
                  {isInvalid ? (
                    <FieldError errors={eventoField.state.meta.errors} />
                  ) : null}
                </Field>
              )
            }}
          </form.Subscribe>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="cuestionario-descripcion">
                Descripción (Opcional)
              </FieldLabel>
              <Textarea
                id="cuestionario-descripcion"
                name={field.name}
                rows={3}
                value={field.state.value}
                placeholder="Propósito e instrucciones generales para quien responde…"
                aria-invalid={isInvalid}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="rounded-xl"
              />
              {isInvalid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )
        }}
      </form.Field>

      <div className="flex flex-col gap-2.5">
        <form.Field name="obligatorio">
          {(field) => (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <label
                    htmlFor="cuestionario-obligatorio"
                    className="cursor-pointer text-xs font-semibold text-foreground"
                  >
                    Evaluación obligatoria
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Destaca el cuestionario como requerido al concluir el evento
                  </span>
                </div>
              </div>
              <button
                id="cuestionario-obligatorio"
                type="button"
                role="switch"
                aria-checked={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  field.state.value ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-sm transition-transform",
                    field.state.value ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          )}
        </form.Field>

        <form.Field name="anonimoEnReportes">
          {(field) => (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                  <EyeOff className="size-4" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <label
                    htmlFor="cuestionario-anonimo"
                    className="cursor-pointer text-xs font-semibold text-foreground"
                  >
                    Anónimo en reportes
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Oculta el nombre del evaluador en reportes y tableros de
                    resultados
                  </span>
                </div>
              </div>
              <button
                id="cuestionario-anonimo"
                type="button"
                role="switch"
                aria-checked={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  field.state.value ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-sm transition-transform",
                    field.state.value ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          )}
        </form.Field>
      </div>
    </FormDialog>
  )
}

export function CuestionarioFormDialog({
  open,
  onOpenChange,
  cuestionario,
  onSaved,
}: Readonly<CuestionarioFormDialogProps>) {
  if (!open) return null

  return (
    <CuestionarioFormContent
      key={cuestionario?.id ?? "new"}
      cuestionario={cuestionario}
      onOpenChange={onOpenChange}
      onSaved={onSaved}
    />
  )
}
