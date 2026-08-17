import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Box } from "lucide-react"

import { routes } from "@/app/config/routes"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import { activoAtributoValorKeys } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.keys"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import type { ActivoAtributoValor } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage, isApiError } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

import { activoKeys } from "../api/activo.keys"
import { useCreateActivo, useUpdateActivo } from "../api/activo.mutations"
import { activoQueries } from "../api/activo.queries"
import {
  deleteActivoImagen,
  uploadActivoImagen,
  type Activo,
} from "../api/activo.service"
import { ActivoFormAtributosSection } from "../components/form/ActivoFormAtributosSection"
import { ActivoFormFooter } from "../components/form/ActivoFormFooter"
import { ActivoFormHeader } from "../components/form/ActivoFormHeader"
import { ActivoFormImageSection } from "../components/form/ActivoFormImageSection"
import { ActivoFormMainSection } from "../components/form/ActivoFormMainSection"
import { syncAtributoValores, validateAtributos } from "../lib/activo-form.utils"
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

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
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
  const ubicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )
  const ubicacionesById = useMemo(
    () => new Map(ubicaciones.map((ubicacion) => [ubicacion.id, ubicacion])),
    [ubicaciones],
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
        ubicacionId: value.ubicacionId?.trim() || null,
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

  const tipoActivoId = useStore(
    form.store,
    (state) => state.values.tipoActivoId,
  )

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
    form.setFieldValue("tipoActivoId", activo.tipoActivo?.id ?? activo.tipoActivoId ?? "")
    form.setFieldValue("ubicacionId", activo.ubicacion?.id ?? activo.ubicacionId ?? "")
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
  const SelectedIcon = selectedTipo
    ? getTipoActivoIcon(selectedTipo.icono)
    : Box
  const selectedColor = selectedTipo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  if (isEditing && activoQuery.isLoading) {
    return (
      <PageShell className="max-w-4xl">
        <ListSkeleton rows={8} rowClassName="h-12 rounded-xl" />
      </PageShell>
    )
  }

  if (isEditing && activoQuery.isError) {
    return (
      <PageShell className="max-w-4xl">
        <EmptyState
          title={getErrorMessage(activoQuery.error)}
          className="text-destructive my-auto"
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
    <PageShell className="max-w-7xl w-full mx-auto gap-0 px-4 py-0 sm:px-6 md:px-8 md:py-0 flex flex-col min-h-0">
      <ActivoFormHeader isEditing={isEditing} codigo={activo?.codigo} />

      <form
        className="flex min-h-0 flex-1 flex-col gap-5 py-4 overflow-y-auto overflow-x-hidden pr-1"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        {formError ? (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-xs">
            <AlertCircle className="size-5 shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Side Media Panel */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-5 lg:sticky lg:top-0">
            <ActivoFormImageSection
              currentUrl={activo?.urlImagen}
              pendingFile={pendingFile}
              onFileChange={setPendingFile}
              removeExistingImage={removeExistingImage}
              onRemoveExistingChange={setRemoveExistingImage}
            />
          </div>

          {/* Main Info & Dynamic Attributes */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-5">
            <ActivoFormMainSection
              form={form}
              tipos={tipos}
              tiposById={tiposById}
              selectedTipo={selectedTipo}
              selectedColor={selectedColor}
              SelectedIcon={SelectedIcon}
              tiposQueryLoading={tiposQuery.isLoading}
              ubicaciones={ubicaciones}
              ubicacionesById={ubicacionesById}
              ubicacionesLoading={ubicacionesQuery.isLoading}
            />

            <ActivoFormAtributosSection
              tipoActivoId={tipoActivoId}
              selectedTipo={selectedTipo}
              atributosVisibles={atributosVisibles}
              tiposDatoById={tiposDatoById}
              valores={valores}
              atributoErrors={atributoErrors}
              isLoading={atributosQuery.isLoading}
              isError={atributosQuery.isError}
              error={atributosQuery.error}
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
          </div>
        </div>

        <ActivoFormFooter form={form} />
      </form>
    </PageShell>
  )
}
