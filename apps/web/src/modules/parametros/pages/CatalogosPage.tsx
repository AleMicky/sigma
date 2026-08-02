import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react"

import { appConfig } from "@/app/config"
import { isApiError } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { cn } from "@/shared/lib/utils"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteCatalogo } from "../api/catalogo.mutations"
import { catalogoQueries } from "../api/catalogo.queries"
import type { Catalogo } from "../api/catalogo.service"
import { useDeleteCatalogoItem } from "../api/catalogo-item.mutations"
import { catalogoItemQueries } from "../api/catalogo-item.queries"
import type { CatalogoItem } from "../api/catalogo-item.service"
import { AuditInfo } from "../components/AuditInfo"
import { CatalogoFormDialog } from "../components/CatalogoFormDialog"
import { CatalogoItemFormDialog } from "../components/CatalogoItemFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CatalogosPage() {
  const isMobile = useIsMobile()
  const [mobileShowDetail, setMobileShowDetail] = useState(false)
  const [catalogoPage, setCatalogoPage] = useState(0)
  const [itemPage, setItemPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [catalogoDialogOpen, setCatalogoDialogOpen] = useState(false)
  const [editingCatalogo, setEditingCatalogo] = useState<Catalogo | null>(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)

  const catalogosQuery = useQuery(
    catalogoQueries.list({
      page: catalogoPage,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const catalogos = catalogosQuery.data?.content ?? []

  useEffect(() => {
    if (catalogos.length === 0) {
      setSelectedId(null)
      setMobileShowDetail(false)
      return
    }

    if (!selectedId || !catalogos.some((c) => c.id === selectedId)) {
      setSelectedId(catalogos[0]?.id ?? null)
    }
  }, [catalogos, selectedId])

  useEffect(() => {
    setItemPage(0)
  }, [selectedId])

  useEffect(() => {
    const totalPages = catalogosQuery.data?.totalPages ?? 0
    if (totalPages > 0 && catalogoPage > totalPages - 1) {
      setCatalogoPage(totalPages - 1)
    }
  }, [catalogoPage, catalogosQuery.data?.totalPages])

  useEffect(() => {
    if (!isMobile) {
      setMobileShowDetail(false)
    }
  }, [isMobile])

  const selected =
    catalogos.find((catalogo) => catalogo.id === selectedId) ?? null

  function handleSelectCatalogo(id: string) {
    setSelectedId(id)
    if (isMobile) {
      setMobileShowDetail(true)
    }
  }

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

  const showMaster = !isMobile || !mobileShowDetail
  const showDetail = !isMobile || mobileShowDetail

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {isMobile && mobileShowDetail ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Volver a catálogos"
              onClick={() => setMobileShowDetail(false)}
            >
              <ArrowLeft />
            </Button>
          ) : null}
          <h1 className="truncate font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {isMobile && mobileShowDetail && selected
              ? selected.nombre
              : "Catálogos"}
          </h1>
        </div>
        {showMaster ? (
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
        )}
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 overflow-hidden",
          "md:grid-cols-[minmax(220px,32%)_1fr] lg:grid-cols-[minmax(260px,340px)_1fr]",
        )}
      >
        <div
          className={cn(
            "min-h-0 min-w-0",
            showMaster ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <MasterPanel
            catalogos={catalogos}
            page={catalogosQuery.data}
            selectedId={selectedId}
            isLoading={catalogosQuery.isLoading}
            errorMessage={
              catalogosQuery.isError
                ? isApiError(catalogosQuery.error)
                  ? catalogosQuery.error.message
                  : "No se pudieron cargar los catálogos."
                : null
            }
            onSelect={handleSelectCatalogo}
            onCreate={openCreateCatalogo}
            onEdit={openEditCatalogo}
            onPageChange={setCatalogoPage}
          />
        </div>

        <div
          className={cn(
            "min-h-0 min-w-0",
            showDetail ? "flex" : "hidden",
            "md:flex",
          )}
        >
          <DetailPanel
            catalogo={selected}
            itemPage={itemPage}
            hidePrimaryAction={isMobile && mobileShowDetail}
            onPageChange={setItemPage}
            onCreateItem={openCreateItem}
            onEditItem={openEditItem}
          />
        </div>
      </div>

      <CatalogoFormDialog
        key={editingCatalogo?.id ?? "new-catalogo"}
        open={catalogoDialogOpen}
        onOpenChange={setCatalogoDialogOpen}
        catalogo={editingCatalogo}
        onSuccess={(saved) => {
          setSelectedId(saved.id)
          setCatalogoPage(0)
          if (isMobile) {
            setMobileShowDetail(true)
          }
        }}
      />

      {selected ? (
        <CatalogoItemFormDialog
          key={editingItem?.id ?? `new-item-${selected.id}`}
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          catalogoId={selected.id}
          item={editingItem}
          onSuccess={() => {
            if (!editingItem) {
              setItemPage(0)
            }
          }}
        />
      ) : null}
    </div>
  )
}

