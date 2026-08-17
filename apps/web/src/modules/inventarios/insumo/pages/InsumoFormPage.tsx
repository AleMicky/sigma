import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"

import { routes } from "@/app/config/routes"
import { categoriaInsumoQueries } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.queries"
import { insumoAtributoValorQueries } from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.queries"
import type { InsumoAtributoValor } from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.service"
import { tipoInsumoAtributoQueries } from "@/modules/inventarios/tipo-insumo-atributo/api/tipo-insumo-atributo.queries"
import { tipoInsumoQueries } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.queries"

import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { unidadMedidaQueries } from "@/modules/parametros/unidad-medida/api/unidad-medida.queries"
import { getErrorMessage, isApiError } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"

import { useCreateInsumo, useUpdateInsumo } from "../api/insumo.mutations"
import { insumoQueries } from "../api/insumo.queries"
import { InsumoFormAtributosSection } from "../components/form/InsumoFormAtributosSection"
import { InsumoFormFooter } from "../components/form/InsumoFormFooter"
import { InsumoFormHeader } from "../components/form/InsumoFormHeader"
import { InsumoFormMainSection } from "../components/form/InsumoFormMainSection"
import {
  syncInsumoAtributoValores,
  validateInsumoAtributos,
} from "../lib/insumo-form.utils"
import { defaultInsumoValues, insumoSchema } from "../schemas/insumo.schema"

type InsumoFormPageProps = {
  insumoId?: string
}

