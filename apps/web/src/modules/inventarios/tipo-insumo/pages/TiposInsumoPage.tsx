import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Tags } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { tipoInsumoQueries } from "../api/tipo-insumo.queries"
import type { TipoInsumo } from "../api/tipo-insumo.service"
import { TipoInsumoCard } from "../components/TipoInsumoCard"
import { TipoInsumoFormDialog } from "../components/TipoInsumoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposInsumoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoInsumo | null>(null)
  const search = usePaginatedSearch()

  const tiposQuery = useQuery(
    tipoInsumoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tipos = tiposQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    tiposQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoInsumo: TipoInsumo) {
    setEditing(tipoInsumo)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Tipos de Insumo
            </h1>
            <div className="flex items-center gap-1.5 md:hidden">
              <RefreshButton
                onRefresh={() => tiposQuery.refetch()}
                isRefreshing={tiposQuery.isFetching}
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
            Administra los tipos de insumo y sus atributos dinámicos configurables.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            onRefresh={() => tiposQuery.refetch()}
            isRefreshing={tiposQuery.isFetching}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shrink-0"
          >
            <Plus className="size-4" />
            Nuevo Tipo de Insumo
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar tipos de insumo"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tiposQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-28 rounded-xl"
            className="grid grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3"
          />
        ) : tiposQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposQuery.error)}
            className="text-destructive"
          />
        ) : tipos.length === 0 ? (
          <EmptyState
            icon={<Tags className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim()
                ? "Sin resultados para la búsqueda"
                : "No hay tipos de insumo"
            }
            description={
              search.search.trim()
                ? "Prueba con otros términos de búsqueda."
                : "Comienza creando el primer tipo de insumo para personalizar tu inventario."
            }
            action={
              search.search.trim() ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus className="size-4" />
                  Crear Tipo de Insumo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                tiposQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tipos.map((tipo) => (
                  <TipoInsumoCard
                    key={tipo.id}
                    tipoInsumo={tipo}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {tiposQuery.data ? (
              <Pagination
                page={tiposQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      <TipoInsumoFormDialog
        key={editing?.id ?? "new-tipo"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoInsumo={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
