import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { ubicacionQueries } from "../api/ubicacion.queries"
import type { TipoUbicacion, Ubicacion, UbicacionTreeNode } from "../api/ubicacion.service"
import { UbicacionCard } from "../components/UbicacionCard"
import {
  UbicacionFilterToolbar,
  type ViewMode,
} from "../components/UbicacionFilterToolbar"
import { UbicacionFormDialog } from "../components/UbicacionFormDialog"
import { UbicacionQuickViewSheet } from "../components/UbicacionQuickViewSheet"
import { UbicacionStats } from "../components/UbicacionStats"
import { UbicacionTableView } from "../components/UbicacionTableView"
import { UbicacionTreeView } from "../components/UbicacionTreeView"
import { UbicacionMapView } from "../components/map/UbicacionMapView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize
const ALL_TIPOS = "__all__"

export function UbicacionesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("tree")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Ubicacion | null>(null)
  const [presetParentId, setPresetParentId] = useState<string | null>(null)
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>(ALL_TIPOS)

  const search = usePaginatedSearch()

  // Queries
  const ubicacionesListQuery = useQuery(
    ubicacionQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
      ...(selectedTipoFilter !== ALL_TIPOS ? { tipo: selectedTipoFilter } : {}),
    }),
  )

  const arbolQuery = useQuery(ubicacionQueries.arbol())
  const raicesQuery = useQuery(ubicacionQueries.raices())

  const ubicacionesList = ubicacionesListQuery.data?.content ?? []
  const treeNodes = arbolQuery.data ?? []

  // Create lookup maps for parent locations
  const parentsById = useMemo(() => {
    const map = new Map<string, Ubicacion>()
    for (const loc of ubicacionesList) {
      map.set(loc.id, loc)
    }
    return map
  }, [ubicacionesList])

  // Quick view detailed location item
  const selectedQuickViewLoc = useMemo(() => {
    if (!quickViewId) return null
    return (
      ubicacionesList.find((u) => u.id === quickViewId) ?? {
        id: quickViewId,
        codigo: "...",
        nombre: "Cargando...",
        tipo: "CIUDAD" as TipoUbicacion,
        ubicacionPadreId: null,
        descripcion: null,
        direccion: null,
        latitud: null,
        longitud: null,
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: "",
      }
    )
  }, [quickViewId, ubicacionesList])

  const selectedQuickViewParent = useMemo(() => {
    if (!selectedQuickViewLoc?.ubicacionPadreId) return null
    return parentsById.get(selectedQuickViewLoc.ubicacionPadreId) ?? null
  }, [selectedQuickViewLoc, parentsById])

  useClampPage(
    search.page,
    search.setPage,
    ubicacionesListQuery.data?.totalPages,
  )

  function openCreate(parentId?: string | null) {
    setEditing(null)
    setPresetParentId(parentId ?? null)
    setDialogOpen(true)
  }

  function openEdit(ubicacion: Ubicacion) {
    setEditing(ubicacion)
    setPresetParentId(null)
    setDialogOpen(true)
  }

  function handleAddChildNode(parentNode: UbicacionTreeNode) {
    openCreate(parentNode.id)
  }

  const hasActiveFilters = Boolean(
    search.search.trim() || selectedTipoFilter !== ALL_TIPOS,
  )

  function resetFilters() {
    search.setSearch("")
    setSelectedTipoFilter(ALL_TIPOS)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Ubicaciones
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={() => openCreate()}
              className="shrink-0 md:hidden"
            >
              <Plus />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra la estructura jerárquica de sedes, edificios, plantas, áreas y oficinas.
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={() => openCreate()}
          className="hidden shrink-0 self-start md:inline-flex"
        >
          <Plus />
          Crear Ubicación
        </Button>
      </header>

      {/* Stats Cards Section */}
      <div className="shrink-0 pt-4 pb-2">
        <UbicacionStats
          totalCount={ubicacionesListQuery.data?.totalElements}
          raicesCount={raicesQuery.data?.length}
          treeNodes={treeNodes}
          ubicaciones={ubicacionesList}
          isLoading={ubicacionesListQuery.isLoading && arbolQuery.isLoading}
        />
      </div>

      {/* Filter & View Mode Toolbar */}
      <UbicacionFilterToolbar
        searchValue={search.search}
        onSearchChange={search.setSearch}
        tipo={selectedTipoFilter}
        onTipoChange={setSelectedTipoFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-3">
        {viewMode === "tree" ? (
          arbolQuery.isLoading ? (
            <ListSkeleton rows={6} rowClassName="h-12 rounded-lg" />
          ) : arbolQuery.isError ? (
            <EmptyState
              title={getErrorMessage(arbolQuery.error)}
              className="text-destructive"
            />
          ) : (
            <UbicacionTreeView
              treeNodes={treeNodes}
              searchQuery={search.search}
              tipoFilter={selectedTipoFilter}
              onEdit={openEdit}
              onAddChild={handleAddChildNode}
              onQuickView={(id) => setQuickViewId(id)}
              onOpenCreate={() => openCreate()}
            />
          )
        ) : viewMode === "map" ? (
          ubicacionesListQuery.isLoading ? (
            <ListSkeleton rows={6} rowClassName="h-[400px] rounded-xl" />
          ) : ubicacionesListQuery.isError ? (
            <EmptyState
              title={getErrorMessage(ubicacionesListQuery.error)}
              className="text-destructive"
            />
          ) : (
            <UbicacionMapView
              ubicaciones={ubicacionesList}
              onEdit={openEdit}
              onQuickView={(id) => setQuickViewId(id)}
              onOpenCreate={() => openCreate()}
            />
          )
        ) : ubicacionesListQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName={viewMode === "grid" ? "h-28 rounded-xl" : "h-14 rounded-lg"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "flex flex-col gap-2"
            }
          />
        ) : ubicacionesListQuery.isError ? (
          <EmptyState
            title={getErrorMessage(ubicacionesListQuery.error)}
            className="text-destructive"
          />
        ) : ubicacionesList.length === 0 ? (
          <EmptyState
            icon={<MapPin className="size-4 text-muted-foreground" />}
            title={hasActiveFilters ? "Sin resultados" : "No hay ubicaciones"}
            description={
              hasActiveFilters
                ? "Prueba con otra búsqueda o limpia los filtros."
                : "Crea la primera ubicación para empezar a estructurar la organización."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" type="button" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={() => openCreate()}>
                  <Plus />
                  Crear Ubicación
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                ubicacionesListQuery.isFetching && "opacity-70",
              )}
            >
              {viewMode === "grid" ? (
                <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {ubicacionesList.map((ubicacion) => (
                    <UbicacionCard
                      key={ubicacion.id}
                      ubicacion={ubicacion}
                      parentName={
                        ubicacion.ubicacionPadreId
                          ? parentsById.get(ubicacion.ubicacionPadreId)?.nombre
                          : null
                      }
                      onEdit={openEdit}
                      onQuickView={(id) => setQuickViewId(id)}
                    />
                  ))}
                </ul>
              ) : (
                <UbicacionTableView
                  ubicaciones={ubicacionesList}
                  parentsById={parentsById}
                  onEdit={openEdit}
                  onQuickView={(id) => setQuickViewId(id)}
                />
              )}
            </div>

            {ubicacionesListQuery.data ? (
              <Pagination
                page={ubicacionesListQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <UbicacionFormDialog
        key={editing?.id ?? presetParentId ?? "new-ubicacion"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ubicacion={editing}
        parentLocationId={presetParentId}
        availableLocations={ubicacionesList}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />

      {/* Quick View Sheet */}
      <UbicacionQuickViewSheet
        open={Boolean(quickViewId)}
        onOpenChange={(open) => !open && setQuickViewId(null)}
        ubicacion={selectedQuickViewLoc}
        parentLocation={selectedQuickViewParent}
        onEdit={openEdit}
      />
    </PageShell>
  )
}