export function InsumoFormPage({ insumoId }: InsumoFormPageProps) {
  const isEditing = Boolean(insumoId)
  const navigate = useNavigate()
  const createMutation = useCreateInsumo()
  const updateMutation = useUpdateInsumo()

  const [formError, setFormError] = useState<string | null>(null)
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>({})
  const [valores, setValores] = useState<Record<string, string>>({})

  // Fetch Insumo detail if editing
  const insumoQuery = useQuery({
    ...insumoQueries.detail(insumoId ?? ""),
    enabled: Boolean(insumoId),
  })
  const insumo = insumoQuery.data

  // Fetch existing attribute values if editing
  const existingValoresQuery = useQuery({
    ...insumoAtributoValorQueries.list({
      insumoId: insumoId ?? "",
      page: 0,
      size: 100,
    }),
    enabled: Boolean(insumoId),
  })

  const existentesMap = useMemo(() => {
    const map = new Map<string, InsumoAtributoValor>()
    existingValoresQuery.data?.content?.forEach((v) => {
      map.set(v.tipoInsumoAtributoId, v)
    })
    return map
  }, [existingValoresQuery.data])

  // Populate initial values when existing values load
  useEffect(() => {
    if (existingValoresQuery.data?.content) {
      const initialValores: Record<string, string> = {}
      existingValoresQuery.data.content.forEach((v) => {
        initialValores[v.tipoInsumoAtributoId] = v.valor
      })
      setValores(initialValores)
    }
  }, [existingValoresQuery.data])

  // Fetch Catalogs
  const tiposQuery = useQuery(
    tipoInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const categoriasQuery = useQuery(
    categoriaInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const unidadesMedidaQuery = useQuery(
    unidadMedidaQueries.list({
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
  const categorias = categoriasQuery.data?.content ?? []
  const unidadesMedida = unidadesMedidaQuery.data?.content ?? []

  const tiposDatoById = useMemo(() => {
    const map = new Map<string, { nombre: string; codigo: string }>()
    tiposDatoQuery.data?.content?.forEach((td) => {
      map.set(td.id, { nombre: td.nombre, codigo: td.codigo })
    })
    return map
  }, [tiposDatoQuery.data])

  const form = useForm({
    defaultValues: insumo
      ? {
          codigo: insumo.codigo,
          nombre: insumo.nombre,
          descripcion: insumo.descripcion ?? "",
          categoriaInsumoId: insumo.categoriaInsumoId,
          unidadMedidaId: insumo.unidadMedidaId,
          marca: insumo.marca ?? "",
        }
      : defaultInsumoValues,
    validators: {
      onSubmit: insumoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      // Validate dynamic attributes
      const currentAtributos = atributosQuery.data?.content ?? []
      const errors = validateInsumoAtributos(currentAtributos, valores)
      setAtributoErrors(errors)

      if (Object.keys(errors).length > 0) {
        setFormError(
          "Por favor completa todos los atributos dinámicos obligatorios.",
        )
        return
      }

      try {
        let savedInsumo
        if (isEditing && insumoId) {
          savedInsumo = await updateMutation.mutateAsync({
            id: insumoId,
            payload: {
              codigo: value.codigo.trim(),
              nombre: value.nombre.trim(),
              descripcion: value.descripcion?.trim() || null,
              categoriaInsumoId: value.categoriaInsumoId,
              unidadMedidaId: value.unidadMedidaId,
              marca: value.marca?.trim() || null,
            },
          })
        } else {
          savedInsumo = await createMutation.mutateAsync({
            codigo: value.codigo.trim(),
            nombre: value.nombre.trim(),
            descripcion: value.descripcion?.trim() || null,
            categoriaInsumoId: value.categoriaInsumoId,
            unidadMedidaId: value.unidadMedidaId,
            marca: value.marca?.trim() || null,
          })
        }

        // Sync attribute values
        if (currentAtributos.length > 0) {
          await syncInsumoAtributoValores({
            insumoId: savedInsumo.id,
            atributos: currentAtributos,
            valores,
            existentes: existentesMap,
          })
        }

        void navigate({ to: routes.inventarios.root as any })
      } catch (error) {
        setFormError(
          isApiError(error) ? error.message : "Error al guardar el insumo.",
        )
      }
    },
  })

  // Track selected CategoriaInsumo to derive TipoInsumo and dynamically fetch attributes
  const selectedCategoriaInsumoId = useStore(
    form.store,
    (state) => state.values.categoriaInsumoId,
  )

  const selectedCategoria = useMemo(
    () => categorias.find((c) => c.id === selectedCategoriaInsumoId),
    [categorias, selectedCategoriaInsumoId],
  )

  const selectedTipoInsumoId =
    selectedCategoria?.tipoInsumo?.id ?? selectedCategoria?.tipoInsumoId ?? ""

  const atributosQuery = useQuery({
    ...tipoInsumoAtributoQueries.list({
      tipoInsumoId: selectedTipoInsumoId,
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
    enabled: Boolean(selectedTipoInsumoId),
  })

  const atributos = atributosQuery.data?.content ?? []

  function handleChangeValor(atributoId: string, val: string) {
    setValores((prev) => ({ ...prev, [atributoId]: val }))
    if (atributoErrors[atributoId]) {
      setAtributoErrors((prev) => {
        const next = { ...prev }
        delete next[atributoId]
        return next
      })
    }
  }

  if (isEditing && insumoQuery.isLoading) {
    return (
      <PageShell className="h-full min-h-0 max-w-4xl p-6">
        <ListSkeleton rows={4} rowClassName="h-16 rounded-xl" />
      </PageShell>
    )
  }

  if (isEditing && insumoQuery.isError) {
    return (
      <PageShell className="h-full min-h-0 max-w-4xl p-6">
        <EmptyState
          title={getErrorMessage(insumoQuery.error)}
          className="text-destructive"
        />
      </PageShell>
    )
  }

  return (
    <PageShell className="h-full min-h-0 max-w-5xl gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-10 md:py-0 flex flex-col">
      <InsumoFormHeader
        isEditing={isEditing}
        insumoName={insumo?.nombre}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6 flex flex-col gap-6 pr-1">
          {formError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* General Information Section */}
          <InsumoFormMainSection
            form={form}
            categorias={categorias}
            unidadesMedida={unidadesMedida}
          />

          {/* Dynamic Technical Attributes Section */}
          <InsumoFormAtributosSection
            atributos={atributos}
            tiposDatoById={tiposDatoById}
            valores={valores}
            onChangeValor={handleChangeValor}
            atributoErrors={atributoErrors}
            isLoading={atributosQuery.isLoading}
            hasTipoSelected={Boolean(selectedTipoInsumoId)}
          />
        </div>

        {/* Footer with actions */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <InsumoFormFooter
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              isEditing={isEditing}
            />
          )}
        </form.Subscribe>
      </form>
    </PageShell>
  )
}
