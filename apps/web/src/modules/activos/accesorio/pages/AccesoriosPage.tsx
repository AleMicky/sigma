import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, Paperclip, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
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

import { accesorioQueries } from "../api/accesorio.queries"
import type { Accesorio } from "../api/accesorio.service"
import { AccesorioFormDialog } from "../components/AccesorioFormDialog"
import { AccesorioListView } from "../components/AccesorioListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function AccesoriosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Accesorio | null>(null)
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("")
  const search = usePaginatedSearch({ resetKey: selectedCategoriaId })

  const categoriasQuery = useQuery(
    categoriaQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const categorias = useMemo(
    () => categoriasQuery.data?.content ?? [],
    [categoriasQuery.data?.content],
  )

  const selectedCategoria = useMemo(
    () => categorias.find((c) => c.id === selectedCategoriaId),
    [categorias, selectedCategoriaId],
  )

  const isFilteredByCategoria = Boolean(selectedCategoriaId)

  const accesoriosQuery = useQuery(
    isFilteredByCategoria
      ? accesorioQueries.byCategoria(selectedCategoriaId, {
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        })
      : accesorioQueries.list({
          page: search.page,
          size: PAGE_SIZE,
          sortBy: "nombre",
          direction: "ASC",
          ...(search.query ? { q: search.query } : {}),
        }),
  )

  const accesorios = accesoriosQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    accesoriosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(accesorio: Accesorio) {
    setEditing(accesorio)
    setDialogOpen(true)
  }

  function resetFilters() {
    search.setSearch("")
    setSelectedCategoriaId("")
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 || Boolean(selectedCategoriaId)

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Accesorios de Activos
            </h1>
            {accesoriosQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {accesoriosQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton
                queries={[accesoriosQuery, categoriasQuery]}
              />
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Parametriza y gestiona los accesorios y equipamiento secundario asociados por categoría.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            queries={[accesoriosQuery, categoriasQuery]}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo Accesorio
          </Button>
        </div>
      </header>

      {/* Toolbar con buscador y filtro */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar accesorios"
          className="w-full flex-1 min-w-0"
        />

        <div className="w-full sm:w-72 shrink-0">
          <Select
            value={selectedCategoriaId || "ALL"}
            onValueChange={(val) => {
              setSelectedCategoriaId(val === "ALL" ? "" : (val ?? ""))
              search.setPage(0)
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-card border-border/80 text-xs shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-primary shrink-0" />
                <SelectValue placeholder="Todas las categorías">
                  {selectedCategoria
                    ? `${selectedCategoria.nombre} (${selectedCategoria.codigo})`
                    : "Todas las categorías"}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre} ({categoria.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {accesoriosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : accesoriosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(accesoriosQuery.error)}
            className="text-destructive"
          />
        ) : accesorios.length === 0 ? (
          <EmptyState
            icon={<Paperclip className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para el filtro aplicado"
                : "No hay accesorios"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando la categoría seleccionada o borrando el término de búsqueda."
                : "Comienza registrando el primer accesorio para los activos del sistema."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  Limpiar Filtros
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                  Crear Accesorio
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                accesoriosQuery.isFetching && "opacity-70",
              )}
            >
              <AccesorioListView
                accesorios={accesorios}
                onEdit={openEdit}
              />
            </div>

            {accesoriosQuery.data ? (
              <Pagination
                page={accesoriosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      <AccesorioFormDialog
        key={editing?.id ?? `new-accesorio-${selectedCategoriaId}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        accesorio={editing}
        categoriaId={selectedCategoriaId || undefined}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
