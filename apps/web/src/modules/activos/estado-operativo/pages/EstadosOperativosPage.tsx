import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Plus } from "lucide-react"

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

import { estadoOperativoQueries } from "../api/estado-operativo.queries"
import type { EstadoOperativo } from "../api/estado-operativo.service"
import { EstadoOperativoFormDialog } from "../components/EstadoOperativoFormDialog"
import { EstadoOperativoListView } from "../components/EstadoOperativoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function EstadosOperativosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EstadoOperativo | null>(null)
  const search = usePaginatedSearch()

  const estadosQuery = useQuery(
    estadoOperativoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "codigo",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const estados = estadosQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    estadosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(estado: EstadoOperativo) {
    setEditing(estado)
    setDialogOpen(true)
  }

  function resetFilters() {
    search.setSearch("")
    search.setPage(0)
  }

  const hasActiveFilters = search.search.trim().length > 0

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Estados Operativos
            </h1>
            {estadosQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {estadosQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[estadosQuery]} />
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
            Catálogo global de estados operativos para controlar la disponibilidad, mantenimiento y operatividad de los activos.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton queries={[estadosQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo Estado
          </Button>
        </div>
      </header>

      {/* Toolbar con buscador */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar estados operativos"
          className="w-full flex-1 min-w-0"
        />
      </div>

      {/* Contenido principal */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {estadosQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : estadosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(estadosQuery.error)}
            className="text-destructive"
          />
        ) : estados.length === 0 ? (
          <EmptyState
            icon={<Activity className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para la búsqueda"
                : "No hay estados operativos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando el término de búsqueda."
                : "Comienza registrando estados operativos para asociarlos a los tipos de activo."
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
                  Limpiar Búsqueda
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                  Crear Estado Operativo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                estadosQuery.isFetching && "opacity-70",
              )}
            >
              <EstadoOperativoListView
                estados={estados}
                onEdit={openEdit}
              />
            </div>

            {estadosQuery.data ? (
              <Pagination
                page={estadosQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      <EstadoOperativoFormDialog
        key={editing?.id ?? "new-estado"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        estado={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
