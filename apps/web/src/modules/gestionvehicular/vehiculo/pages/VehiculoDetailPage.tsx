import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { routes } from "@/app/config/routes"
import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import { CambiarEstadoOperativoDialog } from "@/modules/activos/activo/components/CambiarEstadoOperativoDialog"
import {
  ActivoAccesorioFormModal,
  ActivoAccesoriosTab,
  ActivoAddDocumentModal,
  ActivoAsignacionTab,
  ActivoDetailTabs,
  ActivoDocumentosTab,
  ActivoHistorialTab,
  ActivoImagePreviewModal,
  ActivoMantenimientoPreventivoTab,
  type TabType,
} from "@/modules/activos/activo/components/detalle-activo"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import { activoDocumentoQueries } from "@/modules/activos/activo-documento/api/activo-documento.queries"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

import { vehiculoKeys } from "../api/vehiculo.keys"
import { vehiculoQueries } from "../api/vehiculo.queries"
import { VehiculoDetailHeader } from "../components/detalle-vehiculo/VehiculoDetailHeader"
import { VehiculoDetailHero } from "../components/detalle-vehiculo/VehiculoDetailHero"
import { VehiculoInfoTab } from "../components/detalle-vehiculo/VehiculoInfoTab"
import { getVehiculoTituloDinamico } from "../lib/vehiculo-atributos.utils"

type VehiculoDetailPageProps = {
  vehiculoId: string
}

function handlePrint() {
  window.print()
}

