import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Tags } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { tipoActivoQueries } from "../api/tipo-activo.queries"
import type { TipoActivo } from "../api/tipo-activo.service"
import { TipoActivoCard } from "../components/TipoActivoCard"
import { TipoActivoFormDialog } from "../components/TipoActivoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposActivoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoActivo | null>(null)
  const search = usePaginatedSearch()

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tipos = tiposQuery.data?.content ?? []

  useClampPage(search.page, search.setPage, tiposQuery.data?.totalPages)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoActivo: TipoActivo) {
    setEditing(tipoActivo)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Tipos de activo
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="shrink-0 md:hidden"
            >
              <Plus />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Catálogo de tipos para clasificar activos (ejemplo: vehículo,
            equipo…).
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="hidden shrink-0 self-start md:inline-flex"
        >
          <Plus />
          Crear
        </Button>
      </header>

      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por nombre…"
          aria-label="Buscar tipos de activo"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tiposQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-24 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : tiposQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposQuery.error)}
            className="text-destructive"
          />
        ) : tipos.length === 0 ? (
          <EmptyState
            icon={<Tags className="size-4 text-muted-foreground" />}
            title={
              search.search.trim()
                ? "Sin resultados"
                : "No hay tipos de activo"
            }
            description={
              search.search.trim()
                ? "Prueba con otro nombre."
                : "Crea un tipo, por ejemplo Vehículo o Equipo."
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
                tiposQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {tipos.map((tipoActivo) => (
                  <TipoActivoCard
                    key={tipoActivo.id}
                    tipoActivo={tipoActivo}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {tiposQuery.data ? (
              <Pagination
                page={tiposQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

      <TipoActivoFormDialog
        key={editing?.id ?? "new-tipo-activo"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoActivo={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