function MasterPanel({
  catalogos,
  page,
  selectedId,
  isLoading,
  errorMessage,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: {
  catalogos: Catalogo[]
  page?: PageResponse<Catalogo>
  selectedId: string | null
  isLoading: boolean
  errorMessage: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (catalogo: Catalogo) => void
  onPageChange: (page: number) => void
}) {
  const deleteMutation = useDeleteCatalogo()
  const [catalogoToDelete, setCatalogoToDelete] = useState<Catalogo | null>(
    null,
  )

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-2 border-b p-4 md:border-r md:border-b-0">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 border-b p-6 text-center sm:p-8 md:border-r md:border-b-0">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    )
  }

  if (catalogos.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 border-b p-6 text-center sm:p-8 md:border-r md:border-b-0">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
          <FolderOpen className="size-4 text-muted-foreground" />
        </span>
        <div className="flex flex-col gap-1 px-2">
          <p className="text-sm font-medium">No hay catálogos</p>
          <p className="mx-auto max-w-56 text-xs text-muted-foreground">
            Crea un catálogo maestro, por ejemplo Tipo de documento.
          </p>
        </div>
        <Button size="sm" type="button" onClick={onCreate}>
          <Plus />
          Crear
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full min-h-0 flex-col border-b md:border-r md:border-b-0">
      <div className="hidden border-b px-4 py-3 md:block">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Maestros
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {catalogos.map((catalogo) => {
          const isActive = catalogo.id === selectedId

          return (
            <li key={catalogo.id}>
              <div
                className={cn(
                  "group flex items-start gap-1 rounded-lg transition-colors",
                  isActive ? "bg-muted text-foreground" : "hover:bg-muted/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(catalogo.id)}
                  className="min-w-0 flex-1 flex flex-col gap-0.5 px-3 py-2.5 text-left"
                >
                  <span className="truncate text-sm font-medium">
                    {catalogo.nombre}
                  </span>
                  <code className="w-fit max-w-full truncate rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {catalogo.codigo}
                  </code>
                </button>
                <div className="flex shrink-0 gap-0.5 py-2 pr-2 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <Button
                    type="button"
                    variant="default"
                    size="icon-sm"
                    aria-label="Editar catálogo"
                    onClick={() => onEdit(catalogo)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Eliminar catálogo"
                    disabled={deleteMutation.isPending}
                    onClick={() => setCatalogoToDelete(catalogo)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {page ? (
        <Pagination page={page} onPageChange={onPageChange} />
      ) : null}

      <ConfirmDeleteDialog
        open={Boolean(catalogoToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCatalogoToDelete(null)
          }
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
    </div>
  )
}

function DetailPanel({
  catalogo,
  itemPage,
  hidePrimaryAction = false,
  onPageChange,
  onCreateItem,
  onEditItem,
}: {
  catalogo: Catalogo | null
  itemPage: number
  hidePrimaryAction?: boolean
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
    }),
  })
  const deleteMutation = useDeleteCatalogoItem()
  const [itemToDelete, setItemToDelete] = useState<CatalogoItem | null>(null)

  useEffect(() => {
    const totalPages = itemsQuery.data?.totalPages ?? 0
    if (totalPages > 0 && itemPage > totalPages - 1) {
      onPageChange(totalPages - 1)
    }
  }, [itemPage, itemsQuery.data?.totalPages, onPageChange])

  if (!catalogo) {
    return (
      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-8">
        <p className="text-center text-sm text-muted-foreground">
          Selecciona un catálogo para ver sus valores.
        </p>
      </div>
    )
  }

  const items = itemsQuery.data?.content ?? []

  return (
    <div className="flex w-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-6 sm:py-4">
        <div className="min-w-0 flex flex-1 flex-col gap-2">
          <div className="min-w-0 flex flex-col gap-0.5">
            <h2 className="hidden truncate text-base font-semibold tracking-tight md:block">
              {catalogo.nombre}
            </h2>
            <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {catalogo.codigo}
            </code>
          </div>
          <AuditInfo data={catalogo} />
        </div>
        {!hidePrimaryAction ? (
          <Button
            size="sm"
            type="button"
            className="w-full shrink-0 sm:w-auto"
            onClick={onCreateItem}
          >
            <Plus />
            Agregar valor
          </Button>
        ) : null}
      </div>

      {itemsQuery.isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : itemsQuery.isError ? (
        <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
          <p className="text-center text-sm text-destructive">
            {isApiError(itemsQuery.error)
              ? itemsQuery.error.message
              : "No se pudieron cargar los valores."}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center sm:p-8">
          <p className="text-sm font-medium">Sin valores</p>
          <p className="max-w-64 text-xs text-muted-foreground">
            Agrega ítems hijos, por ejemplo CI o Pasaporte.
          </p>
          <Button size="sm" type="button" onClick={onCreateItem}>
            <Plus />
            Agregar valor
          </Button>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-start justify-between gap-2 rounded-lg px-2 py-2.5 hover:bg-muted/50 sm:items-center sm:gap-3 sm:px-3"
              >
                <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {item.nombre}
                  </span>
                  <code className="w-fit max-w-full truncate rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {item.valor}
                  </code>
                  <AuditInfo data={item} compact />
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <Button
                    type="button"
                    variant="default"
                    size="icon-sm"
                    aria-label="Editar valor"
                    onClick={() => onEditItem(item)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Eliminar valor"
                    disabled={deleteMutation.isPending}
                    onClick={() => setItemToDelete(item)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {itemsQuery.data ? (
            <Pagination
              page={itemsQuery.data}
              onPageChange={onPageChange}
            />
          ) : null}

          <ConfirmDeleteDialog
            open={Boolean(itemToDelete)}
            onOpenChange={(open) => {
              if (!open) {
                setItemToDelete(null)
              }
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
        </>
      )}
    </div>
  )
}
