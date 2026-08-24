import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Plus } from "lucide-react"

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

import { prioridadQueries } from "../api/prioridad.queries"
import type { Prioridad } from "../api/prioridad.service"
import { PrioridadFormDialog } from "../components/PrioridadFormDialog"
import { PrioridadListView } from "../components/PrioridadListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function PrioridadesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Prioridad | null>(null)
  const search = usePaginatedSearch()

  const prioridadesQuery = useQuery(
    prioridadQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nivel",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const prioridades = prioridadesQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    prioridadesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(prioridad: Prioridad) {
    setEditing(prioridad)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Prioridades de Mantenimiento
            </h1>
            {prioridadesQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {prioridadesQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[prioridadesQuery]} />
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
            Configura los niveles de urgencia y priorización para las solicitudes y órdenes de trabajo (ej. Crítica, Alta, Media, Baja).
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton queries={[prioridadesQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nueva Prioridad
          </Button>
        </div>
      </header>

      {/* Toolbar / Search */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar prioridades de mantenimiento"
          className="w-full flex-1 min-w-0"
        />
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {prioridadesQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : prioridadesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(prioridadesQuery.error)}
            className="text-destructive"
          />
        ) : prioridades.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim()
                ? "Sin resultados para la búsqueda"
                : "No hay prioridades de mantenimiento"
            }
            description={
              search.search.trim()
                ? "Prueba modificando el texto de búsqueda o borrando los filtros."
                : "Comienza registrando la primera prioridad para categorizar tus solicitudes de mantenimiento."
            }
            action={
              search.search.trim() ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => search.setSearch("")}
                  className="rounded-xl"
                >
                  Limpiar Búsqueda
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="rounded-xl">
                  <Plus className="size-4" />
                  Crear Prioridad
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                prioridadesQuery.isFetching && "opacity-70",
              )}
            >
              <PrioridadListView
                prioridades={prioridades}
                onEdit={openEdit}
              />
            </div>

            {prioridadesQuery.data ? (
              <Pagination
                page={prioridadesQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <PrioridadFormDialog
        key={editing?.id ?? "new-prioridad"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prioridad={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
