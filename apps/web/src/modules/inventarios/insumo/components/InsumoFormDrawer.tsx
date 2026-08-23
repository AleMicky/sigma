import { useEffect, useMemo, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  FolderTree,
  Loader2,
  Package,
  Save,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"

import { categoriaInsumoQueries } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.queries"
import { CategoriaInsumoCombobox } from "@/modules/inventarios/categoria-insumo/components/CategoriaInsumoCombobox"
import { insumoAtributoValorQueries } from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.queries"
import type { InsumoAtributoValor } from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.service"
import { tipoInsumoAtributoQueries } from "@/modules/inventarios/tipo-insumo-atributo/api/tipo-insumo-atributo.queries"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { UnidadMedidaCombobox } from "@/modules/parametros/unidad-medida/components/UnidadMedidaCombobox"
import { isApiError } from "@/shared/api"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { Textarea } from "@/shared/components/ui/textarea"

import { useCreateInsumo, useUpdateInsumo } from "../api/insumo.mutations"
import { insumoQueries } from "../api/insumo.queries"
import type { Insumo } from "../api/insumo.service"
import {
  syncInsumoAtributoValores,
  validateInsumoAtributos,
} from "../lib/insumo-form.utils"
import { defaultInsumoValues, insumoSchema } from "../schemas/insumo.schema"

type InsumoFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  insumoId?: string | null
  defaultCategoriaId?: string
  onSuccess?: (insumo: Insumo) => void
}

