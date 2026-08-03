import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { routes } from "@/app/config/routes"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import { activoAtributoValorKeys } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.keys"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import {
  createActivoAtributoValor,
  updateActivoAtributoValor,
  type ActivoAtributoValor,
} from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { getErrorMessage, isApiError } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import {
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { ImageUploadField } from "@/shared/components/image-upload-field"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import { activoKeys } from "../api/activo.keys"
import { useCreateActivo, useUpdateActivo } from "../api/activo.mutations"
import { activoQueries } from "../api/activo.queries"
import {
  deleteActivoImagen,
  uploadActivoImagen,
  type Activo,
} from "../api/activo.service"
import { ActivoAtributoValorFields } from "../components/ActivoAtributoValorFields"
import { activoSchema, defaultActivoValues } from "../schemas/activo.schema"

type ActivoFormPageProps = {
  activoId?: string
  defaultTipoActivoId?: string
}

export function ActivoFormPage({
  activoId,
  defaultTipoActivoId,
}: ActivoFormPageProps) {
  const isEditing = Boolean(activoId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createMutation = useCreateActivo()
  const updateMutation = useUpdateActivo()

  const [formError, setFormError] = useState<string | null>(null)
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>(
    {},
  )
  const [valores, setValores] = useState<Record<string, string>>({})
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const lastTipoIdRef = useRef<string | null>(null)
  const syncRef = useRef({
    atributos: [] as ActivoAtributo[],
    valores: {} as Record<string, string>,
    existentes: new Map<string, ActivoAtributoValor>(),
    activo: null as Activo | undefined | null,
    pendingFile: null as File | null,
    removeExistingImage: false,
  })

  const activoQuery = useQuery({
    ...activoQueries.detail(activoId ?? ""),
    enabled: Boolean(activoId),
  })

  const activo = activoQuery.data

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tipos = tiposQuery.data?.content ?? []
  const tiposById = useMemo(
    () => new Map(tipos.map((tipo) => [tipo.id, tipo])),
    [tipos],
  )
  const tiposDatoById = useMemo(
    () =>
      new Map(
        (tiposDatoQuery.data?.content ?? []).map((tipo) => [tipo.id, tipo]),
      ),
    [tiposDatoQuery.data?.content],
  )

  const form = useForm({
    defaultValues: {
      ...defaultActivoValues,
      tipoActivoId: defaultTipoActivoId ?? "",
    },
    validators: {
      onSubmit: activoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const {
        atributos,
        valores: currentValores,
        existentes,
        activo: currentActivo,
        pendingFile: file,
        removeExistingImage: shouldRemoveImage,
      } = syncRef.current

      const nextAtributoErrors = validateAtributos(atributos, currentValores)
      setAtributoErrors(nextAtributoErrors)
      if (Object.keys(nextAtributoErrors).length > 0) {
        setFormError("Completa los atributos obligatorios del tipo de activo.")
        return
      }

      const payload = {
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        tipoActivoId: value.tipoActivoId,
        ubicacion: value.ubicacion.trim() || null,
        fechaAdquisicion: value.fechaAdquisicion || null,
      }

      try {
        let saved: Activo

        if (isEditing && activoId) {
          saved = await updateMutation.mutateAsync({
            id: activoId,
            payload,
          })
        } else {
          saved = await createMutation.mutateAsync(payload)
        }

        if (file) {
          await uploadActivoImagen(saved.id, file)
        } else if (shouldRemoveImage && currentActivo?.urlImagen) {
          await deleteActivoImagen(saved.id)
        }

        await syncAtributoValores({
          activoId: saved.id,
          atributos,
          valores: currentValores,
          existentes,
        })

        void queryClient.invalidateQueries({ queryKey: activoKeys.lists() })
        void queryClient.invalidateQueries({
          queryKey: activoKeys.detail(saved.id),
        })
        void queryClient.invalidateQueries({
          queryKey: activoAtributoValorKeys.lists(),
        })

        await navigate({ to: "/activos" })
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : getErrorMessage(error) || "No se pudo guardar el activo.",
        )
      }
    },
  })

  const tipoActivoId = useStore(form.store, (state) => state.values.tipoActivoId)

  const atributosQuery = useQuery(
    activoAtributoQueries.byTipoActivo(tipoActivoId, {
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

  const valoresQuery = useQuery({
    ...activoAtributoValorQueries.byActivo(activoId ?? ""),
    enabled: Boolean(activoId),
  })

  const atributosVisibles = useMemo(() => {
    const items = atributosQuery.data?.content ?? []
    return items
      .filter((atributo) => atributo.visible !== false)
      .slice()
      .sort((a, b) => a.orden - b.orden)
  }, [atributosQuery.data?.content])

  const valoresExistentesByAtributoId = useMemo(() => {
    const map = new Map<string, ActivoAtributoValor>()
    for (const item of valoresQuery.data?.content ?? []) {
      map.set(item.activoAtributoId, item)
    }
    return map
  }, [valoresQuery.data?.content])

  syncRef.current = {
    atributos: atributosVisibles,
    valores,
    existentes: valoresExistentesByAtributoId,
    activo,
    pendingFile,
    removeExistingImage,
  }

  useEffect(() => {
    if (!isEditing || !activo) return

    form.setFieldValue("codigo", activo.codigo)
    form.setFieldValue("nombre", activo.nombre)
    form.setFieldValue("descripcion", activo.descripcion ?? "")
    form.setFieldValue("tipoActivoId", activo.tipoActivoId)
    form.setFieldValue("ubicacion", activo.ubicacion ?? "")
    form.setFieldValue("fechaAdquisicion", activo.fechaAdquisicion ?? "")
  }, [activo, form, isEditing])

  useEffect(() => {
    if (!tipoActivoId) {
      setValores({})
      lastTipoIdRef.current = null
      return
    }

    if (atributosQuery.isLoading) return
    if (isEditing && valoresQuery.isLoading) return

    const tipoChanged = lastTipoIdRef.current !== tipoActivoId
    lastTipoIdRef.current = tipoActivoId

    setValores((prev) => {
      const next: Record<string, string> = {}

      for (const atributo of atributosVisibles) {
        const existente = valoresExistentesByAtributoId.get(atributo.id)
        if (existente?.valor != null) {
          next[atributo.id] = existente.valor
        } else if (!tipoChanged && prev[atributo.id] !== undefined) {
          next[atributo.id] = prev[atributo.id]
        } else {
          next[atributo.id] = atributo.valorDefecto ?? ""
        }
      }

      return next
    })
    setAtributoErrors({})
  }, [
    atributosQuery.isLoading,
    atributosVisibles,
    isEditing,
    tipoActivoId,
    valoresExistentesByAtributoId,
    valoresQuery.isLoading,
  ])

  const selectedTipo = tiposById.get(tipoActivoId)

  if (isEditing && activoQuery.isLoading) {
    return (
      <PageShell className="max-w-5xl">
        <ListSkeleton rows={8} rowClassName="h-12 rounded-xl" />
      </PageShell>
    )
  }

  if (isEditing && activoQuery.isError) {
    return (
      <PageShell className="max-w-5xl">
        <EmptyState
          title={getErrorMessage(activoQuery.error)}
          className="text-destructive"
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              render={<Link to={routes.activos.root} />}
            >
              Volver al listado
            </Button>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell className="max-w-5xl gap-0 px-4 py-0 sm:px-6 md:px-10 md:py-0">
      <header className="flex shrink-0 items-start gap-3 border-b py-4 sm:py-6 md:py-8">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link to={routes.activos.root} />}
          aria-label="Volver a activos"
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {isEditing ? "Editar activo" : "Crear activo"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditing
              ? "Actualiza los datos del activo y sus atributos."
              : "Completa el formulario para registrar un nuevo activo."}{" "}
            Los campos con <span className="text-destructive">*</span> son
            obligatorios.
          </p>
        </div>
      </header>

      <form
        className="flex flex-col gap-8 py-6 pb-10"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup>
          <ImageUploadField
            currentUrl={activo?.urlImagen}
            file={pendingFile}
            onFileChange={setPendingFile}
            removeExisting={removeExistingImage}
            onRemoveExistingChange={setRemoveExistingImage}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="tipoActivoId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                const selected = tiposById.get(field.state.value)

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <RequiredFieldLabel htmlFor={field.name}>
                      Tipo de activo
                    </RequiredFieldLabel>
                    <Select
                      value={field.state.value || null}
                      onValueChange={(value) =>
                        field.handleChange(value ?? "")
                      }
                      disabled={tiposQuery.isLoading}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={isInvalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecciona un tipo">
                          {selected?.nombre ?? null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {tipos.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                      placeholder="VEH-001"
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
                      placeholder="Toyota Hilux"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="ubicacion">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>Ubicación</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Sede central"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="fechaAdquisicion">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha de adquisición
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="descripcion">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field
                    data-invalid={isInvalid || undefined}
                    className="md:col-span-2"
                  >
                    <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Camioneta de operaciones"
                      rows={3}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
          </div>
        </FieldGroup>

        <section className="flex flex-col gap-4 border-t pt-6">
          <div>
            <h2 className="text-base font-medium">
              Atributos
              {selectedTipo ? ` · ${selectedTipo.nombre}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tipoActivoId
                ? "Completa los atributos del tipo seleccionado."
                : "Selecciona un tipo de activo para ver sus atributos."}
            </p>
          </div>

          {!tipoActivoId ? null : atributosQuery.isLoading ? (
            <ListSkeleton rows={3} rowClassName="h-14 rounded-xl" />
          ) : atributosQuery.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {getErrorMessage(atributosQuery.error)}
            </p>
          ) : (
            <ActivoAtributoValorFields
              atributos={atributosVisibles}
              tiposDatoById={tiposDatoById}
              valores={valores}
              errors={atributoErrors}
              onChange={(atributoId, value) => {
                setValores((prev) => ({ ...prev, [atributoId]: value }))
                setAtributoErrors((prev) => {
                  if (!prev[atributoId]) return prev
                  const next = { ...prev }
                  delete next[atributoId]
                  return next
                })
              }}
            />
          )}
        </section>

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            render={<Link to={routes.activos.root} />}
          >
            Cancelar
          </Button>
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
        </div>
      </form>
    </PageShell>
  )
}

function validateAtributos(
  atributos: ActivoAtributo[],
  valores: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const atributo of atributos) {
    if (!atributo.requerido) continue
    const value = valores[atributo.id]?.trim() ?? ""
    if (!value || value === "[]") {
      errors[atributo.id] = `El atributo "${atributo.etiqueta}" es obligatorio`
    }
  }

  return errors
}

async function syncAtributoValores({
  activoId,
  atributos,
  valores,
  existentes,
}: {
  activoId: string
  atributos: ActivoAtributo[]
  valores: Record<string, string>
  existentes: Map<string, ActivoAtributoValor>
}) {
  await Promise.all(
    atributos.map(async (atributo) => {
      const raw = valores[atributo.id]?.trim() ?? ""
      const valor = raw.length > 0 ? raw : null
      const existing = existentes.get(atributo.id)

      if (existing) {
        if ((existing.valor ?? null) === valor) return
        await updateActivoAtributoValor(existing.id, {
          activoId,
          activoAtributoId: atributo.id,
          valor,
        })
        return
      }

      if (valor == null) return

      await createActivoAtributoValor({
        activoId,
        activoAtributoId: atributo.id,
        valor,
      })
    }),
  )
}
