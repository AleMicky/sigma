import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { routes } from "@/app/config/routes"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import { activoDocumentoQueries } from "@/modules/activos/activo-documento/api/activo-documento.queries"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { useCanManageActivos } from "@/modules/activos/lib/use-can-manage-activos"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

import { activoQueries } from "../api/activo.queries"
import { CambiarEstadoOperativoDialog } from "../components/CambiarEstadoOperativoDialog"
import {
  ActivoAccesorioFormModal,
  ActivoAccesoriosTab,
  ActivoAddDocumentModal,
  ActivoAsignacionTab,
  ActivoDetailHeader,
  ActivoDetailHero,
  ActivoDetailTabs,
  ActivoDocumentosTab,
  ActivoHistorialTab,
  ActivoMantenimientoPreventivoTab,
  ActivoImagePreviewModal,
  ActivoInfoTab,
  type TabType,
} from "../components/detalle-activo"

type ActivoDetailPageProps = {
  activoId: string
}

function handlePrint() {
  window.print()
}

export function ActivoDetailPage({ activoId }: Readonly<ActivoDetailPageProps>) {
  const canManage = useCanManageActivos()
  const [activeTab, setActiveTab] = useState<TabType>("informacion")
  const [isEditing, setIsEditing] = useState(false)
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)
  const [editingDocumento, setEditingDocumento] = useState<ActivoDocumento | null>(null)
  const [isAddAccesorioOpen, setIsAddAccesorioOpen] = useState(false)
  const [editingAccesorio, setEditingAccesorio] = useState<ActivoAccesorio | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isCambiarEstadoOpen, setIsCambiarEstadoOpen] = useState(false)

  // Queries
  const activoQuery = useQuery(activoQueries.detail(activoId))
  const activo = activoQuery.data

  const tipoActivoId = activo?.tipoActivo?.id ?? activo?.tipoActivoId ?? ""

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
    ...activoAtributoValorQueries.byActivo(activoId),
    enabled: Boolean(activoId),
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

  const categoriaQuery = useQuery({
    ...categoriaQueries.detail(tipoActivo?.categoriaId ?? ""),
    enabled: Boolean(tipoActivo?.categoriaId),
  })
  const categoria = categoriaQuery.data

  const ubicacionQuery = useQuery({
    ...ubicacionQueries.detail(activo?.ubicacionId ?? ""),
    enabled: Boolean(!activo?.ubicacion && activo?.ubicacionId),
  })
  const ubicacion = activo?.ubicacion ?? ubicacionQuery.data

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const ubicaciones = ubicacionesQuery.data?.content ?? []

  const color = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const Icon = getTipoActivoIcon(tipoActivo?.icono)

  // Real list of documents for this asset
  const documentosQuery = useQuery(
    activoDocumentoQueries.byActivo(activoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )
  const documentos = documentosQuery.data?.content ?? []

  // Real list of assigned accessories for this asset
  const accesoriosQuery = useQuery(
    activoAccesorioQueries.byActivo(activoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )
  const accesorios = accesoriosQuery.data?.content ?? []

  function handleToggleEdit(editing: boolean) {
    if (editing && !canManage) return
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

  if (activoQuery.isLoading) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-6 flex flex-col gap-4">
          <ListSkeleton rows={3} rowClassName="h-28 rounded-xl" />
        </div>
      </PageShell>
    )
  }

  if (activoQuery.isError || !activo) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-12 flex flex-col items-center justify-center">
          <EmptyState
            title={getErrorMessage(activoQuery.error) || "Activo no encontrado"}
            description="El activo solicitado no existe o fue eliminado del sistema."
            action={
              <Button size="sm" render={<Link to={routes.activos.catalogo} />}>
                <ArrowLeft className="size-4" />
                Volver al catálogo de activos
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
      {/* Top Header Breadcrumb & Actions */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <ActivoDetailHeader
          activoId={activo.id}
          nombre={activo.nombre}
          onPrint={handlePrint}
          queries={[
            activoQuery,
            tipoActivoQuery,
            categoriaQuery,
            ubicacionQuery,
            ubicacionesQuery,
            documentosQuery,
            accesoriosQuery,
            atributosQuery,
            atributoValoresQuery,
            tiposDatoQuery,
          ]}
        />

        {/* Hero Card */}
        <ActivoDetailHero
          activo={activo}
          tipoActivo={tipoActivo}
          color={color}
          icon={Icon}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenAddDocument={() => {
            setActiveTab("documentacion")
            handleOpenAddDocument()
          }}
          onCambiarEstado={() => setIsCambiarEstadoOpen(true)}
          canManage={canManage}
        />

        {/* Tab Navigation Toolbar */}
        <ActivoDetailTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
          }}
          documentosCount={documentos.length}
          accesoriosCount={accesorios.length}
        />
      </header>

      {/* Main Tab Content */}
      <main className="py-4 flex flex-col gap-4">
        {activeTab === "informacion" && (
          <ActivoInfoTab
            activo={activo}
            tipoActivo={tipoActivo}
            categoria={categoria}
            ubicacion={ubicacion}
            ubicaciones={ubicaciones}
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
            canManage={canManage}
          />
        )}

        {activeTab === "documentacion" && (
          <ActivoDocumentosTab
            activoId={activo.id}
            onOpenAddDocument={handleOpenAddDocument}
            onEditDocumento={handleEditDocumento}
            canManage={canManage}
          />
        )}

        {activeTab === "accesorios" && (
          <ActivoAccesoriosTab
            activoId={activo.id}
            activoCodigo={activo.codigo}
            activoNombre={activo.nombre}
            tipoActivoId={activo.tipoActivo?.id ?? activo.tipoActivoId}
            onOpenAddAccesorio={handleOpenAddAccesorio}
            onEditAccesorio={handleEditAccesorio}
            canManage={canManage}
          />
        )}

        {activeTab === "asignacion" && (
          <ActivoAsignacionTab activo={activo} ubicacion={ubicacion} />
        )}

        {activeTab === "preventivo" && (
          <ActivoMantenimientoPreventivoTab activo={activo} tipoActivo={tipoActivo} />
        )}

        {activeTab === "historial" && (
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
        activoId={activo.id}
        activoCodigo={activo.codigo}
        itemToEdit={editingDocumento}
      />

      <ActivoAccesorioFormModal
        open={isAddAccesorioOpen}
        onOpenChange={setIsAddAccesorioOpen}
        activoId={activo.id}
        activoCodigo={activo.codigo}
        activoNombre={activo.nombre}
        categoriaId={activo.tipoActivo?.categoriaId ?? tipoActivo?.categoriaId}
        itemToEdit={editingAccesorio}
      />

      <ActivoImagePreviewModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        imageUrl={activo.urlImagen}
        altText={activo.nombre}
      />

      <CambiarEstadoOperativoDialog
        open={isCambiarEstadoOpen}
        onOpenChange={setIsCambiarEstadoOpen}
        activo={activo}
      />
    </PageShell>
  )
}
