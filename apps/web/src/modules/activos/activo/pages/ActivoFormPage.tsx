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
import {
  replaceActivoAtributos,
  type ActivoAtributoValor,
} from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"
import { estadoOperativoQueries } from "@/modules/activos/estado-operativo/api/estado-operativo.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { tipoActivoEstadoQueries } from "@/modules/activos/tipo-activo-estado/api/tipo-activo-estado.queries"
import { useCanManageActivos } from "@/modules/activos/lib/use-can-manage-activos"
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
import { ActivoLivePreviewCard } from "../components/form/ActivoLivePreviewCard"
import {
  buildActivoPayload,
  buildReplaceAtributosPayload,
  mapAtributoValidationErrors,
  resolveActivoSaveTarget,
  validateAtributos,
} from "../lib/activo-form.utils"
import {
  includeCurrentEstadoOption,
  resolveEstadoPredeterminadoId,
  resolveEstadosDelTipo,
} from "../lib/estado-operativo.utils"
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
  const canManage = useCanManageActivos()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createMutation = useCreateActivo()
  const updateMutation = useUpdateActivo()

  const [formError, setFormError] = useState<string | null>(null)
  const [atributoErrors, setAtributoErrors] = useState<Record<string, string>>(
    {},
  )
  const [userValores, setUserValores] = useState<Record<string, string>>({})
  const [prevTipoActivoId, setPrevTipoActivoId] = useState(
    defaultTipoActivoId ?? "",
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const syncRef = useRef({
    atributos: [] as ActivoAtributo[],
    valores: {} as Record<string, string>,
    existentes: new Map<string, ActivoAtributoValor>(),
    activo: null as Activo | undefined | null,
    pendingFile: null as File | null,
    removeExistingImage: false,
  })
  // Selección explícita del usuario; se descarta al cambiar el tipo de activo.
  const estadoManualRef = useRef<string | null>(null)
  const prevEstadoTipoRef = useRef(defaultTipoActivoId ?? "")
  const savedActivoIdRef = useRef<string | null>(null)
  const hydratedIdRef = useRef<string | null>(null)

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

  const estadosOperativosQuery = useQuery(
    estadoOperativoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tipos = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content],
  )
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
  const estadosOperativos = useMemo(
    () => estadosOperativosQuery.data?.content ?? [],
    [estadosOperativosQuery.data?.content],
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
      if (!canManage) return
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

      const payload = buildActivoPayload(value, currentActivo)
      const target = resolveActivoSaveTarget({
        isEditing,
        activoId,
        savedId: savedActivoIdRef.current,
      })

      try {
        let saved: Activo

        if (target.mode === "update") {
          saved = await updateMutation.mutateAsync({
            id: target.id,
            payload,
          })
        } else {
          saved = await createMutation.mutateAsync(payload)
          // Si falla la imagen o los atributos, el reintento actualiza este
          // registro en lugar de crear un segundo activo.
          savedActivoIdRef.current = saved.id
        }

        if (file) {
          await uploadActivoImagen(saved.id, file)
        } else if (shouldRemoveImage && currentActivo?.urlImagen) {
          await deleteActivoImagen(saved.id)
        }

        await replaceActivoAtributos(
          saved.id,
          buildReplaceAtributosPayload(atributos, currentValores, existentes),
        )

        void queryClient.invalidateQueries({ queryKey: activoKeys.all })
        void queryClient.invalidateQueries({
          queryKey: activoAtributoValorKeys.lists(),
        })

        await navigate({ to: routes.activos.listarActivos })
      } catch (error) {
        const serverFieldErrors = mapAtributoValidationErrors(error, atributos)
        if (Object.keys(serverFieldErrors).length > 0) {
          setAtributoErrors(serverFieldErrors)
        }
        setFormError(
          isApiError(error)
            ? error.message
            : getErrorMessage(error) || "No se pudo guardar el activo.",
        )
      }
    },
  })

  // Reactive subscriptions for live preview & attributes
  const tipoActivoId = useStore(
    form.store,
    (state) => state.values.tipoActivoId,
  )
  const codigo = useStore(form.store, (state) => state.values.codigo)
  const codigoAlternativo = useStore(
    form.store,
    (state) => state.values.codigoAlternativo,
  )
  const nombre = useStore(form.store, (state) => state.values.nombre)
  const ubicacionId = useStore(form.store, (state) => state.values.ubicacionId)
  const estadoOperativoId = useStore(
    form.store,
    (state) => state.values.estadoOperativoId,
  )
  const fechaAdquisicion = useStore(
    form.store,
    (state) => state.values.fechaAdquisicion,
  )
  const descripcion = useStore(
    form.store,
    (state) => state.values.descripcion,
  )

  // Catálogo tipos_activo_estados del tipo seleccionado (una sola petición por tipo).
  const estadosDelTipoQuery = useQuery(
    tipoActivoEstadoQueries.byTipoActivoId(tipoActivoId ?? ""),
  )
  const asignacionesEstado = useMemo(
    () => estadosDelTipoQuery.data?.content ?? [],
    [estadosDelTipoQuery.data?.content],
  )
  const estadosDelTipo = useMemo(
    () => resolveEstadosDelTipo(asignacionesEstado, estadosOperativos),
    [asignacionesEstado, estadosOperativos],
  )
  const estadoPredeterminadoId = useMemo(
    () => resolveEstadoPredeterminadoId(asignacionesEstado),
    [asignacionesEstado],
  )
  const estadosParaSelector = useMemo(
    () =>
      includeCurrentEstadoOption(
        estadosDelTipo,
        estadoOperativoId ?? "",
        estadosOperativos,
      ),
    [estadosDelTipo, estadoOperativoId, estadosOperativos],
  )

  const selectedEstadoOperativo = useMemo(
    () => estadosOperativos.find((e) => e.id === estadoOperativoId),
    [estadosOperativos, estadoOperativoId],
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
      .filter((atributo) => atributo.visible === true)
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

  if (tipoActivoId !== prevTipoActivoId) {
    setPrevTipoActivoId(tipoActivoId)
    setUserValores({})
    setAtributoErrors({})
  }

  const valores = useMemo(() => {
    if (!tipoActivoId) return {}

    const result: Record<string, string> = {}
    for (const atributo of atributosVisibles) {
      if (userValores[atributo.id] !== undefined) {
        result[atributo.id] = userValores[atributo.id]
      } else {
        const existente = valoresExistentesByAtributoId.get(atributo.id)
        if (existente?.valor != null) {
          result[atributo.id] = existente.valor
        } else {
          result[atributo.id] = atributo.valorDefecto ?? ""
        }
      }
    }
    return result
  }, [
    atributosVisibles,
    tipoActivoId,
    userValores,
    valoresExistentesByAtributoId,
  ])

  useEffect(() => {
    syncRef.current = {
      atributos: atributosVisibles,
      valores,
      existentes: valoresExistentesByAtributoId,
      activo,
      pendingFile,
      removeExistingImage,
    }
  }, [
    activo,
    atributosVisibles,
    pendingFile,
    removeExistingImage,
    valores,
    valoresExistentesByAtributoId,
  ])

  // Hidratación y cambio de tipo comparten refs: si se ejecutaran en efectos
  // separados, el efecto del tipo sobrescribiría los refs recién hidratados y
  // borraría el estado operativo del activo al editar.
  useEffect(() => {
    if (isEditing && activo && hydratedIdRef.current !== activo.id) {
      hydratedIdRef.current = activo.id
      const tipoId = activo.tipoActivo?.id ?? activo.tipoActivoId ?? ""
      const estadoId =
        activo.estadoOperativo?.id ?? activo.estadoOperativoId ?? ""

      form.setFieldValue("codigo", activo.codigo)
      form.setFieldValue("codigoAlternativo", activo.codigoAlternativo ?? "")
      form.setFieldValue("nombre", activo.nombre)
      form.setFieldValue("descripcion", activo.descripcion ?? "")
      form.setFieldValue("tipoActivoId", tipoId)
      form.setFieldValue(
        "ubicacionId",
        activo.ubicacion?.id ?? activo.ubicacionId ?? "",
      )
      form.setFieldValue("estadoOperativoId", estadoId)
      form.setFieldValue("fechaAdquisicion", activo.fechaAdquisicion ?? "")

      prevEstadoTipoRef.current = tipoId
      estadoManualRef.current = estadoId || null
      return
    }

    if (!tipoActivoId) {
      prevEstadoTipoRef.current = ""
      estadoManualRef.current = null
      return
    }
    if (prevEstadoTipoRef.current === tipoActivoId) return
    prevEstadoTipoRef.current = tipoActivoId
    // El estado elegido para el tipo anterior deja de ser válido.
    estadoManualRef.current = null
    form.setFieldValue("estadoOperativoId", "")
  }, [activo, form, isEditing, tipoActivoId])

  useEffect(() => {
    if (isEditing || !tipoActivoId || !estadoPredeterminadoId) return
    if (estadoManualRef.current !== null) return
    if (!estadosDelTipo.some((estado) => estado.id === estadoPredeterminadoId)) return
    if (estadoOperativoId === estadoPredeterminadoId) return
    form.setFieldValue("estadoOperativoId", estadoPredeterminadoId)
  }, [
    estadoOperativoId,
    estadoPredeterminadoId,
    estadosDelTipo,
    form,
    isEditing,
    tipoActivoId,
  ])

  function handleEstadoChange(estadoOperativoIdSeleccionado: string) {
    estadoManualRef.current = estadoOperativoIdSeleccionado || null
  }

  const selectedTipo = tiposById.get(tipoActivoId)
  const SelectedIcon = selectedTipo
    ? getTipoActivoIcon(selectedTipo.icono)
    : Box
  const selectedColor = selectedTipo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  if (!canManage) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full max-w-5xl mx-auto py-8">
        <EmptyState
          title="Acceso restringido"
          description="Solo los usuarios con perfil ADMIN pueden crear o editar activos."
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

  if (isEditing && activoQuery.isLoading) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full max-w-5xl mx-auto py-8">
        <ListSkeleton rows={8} rowClassName="h-12 rounded-xl" />
      </PageShell>
    )
  }

  if (isEditing && activoQuery.isError) {
    return (
      <PageShell size="full" padding="none" layout="auto" className="w-full max-w-5xl mx-auto py-8">
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
    <PageShell size="full" padding="none" layout="auto" className="w-full max-w-7xl mx-auto space-y-4 pb-16">
      <ActivoFormHeader isEditing={isEditing} codigo={activo?.codigo} />

      <form
        className="flex flex-col gap-5 pt-1"
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
          {/* Main Info & Dynamic Attributes (Steps 1, 2, 3) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
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
              estadosOperativos={estadosParaSelector}
              estadosLoading={
                estadosOperativosQuery.isLoading || estadosDelTipoQuery.isLoading
              }
              estadosErrorMessage={
                estadosDelTipoQuery.isError
                  ? getErrorMessage(estadosDelTipoQuery.error)
                  : null
              }
              onEstadoChange={handleEstadoChange}
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
                setUserValores((prev) => ({ ...prev, [atributoId]: value }))
                setAtributoErrors((prev) => {
                  if (!prev[atributoId]) return prev
                  const next = { ...prev }
                  delete next[atributoId]
                  return next
                })
              }}
            />
          </div>

          {/* Side Media Panel & Live Preview */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-4">
            <ActivoFormImageSection
              currentUrl={activo?.urlImagen}
              pendingFile={pendingFile}
              onFileChange={setPendingFile}
              removeExistingImage={removeExistingImage}
              onRemoveExistingChange={setRemoveExistingImage}
            />

            <ActivoLivePreviewCard
              codigo={codigo}
              codigoAlternativo={codigoAlternativo}
              nombre={nombre}
              descripcion={descripcion}
              fechaAdquisicion={fechaAdquisicion}
              selectedTipo={selectedTipo}
              ubicacion={ubicacionId ? ubicacionesById.get(ubicacionId) : undefined}
              estadoOperativoNombre={selectedEstadoOperativo?.nombre}
              estadoOperativoColor={selectedEstadoOperativo?.color}
              pendingFile={pendingFile}
              currentUrl={activo?.urlImagen}
              removeExistingImage={removeExistingImage}
            />
          </div>
        </div>

        <ActivoFormFooter form={form} />
      </form>
    </PageShell>
  )
}
