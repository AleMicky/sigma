import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react"

import { isApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

import { useDeleteCatalogo } from "../api/catalogo.mutations"
import { catalogoQueries } from "../api/catalogo.queries"
import type { Catalogo } from "../api/catalogo.service"
import { useDeleteCatalogoItem } from "../api/catalogo-item.mutations"
import { catalogoItemQueries } from "../api/catalogo-item.queries"
import type { CatalogoItem } from "../api/catalogo-item.service"
import { AuditInfo } from "../components/AuditInfo"
import { CatalogoFormSheet } from "../components/CatalogoFormSheet"
import { CatalogoItemFormSheet } from "../components/CatalogoItemFormSheet"

const LIST_PARAMS = {
  page: 0,
  size: 100,
  sortBy: "nombre",
  direction: "ASC" as const,
}

const ITEM_LIST_PARAMS = {
  page: 0,
  size: 100,
  sortBy: "orden",
  direction: "ASC" as const,
}

export function CatalogosPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [catalogoSheetOpen, setCatalogoSheetOpen] = useState(false)
  const [editingCatalogo, setEditingCatalogo] = useState<Catalogo | null>(null)
  const [itemSheetOpen, setItemSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)

  const catalogosQuery = useQuery(catalogoQueries.list(LIST_PARAMS))

  const catalogos = catalogosQuery.data?.content ?? []

  useEffect(() => {
    if (catalogos.length === 0) {
      setSelectedId(null)
      return
    }

    if (!selectedId || !catalogos.some((c) => c.id === selectedId)) {
      setSelectedId(catalogos[0]?.id ?? null)
    }
  }, [catalogos, selectedId])

  const selected =
    catalogos.find((catalogo) => catalogo.id === selectedId) ?? null

  function openCreateCatalogo() {
    setEditingCatalogo(null)
    setCatalogoSheetOpen(true)
  }

  function openEditCatalogo(catalogo: Catalogo) {
    setEditingCatalogo(catalogo)
    setCatalogoSheetOpen(true)
  }

  function openCreateItem() {
    setEditingItem(null)
    setItemSheetOpen(true)
  }

  function openEditItem(item: CatalogoItem) {
    setEditingItem(item)
    setItemSheetOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-4 md:px-8">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Catálogos
        </h1>
        <Button size="sm" type="button" onClick={openCreateCatalogo}>
          <Plus />
          Crear
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(240px,340px)_1fr]">
        <MasterPanel
          catalogos={catalogos}
          selectedId={selectedId}
          isLoading={catalogosQuery.isLoading}
          errorMessage={
            catalogosQuery.isError
              ? isApiError(catalogosQuery.error)
                ? catalogosQuery.error.message
                : "No se pudieron cargar los catálogos."
              : null
          }
          onSelect={setSelectedId}
          onCreate={openCreateCatalogo}
          onEdit={openEditCatalogo}
        />
        <DetailPanel
          catalogo={selected}
          onCreateItem={openCreateItem}
          onEditItem={openEditItem}
        />
      </div>

      <CatalogoFormSheet
        key={editingCatalogo?.id ?? "new-catalogo"}
        open={catalogoSheetOpen}
        onOpenChange={setCatalogoSheetOpen}
        catalogo={editingCatalogo}
        onSuccess={(saved) => setSelectedId(saved.id)}
      />

      {selected ? (
        <CatalogoItemFormSheet
          key={editingItem?.id ?? `new-item-${selected.id}`}
          open={itemSheetOpen}
          onOpenChange={setItemSheetOpen}
          catalogoId={selected.id}
          item={editingItem}
        />
      ) : null}
    </div>
  )
}

function MasterPanel({
  catalogos,
  selectedId,
  isLoading,
  errorMessage,
  onSelect,
  onCreate,
  onEdit,
}: {
  catalogos: Catalogo[]
  selectedId: string | null
  isLoading: boolean
  errorMessage: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (catalogo: Catalogo) => void
}) {
  const deleteMutation = useDeleteCatalogo()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 border-b p-4 md:border-r md:border-b-0">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border-b p-8 text-center md:border-r md:border-b-0">
        <p className="text-sm text-destructive">{errorMessage}</p>
      </div>
    )
  }

  if (catalogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border-b p-8 text-center md:border-r md:border-b-0">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
          <FolderOpen className="size-4 text-muted-foreground" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">No hay catálogos</p>
          <p className="max-w-56 text-xs text-muted-foreground">
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
    <div className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">
      <div className="border-b px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Maestros
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
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
                  <code className="w-fit rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {catalogo.codigo}
                  </code>
                </button>
                <div className="flex shrink-0 gap-0.5 py-2 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar catálogo"
                    onClick={() => onEdit(catalogo)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Eliminar catálogo"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Eliminar el catálogo "${catalogo.nombre}"?`,
                        )
                      ) {
                        void deleteMutation.mutateAsync(catalogo.id)
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DetailPanel({
  catalogo,
  onCreateItem,
  onEditItem,
}: {
  catalogo: Catalogo | null
  onCreateItem: () => void
  onEditItem: (item: CatalogoItem) => void
}) {
  const itemsQuery = useQuery({
    ...catalogoItemQueries.byCatalogo(
      catalogo?.id ?? "",
      ITEM_LIST_PARAMS,
    ),
  })
  const deleteMutation = useDeleteCatalogoItem()

  if (!catalogo) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">
          Selecciona un catálogo para ver sus valores.
        </p>
      </div>
    )
  }

  const items = itemsQuery.data?.content ?? []

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
        <div className="min-w-0 flex flex-1 flex-col gap-2">
          <div className="min-w-0 flex flex-col gap-0.5">
            <h2 className="truncate text-base font-semibold tracking-tight">
              {catalogo.nombre}
            </h2>
            <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {catalogo.codigo}
            </code>
          </div>
          <AuditInfo data={catalogo} />
        </div>
        <Button
          size="sm"
          type="button"
          className="shrink-0"
          onClick={onCreateItem}
        >
          <Plus />
          Agregar valor
        </Button>
      </div>

      {itemsQuery.isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : itemsQuery.isError ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-destructive">
            {isApiError(itemsQuery.error)
              ? itemsQuery.error.message
              : "No se pudieron cargar los valores."}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
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
        <ul className="min-h-0 flex-1 overflow-y-auto p-2 md:p-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50"
            >
              <div className="min-w-0 flex flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">
                  {item.nombre}
                </span>
                <code className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {item.valor}
                </code>
                <AuditInfo data={item} compact />
              </div>
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Editar valor"
                  onClick={() => onEditItem(item)}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Eliminar valor"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Eliminar el valor "${item.nombre}"?`,
                      )
                    ) {
                      void deleteMutation.mutateAsync(item.id)
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