export function VehiculoDetailPage({
  vehiculoId,
}: Readonly<VehiculoDetailPageProps>) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>("informacion")
  const [isEditing, setIsEditing] = useState(false)
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)
  const [editingDocumento, setEditingDocumento] =
    useState<ActivoDocumento | null>(null)
  const [isAddAccesorioOpen, setIsAddAccesorioOpen] = useState(false)
  const [editingAccesorio, setEditingAccesorio] =
    useState<ActivoAccesorio | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isCambiarEstadoOpen, setIsCambiarEstadoOpen] = useState(false)

  // Consulta propia del módulo gestionvehicular
  const vehiculoQuery = useQuery(vehiculoQueries.detail(vehiculoId))
  const vehiculo = vehiculoQuery.data

  // Consulta de soporte para pestañas compartidas (asignación, preventivo, historial, cambio de estado)
  const activoQuery = useQuery({
    ...activoQueries.detail(vehiculoId),
    enabled: Boolean(vehiculoId),
  })
  const activo = activoQuery.data

  const tipoActivoId =
    vehiculo?.tipoActivo?.id ??
    activo?.tipoActivo?.id ??
    activo?.tipoActivoId ??
    ""

  const tipoActivoQuery = useQuery({
    ...tipoActivoQueries.detail(tipoActivoId),
    enabled: Boolean(!activo?.tipoActivo && tipoActivoId),
  })
  const tipoActivo = activo?.tipoActivo ?? tipoActivoQuery.data

  const atributosQuery = useQuery({
    ...activoAtributoQueries.byTipoActivo(tipoActivoId, {
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
    enabled: Boolean(tipoActivoId),
  })
  const atributos = atributosQuery.data?.content ?? []

  const atributoValoresQuery = useQuery({
    ...activoAtributoValorQueries.byActivo(vehiculoId),
    enabled: Boolean(vehiculoId),
  })
  const atributoValores = atributoValoresQuery.data?.content ?? []

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const tiposDatoById = useMemo(
    () =>
      new Map(
        (tiposDatoQuery.data?.content ?? []).map((tipo) => [tipo.id, tipo]),
      ),
    [tiposDatoQuery.data?.content],
  )

  const ubicacionQuery = useQuery({
    ...ubicacionQueries.detail(activo?.ubicacionId ?? ""),
    enabled: Boolean(!activo?.ubicacion && activo?.ubicacionId),
  })
  const ubicacion = activo?.ubicacion ?? ubicacionQuery.data

  const documentosQuery = useQuery(
    activoDocumentoQueries.byActivo(vehiculoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )
  const documentos = documentosQuery.data?.content ?? []

  const accesoriosQuery = useQuery(
    activoAccesorioQueries.byActivo(vehiculoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )
  const accesorios = accesoriosQuery.data?.content ?? []

  // Título dinámico basado SOLO en atributos visibles (sin nombre ni código de activo)
  const tituloDinamico = useMemo(
    () => (vehiculo ? getVehiculoTituloDinamico(vehiculo) : "Ficha de Vehículo"),
    [vehiculo],
  )

  const color =
    vehiculo?.tipoActivo?.color ||
    tipoActivo?.color ||
    DEFAULT_TIPO_ACTIVO_COLOR

  function handleToggleEdit(editing: boolean) {
    if (editing) {
      setActiveTab("informacion")
    }
    setIsEditing(editing)
  }

  function handleOpenAddDocument() {
    setEditingDocumento(null)
    setIsAddDocOpen(true)
  }

  function handleEditDocumento(doc: ActivoDocumento) {
    setEditingDocumento(doc)
    setIsAddDocOpen(true)
  }

  function handleOpenAddAccesorio() {
    setEditingAccesorio(null)
    setIsAddAccesorioOpen(true)
  }

  function handleEditAccesorio(item: ActivoAccesorio) {
    setEditingAccesorio(item)
    setIsAddAccesorioOpen(true)
  }

  if (vehiculoQuery.isLoading) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-6 flex flex-col gap-4">
          <ListSkeleton rows={3} rowClassName="h-28 rounded-xl" />
        </div>
      </PageShell>
    )
  }

  if (vehiculoQuery.isError || !vehiculo) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-12 flex flex-col items-center justify-center">
          <EmptyState
            title={
              getErrorMessage(vehiculoQuery.error) || "Vehículo no encontrado"
            }
            description="El vehículo solicitado no existe o no pertenece al tipo de activo Vehículo."
            action={
              <Button
                size="sm"
                render={<Link to={routes.gestionVehicular.vehiculos} />}
              >
                <ArrowLeft className="size-4" />
                Volver al listado de vehículos
              </Button>
            }
            className="text-destructive"
          />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell size="xl" layout="scroll" padding="compact">
      {/* Header Breadcrumb + Hero + Tabs */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <VehiculoDetailHeader
          titulo={tituloDinamico}
          onPrint={handlePrint}
          queries={[
            vehiculoQuery,
            activoQuery,
            tipoActivoQuery,
            ubicacionQuery,
            documentosQuery,
            accesoriosQuery,
            atributosQuery,
            atributoValoresQuery,
            tiposDatoQuery,
          ]}
        />

        <VehiculoDetailHero
          vehiculo={vehiculo}
          titulo={tituloDinamico}
          color={color}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenAddDocument={() => {
            setActiveTab("documentacion")
            handleOpenAddDocument()
          }}
          onCambiarEstado={
            activo ? () => setIsCambiarEstadoOpen(true) : undefined
          }
        />

        <ActivoDetailTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          documentosCount={documentos.length}
          accesoriosCount={accesorios.length}
        />
      </header>

      {/* Main Tab Content */}
      <main className="py-4 flex flex-col gap-4">
        {activeTab === "informacion" && (
          <VehiculoInfoTab
            vehiculo={vehiculo}
            atributos={atributos}
            atributoValores={atributoValores}
            tiposDatoById={tiposDatoById}
            atributosLoading={
              atributosQuery.isLoading || atributoValoresQuery.isLoading
            }
            documentos={documentos}
            isEditing={isEditing}
            onToggleEdit={handleToggleEdit}
            onOpenAddDocument={handleOpenAddDocument}
          />
        )}

        {activeTab === "documentacion" && (
          <ActivoDocumentosTab
            activoId={vehiculo.id}
            onOpenAddDocument={handleOpenAddDocument}
            onEditDocumento={handleEditDocumento}
          />
        )}

        {activeTab === "accesorios" && (
          <ActivoAccesoriosTab
            activoId={vehiculo.id}
            activoNombre={tituloDinamico}
            tipoActivoId={tipoActivoId}
            onOpenAddAccesorio={handleOpenAddAccesorio}
            onEditAccesorio={handleEditAccesorio}
          />
        )}

        {activeTab === "asignacion" && activo && (
          <ActivoAsignacionTab activo={activo} ubicacion={ubicacion} />
        )}

        {activeTab === "preventivo" && activo && (
          <ActivoMantenimientoPreventivoTab
            activo={activo}
            tipoActivo={tipoActivo}
          />
        )}

        {activeTab === "historial" && activo && (
          <ActivoHistorialTab
            activo={activo}
            tipoActivo={tipoActivo}
            documentos={documentos}
            accesorios={accesorios}
          />
        )}
      </main>

      {/* Modals */}
      <ActivoAddDocumentModal
        open={isAddDocOpen}
        onOpenChange={(open) => {
          setIsAddDocOpen(open)
          if (!open) setEditingDocumento(null)
        }}
        activoId={vehiculo.id}
        itemToEdit={editingDocumento}
      />

      <ActivoAccesorioFormModal
        open={isAddAccesorioOpen}
        onOpenChange={setIsAddAccesorioOpen}
        activoId={vehiculo.id}
        activoNombre={tituloDinamico}
        categoriaId={tipoActivo?.categoriaId}
        itemToEdit={editingAccesorio}
      />

      <ActivoImagePreviewModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        imageUrl={vehiculo.urlImagen}
        altText={tituloDinamico}
      />

      <CambiarEstadoOperativoDialog
        open={isCambiarEstadoOpen}
        onOpenChange={setIsCambiarEstadoOpen}
        activo={activo ?? null}
        onSuccess={() => {
          void queryClient.invalidateQueries({
            queryKey: vehiculoKeys.detail(vehiculo.id),
          })
          void queryClient.invalidateQueries({ queryKey: vehiculoKeys.lists() })
        }}
      />
    </PageShell>
  )
}