export function InsumoFormDrawer({
  open,
  onOpenChange,
  insumoId,
  defaultCategoriaId,
  onSuccess,
}: InsumoFormDrawerProps) {
  const isEditing = Boolean(insumoId)
  const createMutation = useCreateInsumo()
  const updateMutation = useUpdateInsumo()

  const [formError, setFormError] = useState<string | null>(null)
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>({})
  const [valores, setValores] = useState<Record<string, string>>({})

  // Consultar detalle de Insumo si se está editando
  const insumoQuery = useQuery({
    ...insumoQueries.detail(insumoId ?? ""),
    enabled: Boolean(insumoId && open),
  })
  const insumo = insumoQuery.data

  // Consultar valores de atributos existentes si se está editando
  const existingValoresQuery = useQuery({
    ...insumoAtributoValorQueries.list({
      insumoId: insumoId ?? "",
      page: 0,
      size: 100,
    }),
    enabled: Boolean(insumoId && open),
  })

  const existentesMap = useMemo(() => {
    const map = new Map<string, InsumoAtributoValor>()
    existingValoresQuery.data?.content?.forEach((v) => {
      map.set(v.tipoInsumoAtributoId, v)
    })
    return map
  }, [existingValoresQuery.data])

  useEffect(() => {
    if (existingValoresQuery.data?.content) {
      const initialValores: Record<string, string> = {}
      existingValoresQuery.data.content.forEach((v) => {
        initialValores[v.tipoInsumoAtributoId] = v.valor
      })
      setValores(initialValores)
    } else if (!insumoId) {
      setValores({})
    }
  }, [existingValoresQuery.data, insumoId, open])

  // Consultar Categorías para obtener el tipo de insumo asociado
  const categoriasQuery = useQuery(
    categoriaInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const categorias = categoriasQuery.data?.content ?? []

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const tiposDatoById = useMemo(() => {
    const map = new Map<string, { id: string; codigo: string; nombre: string }>()
    tiposDatoQuery.data?.content?.forEach((td) => {
      map.set(td.id, td)
    })
    return map
  }, [tiposDatoQuery.data])

  const form = useForm({
    defaultValues: insumo
      ? {
          codigo: insumo.codigo,
          nombre: insumo.nombre,
          descripcion: insumo.descripcion ?? "",
          categoriaInsumoId:
            insumo.categoriaInsumo?.id ?? insumo.categoriaInsumoId ?? "",
          unidadMedidaId:
            insumo.unidadMedida?.id ?? insumo.unidadMedidaId ?? "",
          marca: insumo.marca ?? "",
        }
      : {
          ...defaultInsumoValues,
          categoriaInsumoId: defaultCategoriaId ?? "",
        },
    validators: {
      onSubmit: insumoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      // Validar atributos dinámicos obligatorios
      const attrErrors = validateInsumoAtributos(atributos, valores)
      if (Object.keys(attrErrors).length > 0) {
        setAtributoErrors(attrErrors)
        toast.error("Por favor completa los atributos requeridos.")
        return
      }
      setAtributoErrors({})

      try {
        const payload = {
          codigo: value.codigo.trim(),
          nombre: value.nombre.trim(),
          descripcion: value.descripcion?.trim() || null,
          categoriaInsumoId: value.categoriaInsumoId,
          unidadMedidaId: value.unidadMedidaId,
          marca: value.marca?.trim() || null,
        }

        let saved: Insumo
        if (isEditing && insumoId) {
          saved = await updateMutation.mutateAsync({
            id: insumoId,
            payload,
          })
        } else {
          saved = await createMutation.mutateAsync(payload)
        }

        // Sincronizar atributos dinámicos
        if (atributos.length > 0) {
          await syncInsumoAtributoValores({
            insumoId: saved.id,
            atributos,
            valores,
            existentes: existentesMap,
          })
        }

        toast.success(
          isEditing ? "Insumo actualizado con éxito" : "Insumo creado con éxito",
        )
        onSuccess?.(saved)
        onOpenChange(false)
      } catch (error) {
        setFormError(
          isApiError(error) ? error.message : "Error al guardar el insumo.",
        )
      }
    },
  })

  // Obtener tipo de insumo según la categoría seleccionada
  const selectedCategoriaId = useStore(
    form.store,
    (s: { values: { categoriaInsumoId: string } }) => s.values.categoriaInsumoId,
  )
  const selectedCategoria = categorias.find((c) => c.id === selectedCategoriaId)
  const tipoInsumoId =
    selectedCategoria?.tipoInsumo?.id ?? selectedCategoria?.tipoInsumoId ?? ""

  // Consultar atributos dinámicos según el tipo de insumo
  const atributosTipoQuery = useQuery({
    ...tipoInsumoAtributoQueries.list({
      tipoInsumoId,
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
    enabled: Boolean(tipoInsumoId),
  })
  const atributos = atributosTipoQuery.data?.content ?? []

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full data-[side=right]:sm:max-w-2xl data-[side=right]:md:max-w-3xl data-[side=right]:lg:max-w-4xl flex flex-col p-0 gap-0"
      >
        {/* Cabecera del Drawer */}
        <SheetHeader className="p-5 sm:p-6 border-b border-border/70 shrink-0 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Package className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-bold tracking-tight text-foreground">
                {isEditing ? "Editar Insumo" : "Nuevo Insumo"}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? "Actualiza la información general y especificaciones técnicas del insumo."
                  : "Registra un insumo con su clasificación y atributos dinámicos correspondientes."}
              </SheetDescription>
            </div>
          </div>

          {formError ? (
            <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {formError}
            </div>
          ) : null}
        </SheetHeader>

        {/* Cuerpo del formulario scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Clasificación Principal con Autocompletes */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <FolderTree className="size-4 text-primary" />
              <span>Clasificación y Unidad de Medida</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Autocomplete Categoría */}
              <form.Field name="categoriaInsumoId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Categoría
                      </RequiredFieldLabel>
                      <CategoriaInsumoCombobox
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Autocomplete Unidad de Medida */}
              <form.Field name="unidadMedidaId">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <RequiredFieldLabel htmlFor={field.name}>
                        Unidad de Medida
                      </RequiredFieldLabel>
                      <UnidadMedidaCombobox
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                        onBlur={field.handleBlur}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </div>
          </div>

          {/* Datos Generales del Insumo */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Código */}
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
                        aria-invalid={isInvalid}
                        required
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              {/* Marca */}
              <form.Field name="marca">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={field.name}>Marca / Fabricante</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>
            </div>

            {/* Nombre */}
            <form.Field name="nombre">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <RequiredFieldLabel htmlFor={field.name}>
                      Nombre del Insumo
                    </RequiredFieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            {/* Descripción */}
            <form.Field name="descripcion">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid || undefined}>
                    <FieldLabel htmlFor={field.name}>Descripción detallada</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={3}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          {/* Sección de Atributos Dinámicos */}
          {selectedCategoriaId && atributos.length > 0 ? (
            <div className="rounded-xl border border-border/80 bg-muted/10 p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <span>Especificaciones Técnicas Dinámicas</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {atributos.length} atributos
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {atributos.map((attr) => {
                  const error = atributoErrors[attr.id]
                  const tipoDatoInfo = tiposDatoById.get(attr.tipoDatoId)
                  const tipoDatoCodigo = tipoDatoInfo?.codigo?.toUpperCase() ?? ""

                  return (
                    <Field key={attr.id} data-invalid={Boolean(error) || undefined}>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel htmlFor={`attr-${attr.id}`} className="text-xs">
                          {attr.nombre}
                          {attr.requerido && (
                            <span className="text-destructive ml-0.5">*</span>
                          )}
                        </FieldLabel>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {tipoDatoInfo?.nombre ?? ""}
                        </span>
                      </div>

                      {tipoDatoCodigo === "TEXTO_LARGO" ? (
                        <Textarea
                          id={`attr-${attr.id}`}
                          value={valores[attr.id] ?? ""}
                          onChange={(e) =>
                            setValores((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          aria-invalid={Boolean(error)}
                        />
                      ) : (
                        <Input
                          id={`attr-${attr.id}`}
                          type={
                            tipoDatoCodigo === "NUMERO" ||
                            tipoDatoCodigo === "DECIMAL" ||
                            tipoDatoCodigo === "ENTERO"
                              ? "number"
                              : tipoDatoCodigo === "FECHA"
                              ? "date"
                              : "text"
                          }
                          value={valores[attr.id] ?? ""}
                          onChange={(e) =>
                            setValores((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                          aria-invalid={Boolean(error)}
                        />
                      )}

                      {error && <FieldError errors={[{ message: error }]} />}
                    </Field>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer con acciones */}
        <SheetFooter className="p-4 sm:p-5 border-t border-border/70 shrink-0 bg-muted/10 flex flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="px-4"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => form.handleSubmit()}
            disabled={isSaving}
            className="gap-1.5 shadow-2xs px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>{isEditing ? "Guardar Cambios" : "Crear Insumo"}</span>
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
