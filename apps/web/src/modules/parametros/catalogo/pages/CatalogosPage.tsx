import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Eye, HelpCircle, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { MasterDetailLayout } from "@/shared/components/master-detail"
import { RefreshButton } from "@/shared/components/refresh-button"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { catalogoItemQueries } from "../api/catalogo-item.queries"
import { catalogoQueries } from "../api/catalogo.queries"
import type { Catalogo } from "../api/catalogo.service"
import type { CatalogoItem } from "../api/catalogo-item.service"
import { CatalogoDetailPanel } from "../components/CatalogoDetailPanel"
import { CatalogoFormDialog } from "../components/CatalogoFormDialog"
import { CatalogoHelpModal } from "../components/CatalogoHelpModal"
import { CatalogoItemFormDialog } from "../components/CatalogoItemFormDialog"
import { CatalogoMasterPanel } from "../components/CatalogoMasterPanel"
import { CatalogoQuickViewSheet } from "../components/CatalogoQuickViewSheet"
import { CatalogoStats } from "../components/CatalogoStats"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CatalogosPage() {
  const [catalogoDialogOpen, setCatalogoDialogOpen] = useState(false)
  const [editingCatalogo, setEditingCatalogo] = useState<Catalogo | null>(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [quickViewCatalogo, setQuickViewCatalogo] = useState<Catalogo | null>(null)

  const catalogoSearch = usePaginatedSearch()

  const catalogosQuery = useQuery(
    catalogoQueries.list({
      page: catalogoSearch.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(catalogoSearch.query ? { q: catalogoSearch.query } : {}),
    }),
  )

  const catalogos = catalogosQuery.data?.content ?? []
  const totalCatalogos = catalogosQuery.data?.totalElements ?? catalogos.length

  useClampPage(
    catalogoSearch.page,
    catalogoSearch.setPage,
    catalogosQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(catalogos)
  const itemSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
  })

  // Selected catalog items count for stats banner
  const selectedItemsQuery = useQuery({
    ...catalogoItemQueries.byCatalogo(masterDetail.selectedId ?? "", {
      page: 0,
      size: 1,
    }),
    enabled: Boolean(masterDetail.selectedId),
  })

  function openCreateCatalogo() {
    setEditingCatalogo(null)
    setCatalogoDialogOpen(true)
  }

  function openEditCatalogo(catalogo: Catalogo) {
    setEditingCatalogo(catalogo)
    setCatalogoDialogOpen(true)
  }

  function openCreateItem() {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  function openEditItem(item: CatalogoItem) {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Top Banner Stats */}
      <CatalogoStats
        totalCatalogos={totalCatalogos}
        totalItemsSelected={selectedItemsQuery.data?.totalElements}
        selectedCatalogoNombre={masterDetail.selected?.nombre}
      />

      <div className="flex-1 min-h-0">
        <MasterDetailLayout
          title={
            masterDetail.isMobile &&
            masterDetail.mobileShowDetail &&
            masterDetail.selected
              ? masterDetail.selected.nombre
              : "Catálogos Maestros"
          }
          showMaster={masterDetail.showMaster}
          showDetail={masterDetail.showDetail}
          showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
          backLabel="Volver a catálogos"
          onBack={masterDetail.backToMaster}
          headerAction={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <RefreshButton
                size="sm"
                queries={[catalogosQuery, selectedItemsQuery]}
              />

              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="shrink-0 gap-1.5 text-xs"
                title="Guía de catálogos y parámetros"
              >
                <HelpCircle className="size-3.5" />
                <span className="hidden sm:inline">Guía</span>
              </Button>

              {masterDetail.selected ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setQuickViewCatalogo(masterDetail.selected)}
                  className="shrink-0 gap-1.5 text-xs"
                  title="Ver ficha del catálogo"
                >
                  <Eye className="size-3.5" />
                  <span className="hidden sm:inline">Ficha</span>
                </Button>
              ) : null}

              {masterDetail.showMaster ? (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreateCatalogo}
                  className="shrink-0 gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Crear</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreateItem}
                  className="shrink-0 gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Agregar</span>
                </Button>
              )}
            </div>
          }
          master={
            <CatalogoMasterPanel
              catalogos={catalogos}
              page={catalogosQuery.data}
              selectedId={masterDetail.selectedId}
              search={catalogoSearch.search}
              isLoading={catalogosQuery.isLoading}
              isFetching={catalogosQuery.isFetching}
              errorMessage={
                catalogosQuery.isError
                  ? getErrorMessage(catalogosQuery.error)
                  : null
              }
              onSearchChange={catalogoSearch.setSearch}
              onSelect={masterDetail.select}
              onCreate={openCreateCatalogo}
              onEdit={openEditCatalogo}
              onQuickView={(cat) => setQuickViewCatalogo(cat)}
              onPageChange={catalogoSearch.setPage}
            />
          }
          detail={
            <CatalogoDetailPanel
              catalogo={masterDetail.selected}
              itemPage={itemSearch.page}
              search={itemSearch.search}
              searchQuery={itemSearch.debouncedSearch}
              hidePrimaryAction={
                masterDetail.isMobile && masterDetail.mobileShowDetail
              }
              onSearchChange={itemSearch.setSearch}
              onPageChange={itemSearch.setPage}
              onCreateItem={openCreateItem}
              onEditItem={openEditItem}
            />
          }
        >
          <CatalogoFormDialog
            key={editingCatalogo?.id ?? "new-catalogo"}
            open={catalogoDialogOpen}
            onOpenChange={setCatalogoDialogOpen}
            catalogo={editingCatalogo}
            onSuccess={(saved) => {
              masterDetail.revealDetail(saved.id)
              catalogoSearch.setPage(0)
            }}
          />

          {masterDetail.selected ? (
            <CatalogoItemFormDialog
              key={editingItem?.id ?? `new-item-${masterDetail.selected.id}`}
              open={itemDialogOpen}
              onOpenChange={setItemDialogOpen}
              catalogoId={masterDetail.selected.id}
              item={editingItem}
              onSuccess={() => {
                if (!editingItem) {
                  itemSearch.setPage(0)
                }
              }}
            />
          ) : null}

          {/* Quick View Drawer */}
          <CatalogoQuickViewSheet
            catalogo={quickViewCatalogo}
            open={Boolean(quickViewCatalogo)}
            onOpenChange={(open) => {
              if (!open) setQuickViewCatalogo(null)
            }}
            onAddValue={() => {
              setQuickViewCatalogo(null)
              openCreateItem()
            }}
          />

          {/* Help Modal */}
          <CatalogoHelpModal
            open={helpModalOpen}
            onOpenChange={setHelpModalOpen}
          />
        </MasterDetailLayout>
      </div>
    </div>
  )
}
