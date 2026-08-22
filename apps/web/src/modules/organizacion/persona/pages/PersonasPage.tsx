import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FilterX,
  HelpCircle,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { useDeletePersona } from "../api/persona.mutations"
import { personaQueries } from "../api/persona.queries"
import type { Persona } from "../api/persona.service"
import { PersonaFormDialog } from "../components/PersonaFormDialog"
import { PersonaHelpModal } from "../components/PersonaHelpModal"
import { PersonaListItem } from "../components/PersonaListItem"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function PersonasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Persona | null>(null)
  const [deleting, setDeleting] = useState<Persona | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeletePersona()

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
  const totalElements = personasQuery.data?.totalElements ?? 0

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

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by toast in mutation
    }
  }

  const hasActiveFilters = Boolean(search.search.trim())

  function resetFilters() {
    search.setSearch("")
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Personas
              </h1>
              {personasQuery.data ? (
                <Badge variant="secondary" className="font-mono text-xs px-2 h-5">
                  {totalElements}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 md:hidden">
              <RefreshButton
                size="sm"
                queries={[personasQuery]}
              />
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setHelpModalOpen(true)}
              >
                <HelpCircle className="size-4 text-primary" />
                <span className="sr-only sm:not-sr-only">Guía</span>
              </Button>
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
            Catálogo maestro de personas naturales registradas en la institución.
          </p>
        </div>

        <div className="hidden shrink-0 self-start md:flex md:items-center md:gap-2">
          <RefreshButton
            size="sm"
            queries={[personasQuery]}
          />

          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="gap-1.5 border-border/80 hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>Guía de Personas</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span>Crear Persona</span>
          </Button>
        </div>
      </header>

      {/* Buscador y chips */}
      <div className="flex shrink-0 flex-col gap-2.5 py-3">
        <div className="flex shrink-0">
          <SearchField
            value={search.search}
            onChange={search.setSearch}
            placeholder="Buscar por documento, nombre o apellido…"
            aria-label="Buscar personas"
            className="w-full min-w-0"
          />
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
            <span className="text-muted-foreground mr-1 text-[11px]">Filtro activo:</span>

            <Badge
              variant="secondary"
              className="gap-1 px-2 py-0.5 h-6 text-xs bg-muted/80 hover:bg-muted"
            >
              <Search className="size-3 text-muted-foreground" />
              <span className="max-w-[200px] truncate">"{search.search}"</span>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer"
              >
                <X className="size-3" />
                <span className="sr-only">Quitar búsqueda</span>
              </button>
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
            >
              <FilterX className="size-3" />
              <span>Limpiar búsqueda</span>
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content Section - Compact List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {personasQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-14 rounded-xl"
            className="flex flex-col gap-2"
          />
        ) : personasQuery.isError ? (
          <EmptyState
            title={getErrorMessage(personasQuery.error)}
            className="text-destructive"
          />
        ) : personas.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5 text-muted-foreground" />}
            title={
              hasActiveFilters ? "Sin resultados" : "No hay personas registradas"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando los criterios de búsqueda por otro nombre o documento."
                : "Registra la primera persona natural para comenzar a estructurar la base institucional."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" type="button" onClick={resetFilters} className="gap-1.5">
                  <FilterX className="size-4" />
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button size="sm" type="button" onClick={openCreate} className="gap-1.5">
                  <Plus className="size-4" />
                  Crear Persona
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
              <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                {personas.map((persona) => (
                  <PersonaListItem
                    key={persona.id}
                    persona={persona}
                    onEdit={openEdit}
                    onDelete={(p) => setDeleting(p)}
                  />
                ))}
              </ul>
            </div>

            {personasQuery.data ? (
              <Pagination
                page={personasQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      {/* Form Dialog Modal */}
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

      {/* Help Guide Modal */}
      <PersonaHelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar persona "${deleting?.nombres} ${deleting?.primerApellido}"?`}
        description="Esta acción no se puede deshacer. Se eliminará el registro de esta persona del sistema."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}

