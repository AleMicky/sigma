import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Briefcase, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteCargo } from "../api/cargo.mutations"
import { cargoQueries } from "../api/cargo.queries"
import type { Cargo } from "../api/cargo.service"
import { CargoFormDialog } from "../components/CargoFormDialog"
import { CargoHelpModal } from "../components/CargoHelpModal"
import { CargosFilters } from "../components/CargosFilters"
import { CargosHeader } from "../components/CargosHeader"
import { CargoTableView } from "../components/CargoTableView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function CargosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cargo | null>(null)
  const [deleting, setDeleting] = useState<Cargo | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteCargo()

  const cargosQuery = useQuery(
    cargoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const cargos = cargosQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    cargosQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(cargo: Cargo) {
    setEditing(cargo)
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
      <CargosHeader
        isRefreshing={cargosQuery.isFetching}
        onRefresh={() => cargosQuery.refetch()}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenCreate={openCreate}
      />

      <CargosFilters
        search={search.search}
        setSearch={search.setSearch}
        hasActiveFilters={hasActiveFilters}
        resetFilters={resetFilters}
      />

      {/* TABLE SECTION */}
      <div className="flex-1 w-full mt-1">
        <CargoTableView
          cargos={cargos}
          isLoading={cargosQuery.isFetching}
          page={cargosQuery.data}
          onPageChange={search.setPage}
          onEdit={openEdit}
          onDelete={setDeleting}
          emptyTitle={
            hasActiveFilters
              ? "No se encontraron cargos"
              : "No hay cargos registrados"
          }
          emptyDescription={
            hasActiveFilters
              ? "No hay resultados para la búsqueda realizada."
              : "Agrega cargos para definir la estructura laboral y ocupacional."
          }
          emptyIcon={
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary/60 shadow-inner">
              <Briefcase className="size-8" />
            </div>
          }
          emptyAction={
            !hasActiveFilters && (
              <Button onClick={openCreate} className="mt-4 gap-2">
                <Plus className="size-4" />
                Agregar Cargo
              </Button>
            )
          }
        />
      </div>

      {/* MODALS */}
      {dialogOpen && (
        <CargoFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          cargo={editing}
        />
      )}

      {deleting && (
        <ConfirmDeleteDialog
          open={true}
          onOpenChange={(isOpen) => !isOpen && setDeleting(null)}
          title="Eliminar cargo"
          description={`¿Estás seguro de que deseas eliminar el cargo "${deleting.nombre}"?`}
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      )}

      {helpModalOpen && (
        <CargoHelpModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      )}
    </div>
  )
}
