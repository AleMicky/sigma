import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Award, Plus } from "lucide-react"

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

import { responsabilidadQueries } from "../api/responsabilidad.queries"
import type { Responsabilidad } from "../api/responsabilidad.service"
import { ResponsabilidadCard } from "../components/ResponsabilidadCard"
import { ResponsabilidadFormDialog } from "../components/ResponsabilidadFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function ResponsabilidadesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Responsabilidad | null>(null)
  const search = usePaginatedSearch()

  const responsabilidadesQuery = useQuery(
    responsabilidadQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const responsabilidades = responsabilidadesQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    responsabilidadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(responsabilidad: Responsabilidad) {
    setEditing(responsabilidad)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Responsabilidades
            </h1>
            <div className="flex items-center gap-1.5 md:hidden">
              <RefreshButton
                onRefresh={() => responsabilidadesQuery.refetch()}
                isRefreshing={responsabilidadesQuery.isFetching}
              />
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo de responsabilidades y roles asignables dentro de la organización.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            onRefresh={() => responsabilidadesQuery.refetch()}
            isRefreshing={responsabilidadesQuery.isFetching}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shrink-0"
          >
            <Plus />
            Crear
          </Button>
        </div>
      </header>

      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar responsabilidades"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {responsabilidadesQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-24 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : responsabilidadesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(responsabilidadesQuery.error)}
            className="text-destructive"
          />
        ) : responsabilidades.length === 0 ? (
          <EmptyState
            icon={<Award className="size-4 text-muted-foreground" />}
            title={
              search.search.trim() ? "Sin resultados" : "No hay responsabilidades"
            }
            description={
              search.search.trim()
                ? "Prueba con otro código o nombre."
                : "Crea una nueva responsabilidad organizacional."
            }
            action={
              search.search.trim() ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                responsabilidadesQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {responsabilidades.map((responsabilidad) => (
                  <ResponsabilidadCard
                    key={responsabilidad.id}
                    responsabilidad={responsabilidad}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {responsabilidadesQuery.data ? (
              <Pagination
                page={responsabilidadesQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

      <ResponsabilidadFormDialog
        key={editing?.id ?? "new-responsabilidad"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        responsabilidad={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
