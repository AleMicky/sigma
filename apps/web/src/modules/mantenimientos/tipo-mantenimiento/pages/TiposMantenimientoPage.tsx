import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Wrench } from "lucide-react"

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

import { tipoMantenimientoQueries } from "../api/tipo-mantenimiento.queries"
import type { TipoMantenimiento } from "../api/tipo-mantenimiento.service"
import { TipoMantenimientoFormDialog } from "../components/TipoMantenimientoFormDialog"
import { TipoMantenimientoListView } from "../components/TipoMantenimientoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposMantenimientoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoMantenimiento | null>(null)
  const search = usePaginatedSearch()

  const tiposMantenimientoQuery = useQuery(
    tipoMantenimientoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tiposMantenimiento = tiposMantenimientoQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    tiposMantenimientoQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipo: TipoMantenimiento) {
    setEditing(tipo)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Tipos de Mantenimiento
            </h1>
            {tiposMantenimientoQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {tiposMantenimientoQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[tiposMantenimientoQuery]} />
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
            Clasifica los mantenimientos según su naturaleza y modalidad de ejecución (ej. Preventivo, Correctivo, Predictivo, Calibración).
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton queries={[tiposMantenimientoQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo Tipo
          </Button>
        </div>
      </header>

      {/* Toolbar / Search */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar tipos de mantenimiento"
          className="w-full flex-1 min-w-0"
        />
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tiposMantenimientoQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : tiposMantenimientoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposMantenimientoQuery.error)}
            className="text-destructive"
          />
        ) : tiposMantenimiento.length === 0 ? (
          <EmptyState
            icon={<Wrench className="size-8 text-muted-foreground/60" />}
            title={
              search.search.trim()
                ? "Sin resultados para la búsqueda"
                : "No hay tipos de mantenimiento"
            }
            description={
              search.search.trim()
                ? "Prueba modificando el texto de búsqueda o borrando los filtros."
                : "Comienza registrando el primer tipo de mantenimiento (ej. Preventivo, Correctivo)."
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
                  Crear Tipo
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pr-1",
                tiposMantenimientoQuery.isFetching && "opacity-70",
              )}
            >
              <TipoMantenimientoListView
                tiposMantenimiento={tiposMantenimiento}
                onEdit={openEdit}
              />
            </div>

            {tiposMantenimientoQuery.data ? (
              <Pagination
                page={tiposMantenimientoQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
      <TipoMantenimientoFormDialog
        key={editing?.id ?? "new-tipo-mantenimiento"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoMantenimiento={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
