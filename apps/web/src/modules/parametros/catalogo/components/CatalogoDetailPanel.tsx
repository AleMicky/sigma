import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, Copy, Layers, ListFilter, Plus } from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "@/shared/components/ui/badge"
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
  const [copiedValueId, setCopiedValueId] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  useClampPage(itemPage, onPageChange, itemsQuery.data?.totalPages)

  const items = itemsQuery.data?.content ?? []
  const totalElements = itemsQuery.data?.totalElements ?? items.length

  function copyItemValue(item: CatalogoItem) {
    navigator.clipboard.writeText(item.valor)
    setCopiedValueId(item.id)
    toast.success(`Valor "${item.valor}" copiado al portapapeles`)
    setTimeout(() => setCopiedValueId(null), 2000)
  }

  function copyCatalogoCode() {
    if (!catalogo) return
    navigator.clipboard.writeText(catalogo.codigo)
    setCopiedCode(true)
    toast.success(`Código de catálogo "${catalogo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(catalogo)}
      emptySelectionMessage="Selecciona un catálogo maestro de la lista para gestionar sus valores."
      header={
        catalogo ? (
          <DetailPanelHeader
            title={
              <div className="flex items-center gap-2">
                <span className="truncate">{catalogo.nombre}</span>
                <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
                  <Layers className="size-3 text-muted-foreground" />
                  {totalElements} {totalElements === 1 ? "valor" : "valores"}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex items-center gap-2 pt-0.5">
                <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {catalogo.codigo}
                </code>
                <button
                  type="button"
                  onClick={copyCatalogoCode}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Copiar código del catálogo"
                >
                  {copiedCode ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-500">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
              </div>
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
        skeletonRowClassName="h-12"
        listClassName="sm:p-3 space-y-1.5"
        empty={{
          icon: <ListFilter className="size-5 text-muted-foreground" />,
          title: "Sin valores configurados",
          description: "Agrega ítems hijos para este catálogo maestro.",
          actionLabel: "Agregar valor",
          onAction: onCreateItem,
          searchDescription: "Prueba con otro valor o nombre de búsqueda.",
        }}
      >
        {(item) => {
          const isCopied = copiedValueId === item.id

          return (
            <DetailListItem
              leading={
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary ring-1 ring-primary/20"
                  title={`Orden #${item.orden}`}
                >
                  #{item.orden}
                </div>
              }
              title={<span className="font-medium text-foreground">{item.nombre}</span>}
              subtitle={
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="w-fit max-w-full truncate rounded bg-muted/80 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                    {item.valor}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyItemValue(item)}
                    className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                    title="Copiar valor"
                  >
                    {isCopied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
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
          )
        }}
      </PaginatedList>
    </DetailPanelShell>
  )
}
