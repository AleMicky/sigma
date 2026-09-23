import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Users } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeletePersona } from "../api/persona.mutations"
import { personaQueries } from "../api/persona.queries"
import type { Persona } from "../api/persona.service"
import { PersonaFormDialog } from "../components/PersonaFormDialog"
import { PersonaHelpModal } from "../components/PersonaHelpModal"
import { PersonasFilters } from "../components/PersonasFilters"
import { PersonasHeader } from "../components/PersonasHeader"
import { PersonaTableView } from "../components/PersonaTableView"

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
      sortBy: "createdAt",
      direction: "DESC",
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
    <div className="flex w-full flex-col gap-6 px-2 pt-2 pb-6">
      <PersonasHeader
        isRefreshing={personasQuery.isFetching}
        onRefresh={() => personasQuery.refetch()}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenCreate={openCreate}
      />

      <PersonasFilters
        search={search.search}
        setSearch={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
      />

      {/* TABLE SECTION */}
      <div className="flex-1 w-full mt-1">
        <PersonaTableView
          personas={personas}
          isLoading={personasQuery.isFetching}
          page={personasQuery.data}
          onPageChange={search.setPage}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasActiveFilters
              ? "No se encontraron personas"
              : "No hay personas registradas"
          }
          emptyDescription={
            hasActiveFilters
              ? "No hay resultados para la búsqueda realizada."
              : "Registra personas naturales para la estructura de la organización."
          }
          emptyIcon={
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
              <Users className="size-8" />
            </div>
          }
          emptyAction={
            !hasActiveFilters && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Agregar Persona
              </Button>
            )
          }
        />
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <PersonaFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          persona={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar persona"
          description={`¿Estás seguro de que deseas eliminar a "${deleting.nombres} ${deleting.primerApellido}"?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}

      {helpModalOpen && (
        <PersonaHelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      )}
    </div>
  )
}
