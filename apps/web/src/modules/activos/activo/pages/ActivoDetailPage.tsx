import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import { activoDocumentoQueries } from "@/modules/activos/activo-documento/api/activo-documento.queries"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

import { activoQueries } from "../api/activo.queries"
import {
  ActivoAddDocumentModal,
  ActivoAddMantenimientoModal,
  ActivoAsignacionTab,
  ActivoAuditoriaTab,
  ActivoDetailHeader,
  ActivoDetailHero,
  ActivoDetailTabs,
  ActivoDocumentosTab,
  ActivoHistorialTab,
  ActivoImagePreviewModal,
  ActivoInfoTab,
  type MantenimientoItem,
  type TabType,
} from "../components/detalle-activo"

type ActivoDetailPageProps = {
  activoId: string
}

export function ActivoDetailPage({ activoId }: ActivoDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("informacion")
  const [isEditing, setIsEditing] = useState(false)
  const [docFilter, setDocFilter] = useState<string>("todos")
  const [docSearch, setDocSearch] = useState<string>("")
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)
  const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Queries
  const activoQuery = useQuery(activoQueries.detail(activoId))
  const activo = activoQuery.data

  const tipoActivoQuery = useQuery({
    ...tipoActivoQueries.detail(activo?.tipoActivoId ?? ""),
    enabled: Boolean(activo?.tipoActivoId),
  })
  const tipoActivo = activo?.tipoActivo ?? tipoActivoQuery.data

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

  const atributosDefQuery = useQuery({
    ...activoAtributoQueries.byTipoActivo(activo?.tipoActivoId ?? ""),
    enabled: Boolean(activo?.tipoActivoId),
  })
  const atributosDef = atributosDefQuery.data?.content ?? []

  const valoresQuery = useQuery(activoAtributoValorQueries.byActivo(activoId))
  const rawValores = valoresQuery.data?.content ?? []

  const valoresByAtributoId = useMemo(() => {
    const map = new Map<string, string>()
    rawValores.forEach((v) => {
      if (v.activoAtributoId && v.valor) {
        map.set(v.activoAtributoId, v.valor)
      }
    })
    return map
  }, [rawValores])

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

  // Mock list of maintenance history
  const [mantenimientos, setMantenimientos] = useState<MantenimientoItem[]>([
    {
      id: "maint-1",
      tipo: "preventivo",
      titulo: "Mantenimiento Preventivo 40,000 km",
      fecha: "10/01/2026",
      kilometraje: "40,150 km",
      responsable: "Taller Central ENDE",
      costo: "Bs. 1,450",
      observaciones:
        "Cambio de aceite sintético, filtros de aire y combustible, alineación y balanceo.",
    },
    {
      id: "maint-2",
      tipo: "inspeccion",
      titulo: "Inspección de Seguridad Semestral",
      fecha: "15/11/2025",
      kilometraje: "36,800 km",
      responsable: "Dpto. de Seguridad Industrial",
      observaciones:
        "Verificación de luces, frenos, botiquín, extintor y equipo de emergencia. Aprobado sin observaciones.",
    },
    {
      id: "maint-3",
      tipo: "preventivo",
      titulo: "Mantenimiento Preventivo 30,000 km",
      fecha: "05/06/2025",
      kilometraje: "30,200 km",
      responsable: "Servicio Autorizado Toyosa",
      costo: "Bs. 1,820",
      observaciones:
        "Reemplazo de pastillas de frenos y revisión de suspensión.",
    },
  ])

  function copyCode() {
    if (!activo?.codigo) return
    navigator.clipboard.writeText(activo.codigo)
    toast.success("Código copiado al portapapeles")
  }

  function handlePrint() {
    window.print()
  }

  function handleToggleEdit(editing: boolean) {
    if (editing) {
      setActiveTab("informacion")
    }
    setIsEditing(editing)
  }

  function handleAddMantenimiento(newMaint: MantenimientoItem) {
    setMantenimientos((prev) => [newMaint, ...prev])
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
          codigo={activo.codigo}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onPrint={handlePrint}
        />

        {/* Hero Card */}
        <ActivoDetailHero
          activo={activo}
          tipoActivo={tipoActivo}
          color={color}
          icon={Icon}
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onCopyCode={copyCode}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenMantenimiento={() => setIsMantenimientoOpen(true)}
          onOpenAddDocument={() => {
            setActiveTab("documentacion")
            setIsAddDocOpen(true)
          }}
        />

        {/* Tab Navigation Toolbar */}
        <ActivoDetailTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
          }}
          documentosCount={documentos.length}
          mantenimientosCount={mantenimientos.length}
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
            atributosDef={atributosDef}
            valoresByAtributoId={valoresByAtributoId}
            rawValores={rawValores}
            tiposDatoById={tiposDatoById}
            documentos={documentos}
            isEditing={isEditing}
            onToggleEdit={handleToggleEdit}
            onOpenAddDocument={() => setIsAddDocOpen(true)}
          />
        )}

        {activeTab === "documentacion" && (
          <ActivoDocumentosTab
            activoId={activo.id}
            docSearch={docSearch}
            onSearchChange={setDocSearch}
            docFilter={docFilter}
            onFilterChange={setDocFilter}
            onOpenAddDocument={() => setIsAddDocOpen(true)}
          />
        )}

        {activeTab === "asignacion" && (
          <ActivoAsignacionTab activo={activo} ubicacion={ubicacion} />
        )}

        {activeTab === "historial" && (
          <ActivoHistorialTab
            activo={activo}
            tipoActivo={tipoActivo}
            mantenimientos={mantenimientos}
            onOpenMantenimiento={() => setIsMantenimientoOpen(true)}
          />
        )}

        {activeTab === "auditoria" && <ActivoAuditoriaTab activo={activo} />}
      </main>

      {/* Modals */}
      <ActivoAddMantenimientoModal
        open={isMantenimientoOpen}
        onOpenChange={setIsMantenimientoOpen}
        activoCodigo={activo.codigo}
        onAddMantenimiento={handleAddMantenimiento}
      />

      <ActivoAddDocumentModal
        open={isAddDocOpen}
        onOpenChange={setIsAddDocOpen}
        activoId={activo.id}
        activoCodigo={activo.codigo}
      />

      <ActivoImagePreviewModal
        open={isImageModalOpen}
        onOpenChange={setIsImageModalOpen}
        imageUrl={activo.urlImagen}
        altText={activo.nombre}
      />
    </PageShell>
  )
}
