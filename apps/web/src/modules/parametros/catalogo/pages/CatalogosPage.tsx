import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderOpen, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailListItem,
  DetailPanelHeader,
  DetailPanelShell,
  MasterDetailLayout,
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteCatalogo } from "../api/catalogo.mutations"
import { catalogoQueries } from "../api/catalogo.queries"
import type { Catalogo } from "../api/catalogo.service"
import { useDeleteCatalogoItem } from "../api/catalogo-item.mutations"
import { catalogoItemQueries } from "../api/catalogo-item.queries"
import type { CatalogoItem } from "../api/catalogo-item.service"
import { CatalogoFormDialog } from "../components/CatalogoFormDialog"
import { CatalogoItemFormDialog } from "../components/CatalogoItemFormDialog"

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
        <MasterPanel
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
        <DetailPanel
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

function MasterPanel({
  catalogos,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: {
  catalogos: Catalogo[]
  page?: PageResponse<Catalogo>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (catalogo: Catalogo) => void
  onPageChange: (page: number) => void
}) {
  const deleteMutation = useDeleteCatalogo()
  const [catalogoToDelete, setCatalogoToDelete] = useState<Catalogo | null>(
    null,
  )

  return (
    <MasterPanelShell
      label="Maestros"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar catálogos"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(catalogoToDelete)}
          onOpenChange={(open) => {
            if (!open) setCatalogoToDelete(null)
          }}
          title="Eliminar catálogo"
          description={
            catalogoToDelete
              ? `¿Seguro que deseas eliminar "${catalogoToDelete.nombre}"? También se eliminarán sus valores.`
              : "¿Seguro que deseas eliminar este catálogo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!catalogoToDelete) return
            await deleteMutation.mutateAsync(catalogoToDelete.id)
            setCatalogoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={catalogos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(catalogo) => catalogo.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay catálogos",
          description:
            "Crea un catálogo maestro, por ejemplo Tipo de documento.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(catalogo) => (
          <SelectableListItem
            active={catalogo.id === selectedId}
            onSelect={() => onSelect(catalogo.id)}
            title={catalogo.nombre}
            subtitle={
              <code className="w-fit max-w-full truncate rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {catalogo.codigo}
              </code>
            }
            actions={
              <RowActions
                editLabel="Editar catálogo"
                deleteLabel="Eliminar catálogo"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEdit(catalogo)}
                onDelete={() => setCatalogoToDelete(catalogo)}
              />
            }
          />
        )}
      </PaginatedList>
    </MasterPanelShell>
  )
}

function DetailPanel({
  catalogo,
  itemPage,
  search,
  searchQuery,
  hidePrimaryAction = false,
  onSearchChange,
  onPageChange,
  onCreateItem,
  onEditItem,
}: {
  catalogo: Catalogo | null
  itemPage: number
  search: string
  searchQuery: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onCreateItem: () => void
  onEditItem: (item: CatalogoItem) => void
}) {
  const itemsQuery = useQuery({
    ...catalogoItemQueries.byCatalogo(catalogo?.id ?? "", {
      page: itemPage,
      size: PAGE_SIZE,
      sortBy: "orden",
      direction: "ASC",
      ...(searchQuery.trim() ? { q: searchQuery.trim() } : {}),
    }),
  })
  const deleteMutation = useDeleteCatalogoItem()
  const [itemToDelete, setItemToDelete] = useState<CatalogoItem | null>(null)

  useClampPage(itemPage, onPageChange, itemsQuery.data?.totalPages)

  const items = itemsQuery.data?.content ?? []

  return (
    <DetailPanelShell
      hasSelection={Boolean(catalogo)}
      emptySelectionMessage="Selecciona un catálogo para ver sus valores."
      header={
        catalogo ? (
          <DetailPanelHeader
            title={catalogo.nombre}
            subtitle={
              <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {catalogo.codigo}
              </code>
            }
            meta={<AuditInfo data={catalogo} />}
            action={
              !hidePrimaryAction ? (
                <Button
                  size="sm"
                  type="button"
                  className="w-full shrink-0 sm:w-auto"
                  onClick={onCreateItem}
                >
                  <Plus />
                  Agregar valor
                </Button>
              ) : null
            }
            search={{
              value: search,
              onChange: onSearchChange,
              placeholder: "Buscar por valor o nombre…",
              "aria-label": "Buscar valores del catálogo",
            }}
          />
        ) : null
      }
      footer={
        <ConfirmDeleteDialog
          open={Boolean(itemToDelete)}
          onOpenChange={(open) => {
            if (!open) setItemToDelete(null)
          }}
          title="Eliminar valor"
          description={
            itemToDelete
              ? `¿Seguro que deseas eliminar "${itemToDelete.nombre}"?`
              : "¿Seguro que deseas eliminar este valor?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!itemToDelete) return
            await deleteMutation.mutateAsync(itemToDelete.id)
            setItemToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={items}
        page={itemsQuery.data}
        isLoading={itemsQuery.isLoading}
        isFetching={itemsQuery.isFetching}
        errorMessage={
          itemsQuery.isError ? getErrorMessage(itemsQuery.error) : null
        }
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(item) => item.id}
        skeletonRowClassName="h-10"
        listClassName="sm:p-3"
        empty={{
          title: "Sin valores",
          description: "Agrega ítems hijos, por ejemplo CI o Pasaporte.",
          actionLabel: "Agregar valor",
          onAction: onCreateItem,
          searchDescription: "Prueba con otro valor o nombre.",
        }}
      >
        {(item) => (
          <DetailListItem
            title={item.nombre}
            subtitle={
              <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {item.valor}
              </code>
            }
            meta={<AuditInfo data={item} compact />}
            actions={
              <RowActions
                editLabel="Editar valor"
                deleteLabel="Eliminar valor"
                deleteDisabled={deleteMutation.isPending}
                onEdit={() => onEditItem(item)}
                onDelete={() => setItemToDelete(item)}
              />
            }
          />
        )}
      </PaginatedList>
    </DetailPanelShell>
  )
}
