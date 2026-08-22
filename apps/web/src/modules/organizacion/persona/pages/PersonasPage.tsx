import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Users } from "lucide-react"

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

import { personaQueries } from "../api/persona.queries"
import type { Persona } from "../api/persona.service"
import { PersonaCard } from "../components/PersonaCard"
import { PersonaFormDialog } from "../components/PersonaFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function PersonasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Persona | null>(null)
  const search = usePaginatedSearch()

  const personasQuery = useQuery(
    personaQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombres",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const personas = personasQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    personasQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(persona: Persona) {
    setEditing(persona)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Personas
            </h1>
            <div className="flex items-center gap-1.5 md:hidden">
              <RefreshButton
                onRefresh={() => personasQuery.refetch()}
                isRefreshing={personasQuery.isFetching}
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
            Catálogo de personas vinculadas a la institución.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton
            onRefresh={() => personasQuery.refetch()}
            isRefreshing={personasQuery.isFetching}
          />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="hidden shrink-0 self-start md:inline-flex"
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
          placeholder="Buscar por nombres, apellidos o documento…"
          aria-label="Buscar personas"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {personasQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-24 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : personasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(personasQuery.error)}
            className="text-destructive"
          />
        ) : personas.length === 0 ? (
          <EmptyState
            icon={<Users className="size-4 text-muted-foreground" />}
            title={
              search.search.trim() ? "Sin resultados" : "No hay personas"
            }
            description={
              search.search.trim()
                ? "Prueba con otros nombres o documento."
                : "Registra una nueva persona."
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
                personasQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {personas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {personasQuery.data ? (
              <Pagination
                page={personasQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

      <PersonaFormDialog
        key={editing?.id ?? "new-persona"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        persona={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
