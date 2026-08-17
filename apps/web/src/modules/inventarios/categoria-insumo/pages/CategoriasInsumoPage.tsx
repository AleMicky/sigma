import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { tipoInsumoQueries } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { categoriaInsumoQueries } from "../api/categoria-insumo.queries"
import type { CategoriaInsumo } from "../api/categoria-insumo.service"
import { CategoriaInsumoCard } from "../components/CategoriaInsumoCard"
import { CategoriaInsumoFormDialog } from "../components/CategoriaInsumoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CategoriasInsumoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoriaInsumo | null>(null)
  const [selectedTipoInsumoId, setSelectedTipoInsumoId] = useState<string>("")
  const search = usePaginatedSearch()

  const tiposInsumoQuery = useQuery(
    tipoInsumoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposInsumo = tiposInsumoQuery.data?.content ?? []

  const tiposInsumoMap = useMemo(() => {
    const map = new Map<string, { nombre: string; codigo: string }>()
    tiposInsumo.forEach((ti) => {
      map.set(ti.id, { nombre: ti.nombre, codigo: ti.codigo })
    })
    return map
  }, [tiposInsumo])

  const selectedTipo = useMemo(
    () => tiposInsumo.find((t) => t.id === selectedTipoInsumoId),
    [tiposInsumo, selectedTipoInsumoId],
  )

  const categoriasQuery = useQuery(
    categoriaInsumoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(selectedTipoInsumoId ? { tipoInsumoId: selectedTipoInsumoId } : {}),
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const categorias = categoriasQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    categoriasQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(categoria: CategoriaInsumo) {
    setEditing(categoria)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Categorías de Insumo
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="shrink-0 md:hidden"
            >
              <Plus className="size-4" />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Clasifica los insumos en grupos funcionales por tipo de insumo (ej. Lubricantes, Repuestos, Químicos).
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="hidden shrink-0 self-start md:inline-flex"
        >
          <Plus className="size-4" />
          Nueva Categoría
        </Button>
      </header>

      <div className="flex shrink-0 flex-col gap-3 py-3 sm:flex-row sm:items-center">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar categorías de insumo"
          className="w-full flex-1 min-w-0"
        />

        <div className="w-full sm:w-64 shrink-0">
          <Select
            value={selectedTipoInsumoId || "ALL"}
            onValueChange={(val) => {
              setSelectedTipoInsumoId(val === "ALL" ? "" : (val ?? ""))
              search.setPage(0)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los tipos de insumo">
                {selectedTipo
                  ? `${selectedTipo.nombre} (${selectedTipo.codigo})`
                  : "Todos los tipos de insumo"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos de insumo</SelectItem>
              {tiposInsumo.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre} ({tipo.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {categoriasQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-24 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : categoriasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(categoriasQuery.error)}
            className="text-destructive"
          />
        ) : categorias.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim() || selectedTipoInsumoId
                ? "Sin resultados para el filtro aplicado"
                : "No hay categorías de insumo"
            }
            description={
              search.search.trim() || selectedTipoInsumoId
                ? "Prueba cambiando el tipo de insumo o borrando la búsqueda."
                : "Comienza registrando la primera categoría de insumo para tu inventario."
            }
            action={
              search.search.trim() || selectedTipoInsumoId ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    search.setSearch("")
                    setSelectedTipoInsumoId("")
                  }}
                >
                  Limpiar Filtros
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus className="size-4" />
                  Crear Categoría
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pr-1",
                categoriasQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {categorias.map((categoria) => (
                  <CategoriaInsumoCard
                    key={categoria.id}
                    categoria={categoria}
                    tipoInsumoNombre={
                      categoria.tipoInsumo?.nombre ??
                      (categoria.tipoInsumoId ? tiposInsumoMap.get(categoria.tipoInsumoId)?.nombre : undefined)
                    }
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {categoriasQuery.data ? (
              <Pagination
                page={categoriasQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      <CategoriaInsumoFormDialog
        key={editing?.id ?? `new-categoria-${selectedTipoInsumoId}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoria={editing}
        defaultTipoInsumoId={selectedTipoInsumoId}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
