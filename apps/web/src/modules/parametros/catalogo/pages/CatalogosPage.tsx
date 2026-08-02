import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { MasterDetailLayout } from "@/shared/components/master-detail"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { catalogoQueries } from "../api/catalogo.queries"
import type { Catalogo } from "../api/catalogo.service"
import type { CatalogoItem } from "../api/catalogo-item.service"
import { CatalogoDetailPanel } from "../components/CatalogoDetailPanel"
import { CatalogoFormDialog } from "../components/CatalogoFormDialog"
import { CatalogoItemFormDialog } from "../components/CatalogoItemFormDialog"
import { CatalogoMasterPanel } from "../components/CatalogoMasterPanel"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CatalogosPage() {
  const [catalogoDialogOpen, setCatalogoDialogOpen] = useState(false)
  const [editingCatalogo, setEditingCatalogo] = useState<Catalogo | null>(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)

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

  useClampPage(
    catalogoSearch.page,
    catalogoSearch.setPage,
    catalogosQuery.data?.totalPages,
  )

  const masterDetail = useMasterDetail(catalogos)
  const itemSearch = usePaginatedSearch({
    resetKey: masterDetail.selectedId,
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
    <MasterDetailLayout
      title={
        masterDetail.isMobile &&
        masterDetail.mobileShowDetail &&
        masterDetail.selected
          ? masterDetail.selected.nombre
          : "Catálogos"
      }
      showMaster={masterDetail.showMaster}
      showDetail={masterDetail.showDetail}
      showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
      backLabel="Volver a catálogos"
      onBack={masterDetail.backToMaster}
      headerAction={
        masterDetail.showMaster ? (
          <Button
            size="sm"
            type="button"
            onClick={openCreateCatalogo}
            className="shrink-0"
          >
            <Plus />
            Crear
          </Button>
        ) : (
          <Button
            size="sm"
            type="button"
            onClick={openCreateItem}
            className="shrink-0"
          >
            <Plus />
            Agregar
          </Button>
        )
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
    </MasterDetailLayout>
  )
}
