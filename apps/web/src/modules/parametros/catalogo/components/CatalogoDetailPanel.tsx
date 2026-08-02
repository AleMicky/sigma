import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  DetailListItem,
  DetailPanelHeader,
  DetailPanelShell,
  PaginatedList,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import { useClampPage } from "@/shared/hooks/use-paginated-search"

import type { Catalogo } from "../api/catalogo.service"
import { useDeleteCatalogoItem } from "../api/catalogo-item.mutations"
import { catalogoItemQueries } from "../api/catalogo-item.queries"
import type { CatalogoItem } from "../api/catalogo-item.service"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type CatalogoDetailPanelProps = {
  catalogo: Catalogo | null
  itemPage: number
  search: string
  searchQuery: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onCreateItem: () => void
  onEditItem: (item: CatalogoItem) => void
}

export function CatalogoDetailPanel({
  catalogo,
  itemPage,
  search,
  searchQuery,
  hidePrimaryAction = false,
  onSearchChange,
  onPageChange,
  onCreateItem,
  onEditItem,
}: CatalogoDetailPanelProps) {
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
